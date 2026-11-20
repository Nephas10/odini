
import { createHmac } from "node:crypto"

const secret = process.env.ONTECH_WEBHOOK_SECRET

if (!secret) {
  console.error("Missing ONTECH_WEBHOOK_SECRET")
  process.exit(1)
}

const url =
  "http://localhost:3000/api/webhooks/ontech"

// Simulated webhook — NOT a real transaction
const payload = {
  event: "payment.success",
  transaction_id: "OP-LOCAL-TEST-001",
  app_reference: "ODINI-LOCAL-TEST",
  amount: 1,
  currency: "ZMW",
  status: "success",
  provider: "Airtel",
  customer_phone: "0971234567",
  timestamp: new Date().toISOString(),
  nonce: "local-test-nonce-001",
}

// Match Python json.dumps(sort_keys=True)
// for this simple, flat test payload.
const canonical = (
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
)

const signature = createHmac("sha256", secret)
  .update(canonical, "utf8")
  .digest("hex")

async function sendTest(label, testSignature) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Signature": testSignature,
      "X-Gateway-Event": payload.event,
      "X-Transaction-ID": payload.transaction_id,
      "X-Webhook-Timestamp": payload.timestamp,
      "X-Webhook-Nonce": payload.nonce,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  console.log(`\n${label}`)
  console.log("HTTP Status:", response.status)
  console.log("Response:", result)

  return { status: response.status, result }
}

// Test 1: Correctly signed webhook
const valid = await sendTest(
  "TEST 1 — Valid Signature",
  signature
)

// Test 2: Incorrect signature
const invalid = await sendTest(
  "TEST 2 — Invalid Signature",
  "0".repeat(64)
)

const passed =
  valid.status === 500 &&
  valid.result.error === "Payment processing failed" &&
  invalid.status === 401

console.log(
  passed
    ? "\nPASS: Webhook integration checks passed."
    : "\nFAIL: Review webhook integration."
)

if (!passed) process.exitCode = 1
