
import { createHmac } from "node:crypto"

const secret = process.env.ONTECH_WEBHOOK_SECRET

if (!secret) {
  throw new Error("Missing webhook secret")
}

const webhookUrl =
  "http://localhost:3000/api/webhooks/ontech"

const payload = {
  event: "payment.success",
  transaction_id: "OP-LOCAL-E2E-86ef0a94",
  app_reference: "ODINI-LOCAL-TEST-86ef0a94",
  amount: 1,
  currency: "ZMW",
  status: "success",
  provider: "Airtel",
  customer_phone: "0971234567",
  timestamp: new Date().toISOString(),
  nonce: "odini-local-86ef0a94-e2e-01",
}

// Python-compatible serialization for this
// flat test payload.
const canonical =
  "{" +
  Object.keys(payload)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}: ` +
        JSON.stringify(payload[key])
    )
    .join(", ") +
  "}"

const signature = createHmac("sha256", secret)
  .update(canonical, "utf8")
  .digest("hex")

async function send(label, signedValue) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Signature": signedValue,
      "X-Gateway-Event": payload.event,
      "X-Transaction-ID": payload.transaction_id,
      "X-Webhook-Timestamp": payload.timestamp,
      "X-Webhook-Nonce": payload.nonce,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  console.log(`\n${label}`)
  console.log("HTTP:", response.status)
  console.log("Result:", result)

  return {
    status: response.status,
    result,
  }
}

// Test 1: Fake signature must be rejected.
const invalid = await send(
  "TEST 1: Invalid signature",
  "0".repeat(64)
)

if (invalid.status !== 401) {
  throw new Error("Invalid signature was not rejected")
}

// Test 2: Real local signature processes
// the disposable payment.
const success = await send(
  "TEST 2: Successful payment",
  signature
)

if (
  success.status !== 200 ||
  success.result.result !== "processed_success"
) {
  throw new Error(
    "Payment processing did not succeed"
  )
}

// Test 3: Exact same webhook must not
// process the transaction twice.
const duplicate = await send(
  "TEST 3: Duplicate webhook",
  signature
)

if (
  duplicate.status !== 200 ||
  duplicate.result.result !== "duplicate_event"
) {
  throw new Error(
    "Duplicate webhook protection failed"
  )
}

console.log("\nPASS: All three tests passed")
