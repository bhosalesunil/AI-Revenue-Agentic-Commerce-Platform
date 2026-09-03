# Security Architecture & Explainability

## 1. Zero Price Hallucination
LLM-generated text can never dictate the checkout price. Even if a prompt injection attempts to set:
`{ "amount": 10 }`
The backend `MoneySecurityGuard` completely disregards any client or AI proposed price and recalculates the exact amount by querying canonical product records.

## 2. Immutable Agent Audit Trail
Every action taken by the AI agent is recorded in the `AgentEvent` store with:
- Timestamp
- Event Type
- Tool Name
- Input Arguments
- Output Result
- Security Bound check status
- Human-readable Justification

## 3. Cryptographic Signature Verification
Razorpay payments are verified using HMAC-SHA256 digests. Tampered or replayed webhook callbacks are immediately rejected.
