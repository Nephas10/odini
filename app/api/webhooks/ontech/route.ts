
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "node:crypto"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

type Json =
  | null
  | string
  | number
  | boolean
  | Json[]
  | { [key: string]: Json }

function pythonString(value: string): string {
  return JSON.stringify(value).replace(
    /[\u007f-\uffff]/g,
    (char) =>
      "\\u" +
      char.charCodeAt(0).toString(16).padStart(4, "0")
  )
}

// Match Ontech's documented:
// json.dumps(payload, sort_keys=True)
function pythonJSON(
  value: Json,
  floatFields: Set<string>,
  key = ""
): string {
  if (value === null) return "null"

  if (typeof value === "string") {
    return pythonString(value)
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false"
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("Invalid number")
    }

    if (
      Number.isInteger(value) &&
      floatFields.has(key)
    ) {
      return value.toFixed(1)
    }

    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return (
      "[" +
      value.map((item) =>
        pythonJSON(item, floatFields)
      ).join(", ") +
      "]"
    )
  }

  return (
    "{" +
    Object.keys(value)
      .sort()
      .map(
        (field) =>
          pythonString(field) +
          ": " +
          pythonJSON(
            value[field],
            floatFields,
            field
          )
      )
      .join(", ") +
    "}"
  )
}

function decodeSignature(
  header: string | null
): Buffer | null {
  if (!header) return null

  const signature = header
    .trim()
    .replace(/^sha256=/i, "")

  if (/^[0-9a-f]{64}$/i.test(signature)) {
    return Buffer.from(signature, "hex")
  }

  if (/^[A-Za-z0-9+/]{43}=?$/.test(signature)) {
    return Buffer.from(signature, "base64")
  }

  return null
}

function parseTimestamp(value: string): number {
  // A timestamp without timezone is interpreted
  // as UTC. Confirm this with a real Ontech delivery.
  const normalized =
    /(?:Z|[+-]\d{2}:\d{2})$/i.test(value)
      ? value
      : value + "Z"

  return Date.parse(normalized)
}

export async function POST(request: Request) {
  const secret = process.env.ONTECH_WEBHOOK_SECRET

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    )
  }

  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json")
  ) {
    return NextResponse.json(
      { error: "Expected JSON" },
      { status: 415 }
    )
  }

  const signature = decodeSignature(
    request.headers.get("x-webhook-signature")
  )

  if (!signature) {
    return NextResponse.json(
      { error: "Missing or invalid signature" },
      { status: 401 }
    )
  }

  let payload: Record<string, Json>
  const floatFields = new Set<string>()

  try {
    const rawBody = await request.text()

    if (Buffer.byteLength(rawBody) > 65536) {
      return NextResponse.json(
        { error: "Webhook too large" },
        { status: 413 }
      )
    }

    const parsed: Json = JSON.parse(
      rawBody,
      (
        key: string,
        value: unknown,
        context?: { source?: string }
      ) => {
        if (
          typeof value === "number" &&
          /[.eE]/.test(context?.source ?? "")
        ) {
          floatFields.add(key)
        }

        return value
      }
    )

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error("Invalid payload")
    }

    payload = parsed
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook JSON" },
      { status: 400 }
    )
  }

  // -------------------------------------
  // 1. VERIFY HMAC SIGNATURE
  // -------------------------------------

  let canonical: string

  try {
    canonical = pythonJSON(payload, floatFields)
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook payload" },
      { status: 400 }
    )
  }

  const expected = createHmac("sha256", secret)
    .update(canonical, "utf8")
    .digest()

  if (
    signature.length !== expected.length ||
    !timingSafeEqual(signature, expected)
  ) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    )
  }

  // -------------------------------------
  // 2. VALIDATE SIGNED PAYLOAD
  // -------------------------------------

  const {
    event,
    transaction_id,
    app_reference,
    amount,
    currency,
    status,
    nonce,
    timestamp,
  } = payload

  if (
    typeof event !== "string" ||
    typeof transaction_id !== "string" ||
    !transaction_id ||
    typeof app_reference !== "string" ||
    !app_reference ||
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    typeof currency !== "string" ||
    typeof status !== "string" ||
    typeof nonce !== "string" ||
    !nonce ||
    typeof timestamp !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing payment fields" },
      { status: 400 }
    )
  }

  // Check Ontech's transaction-related headers.
  if (
    request.headers.get("x-gateway-event") !==
      event ||
    request.headers.get("x-transaction-id") !==
      transaction_id ||
    request.headers.get("x-webhook-nonce") !==
      nonce
  ) {
    return NextResponse.json(
      { error: "Webhook header mismatch" },
      { status: 400 }
    )
  }

  // -------------------------------------
  // 3. CHECK TIMESTAMP FRESHNESS
  // -------------------------------------

  const signedTime = parseTimestamp(timestamp)
  const headerTime = request.headers.get(
    "x-webhook-timestamp"
  )

  if (
    !headerTime ||
    !Number.isFinite(parseTimestamp(headerTime)) ||
    !Number.isFinite(signedTime)
  ) {
    return NextResponse.json(
      { error: "Invalid webhook timestamp" },
      { status: 400 }
    )
  }

  const now = Date.now()

  // Temporary 48-hour window to allow delayed
  // delivery; nonce uniqueness blocks reprocessing.
  // Confirm Ontech's retry and timezone rules
  // before production.
  if (
    signedTime > now + 5 * 60 * 1000 ||
    signedTime < now - 48 * 60 * 60 * 1000
  ) {
    return NextResponse.json(
      { error: "Webhook timestamp out of range" },
      { status: 401 }
    )
  }

  // -------------------------------------
  // 4. ACCEPT ONLY SUPPORTED EVENTS
  // -------------------------------------

  const supported = [
    "payment.success",
    "payment.completed",
    "payment.failed",
  ]

  if (!supported.includes(event)) {
    // Reversals/refunds require separate processing.
    // Never silently acknowledge them as handled.
    if (
      event === "payment.reversed" ||
      event.startsWith("refund.")
    ) {
      console.error(
        "Ontech reversal/refund requires handling"
      )

      return NextResponse.json(
        { error: "Financial event not supported yet" },
        { status: 503 }
      )
    }

    return NextResponse.json({
      ok: true,
      ignored: true,
    })
  }

  // -------------------------------------
  // 5. SAFETY SWITCH
  // -------------------------------------

  if (
    process.env
      .ONTECH_WEBHOOK_PROCESSING_ENABLED !== "true"
  ) {
    return NextResponse.json(
      {
        verified: true,
        event,
        message:
          "Signature verified; database processing is disabled.",
      },
      { status: 503 }
    )
  }

  // -------------------------------------
  // 6. APPLY VERIFIED PAYMENT ATOMICALLY
  // -------------------------------------

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  const admin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await admin.rpc(
    "apply_ontech_payment_event",
    {
      p_reference: app_reference,
      p_transaction_id: transaction_id,
      p_event: event,
      p_status: status,
      p_amount: amount,
      p_currency: currency,
      p_nonce: nonce,
    }
  )

  if (error) {
    console.error(
      "Ontech payment processing failed:",
      error.message
    )

    // Failure is not acknowledged.
    // The gateway may retry delivery.
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    )
  }

  if (data === "payment_received_requires_review") {
    console.error(
      "Ontech payment received for a booking requiring review"
    )
  }

  return NextResponse.json({
    ok: true,
    result: data,
  })
}
