
import { NextResponse } from "next/server"
import {
  createClient as createAdminClient,
} from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

type OntechResponse = {
  success?: boolean
  transaction_id?: string
  status?: string
  message?: string
  amount?: number
  provider?: string
}

function normalizePhone(input: string) {
  const value = input.replace(/[\s()+-]/g, "")

  // Local mobile money format: 09XXXXXXXX
  if (/^09\d{8}$/.test(value)) {
    return value
  }

  // International format: 260XXXXXXXXX
  if (/^260\d{9}$/.test(value)) {
    return value
  }

  return null
}

export async function POST(request: Request) {
  // --------------------------------------
  // 1. SAFETY SWITCH
  // --------------------------------------

  if (
    process.env.ONTECH_PAYMENTS_ENABLED !== "true"
  ) {
    return NextResponse.json(
      {
        error:
          "Ontech payment requests are not enabled yet.",
      },
      { status: 503 }
    )
  }

  // --------------------------------------
  // 2. ENVIRONMENT CONFIGURATION
  // --------------------------------------

  const apiKey =
    process.env.PAYMENT_GATEWAY_API_KEY

  const baseUrl =
    process.env.PAYMENT_GATEWAY_BASE_URL

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (
    !apiKey ||
    !baseUrl ||
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return NextResponse.json(
      {
        error:
          "Payment service is not configured.",
      },
      { status: 503 }
    )
  }

  let endpoint: string

  try {
    const url = new URL(
      "pay/collect",
      baseUrl.replace(/\/+$/, "") + "/"
    )

    if (url.protocol !== "https:") {
      throw new Error("HTTPS required")
    }

    endpoint = url.toString()
  } catch {
    return NextResponse.json(
      { error: "Invalid payment gateway URL." },
      { status: 503 }
    )
  }

  // --------------------------------------
  // 3. AUTHENTICATE THE GUEST
  // --------------------------------------

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 }
    )
  }

  // --------------------------------------
  // 4. VALIDATE REQUEST BODY
  // --------------------------------------

  let body: Record<string, unknown>

  try {
    const parsed: unknown = await request.json()

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid body")
    }

    body = parsed as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    )
  }

  const bookingId = body.bookingId
  const phone = body.phone

  if (
    typeof bookingId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      bookingId
    ) ||
    typeof phone !== "string"
  ) {
    return NextResponse.json(
      {
        error:
          "A valid booking ID and phone are required.",
      },
      { status: 400 }
    )
  }

  const mobileNumber = normalizePhone(phone)

  if (!mobileNumber) {
    return NextResponse.json(
      {
        error:
          "Enter a valid Zambian mobile money number.",
      },
      { status: 400 }
    )
  }

  // --------------------------------------
  // 5. SERVER-ONLY SUPABASE CLIENT
  // --------------------------------------

  // This client bypasses RLS.
  // It must never be imported by client code.
  const admin = createAdminClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // --------------------------------------
  // 6. LOAD GUEST'S BOOKING
  // --------------------------------------

  const {
    data: booking,
    error: bookingError,
  } = await admin
    .from("bookings")
    .select(`
      id,
      listing_id,
      user_id,
      status,
      payment_status,
      amount_paid,
      total_amount,
      customer_name
    `)
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (bookingError) {
    console.error(
      "Booking lookup failed:",
      bookingError.message
    )

    return NextResponse.json(
      { error: "Unable to load booking." },
      { status: 500 }
    )
  }

  if (!booking) {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 }
    )
  }

  // --------------------------------------
  // 7. CHECK BOOKING STATUS
  // --------------------------------------

  if (booking.status !== "confirmed") {
    return NextResponse.json(
      {
        error:
          "The host must confirm your booking before payment.",
      },
      { status: 409 }
    )
  }

  if (
    booking.payment_status === "paid" ||
    Number(booking.amount_paid ?? 0) > 0
  ) {
    return NextResponse.json(
      {
        error:
          "This booking already has a recorded payment.",
      },
      { status: 409 }
    )
  }

  // --------------------------------------
  // 8. VERIFY EVENT TYPE
  // --------------------------------------

  const {
    data: listing,
    error: listingError,
  } = await admin
    .from("listings")
    .select("id, title, listing_type")
    .eq("id", booking.listing_id)
    .maybeSingle()

  if (listingError || !listing) {
    return NextResponse.json(
      { error: "Event listing not found." },
      { status: 404 }
    )
  }

  if (listing.listing_type !== "event") {
    return NextResponse.json(
      {
        error:
          "This endpoint only accepts event payments.",
      },
      { status: 400 }
    )
  }

  // --------------------------------------
  // 9. READ THE AGREED BOOKING TOTAL
  // --------------------------------------

  if (booking.total_amount == null) {
    return NextResponse.json(
      {
        error:
          "This booking has no saved total. Payment cannot proceed until it is reviewed.",
      },
      { status: 422 }
    )
  }

  const amount = Number(booking.total_amount)

  // Convert to integer ngwee for validation.
  const amountNgwee = Math.round(amount * 100)

  if (
    !Number.isFinite(amount) ||
    !Number.isSafeInteger(amountNgwee) ||
    amountNgwee <= 0 ||
    amount > 9999999999.99
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid payment amount. Free events do not require payment.",
      },
      { status: 422 }
    )
  }

  const paymentAmount = amountNgwee / 100

  // --------------------------------------
  // 10. PREVENT DUPLICATE PAYMENT ATTEMPTS
  // --------------------------------------

  // One attempt per booking initially.
  // We'll add verified retries later.
  const reference = `ODINI-EVT-${booking.id}-1`

  const {
    data: existingPayments,
    error: historyError,
  } = await admin
    .from("payments")
    .select("id, status")
    .eq("booking_id", booking.id)
    .limit(1)

  if (historyError) {
    return NextResponse.json(
      {
        error:
          "Unable to check payment history.",
      },
      { status: 500 }
    )
  }

  if (existingPayments?.length) {
    return NextResponse.json(
      {
        error:
          "A payment attempt already exists. Check its outcome before trying again.",
        paymentStatus: existingPayments[0].status,
      },
      { status: 409 }
    )
  }

  // --------------------------------------
  // 11. CREATE A PENDING PAYMENT
  // --------------------------------------

  const {
    data: payment,
    error: insertError,
  } = await admin
    .from("payments")
    .insert({
      booking_id: booking.id,
      provider: "ontech",
      reference,
      amount: paymentAmount,
      currency: "ZMW",
      phone: mobileNumber,
      status: "pending",
    })
    .select("id")
    .single()

  if (insertError || !payment) {
    // The unique reference prevents two
    // simultaneous requests from using
    // this same payment attempt.
    console.error(
      "Payment insert failed:",
      insertError?.message
    )

    return NextResponse.json(
      {
        error:
          "Unable to create payment attempt. Check its status before retrying.",
      },
      { status: 409 }
    )
  }

  // --------------------------------------
  // 12. CALL ONTECH COLLECTION API
  // --------------------------------------

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "X-Idempotency-Key": reference,
      },
      body: JSON.stringify({
        amount: paymentAmount,
        phone: mobileNumber,
        reference,
        description: `ODINI Event: ${listing.title}`,
        customer_name:
          booking.customer_name ?? "",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    })

    const result: OntechResponse =
      await response.json().catch(() => ({}))

    const transactionId =
      typeof result.transaction_id === "string"
        ? result.transaction_id
        : null

    // --------------------------------------
    // 13. RECORD THE TRANSACTION ID
    // --------------------------------------

    if (transactionId) {
      const { error: updateError } = await admin
        .from("payments")
        .update({
          provider_transaction_id: transactionId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)

      if (updateError) {
        console.error(
          "Transaction ID save failed:",
          updateError.message
        )

        return NextResponse.json(
          {
            error:
              "Ontech responded, but the transaction ID could not be saved. Do not retry yet.",
          },
          { status: 502 }
        )
      }
    }

    if (!response.ok || result.success !== true) {
      return NextResponse.json(
        {
          ok: false,
          paymentId: payment.id,
          status: "pending",
          message:
            "The payment request could not be confirmed. Check its outcome before retrying.",
        },
        { status: 502 }
      )
    }

    // IMPORTANT:
    // Even if the provider response says
    // "success", leave the payment pending
    // until we've implemented verification.
    return NextResponse.json({
      ok: true,
      paymentId: payment.id,
      transactionId,
      status: "pending_verification",
      amount: paymentAmount,
      currency: "ZMW",
      message:
        "Payment request received. Awaiting verified payment confirmation.",
    })

  } catch (error) {
    console.error(
      "Ontech collection error:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    )

    // We cannot safely assume whether
    // Ontech processed a timed-out request.
    return NextResponse.json(
      {
        ok: false,
        paymentId: payment.id,
        status: "unknown",
        message:
          "Payment outcome unknown. Do not submit another request until this attempt is checked.",
      },
      { status: 504 }
    )
  }
}
