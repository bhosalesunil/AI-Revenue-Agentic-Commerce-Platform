# Payment Flow & Razorpay Verification

```
Customer/AI
   ↓
Cart
   ↓
POST /api/payments/create
   ↓
[Money Action Guard: Validate Cart & Compute Total from DB]
   ↓
Razorpay Orders API (amount in paise)
   ↓
Razorpay Checkout Modal / SDK
   ↓
User completes test payment
   ↓
Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   ↓
POST /api/payments/verify
   ↓
HMAC-SHA256 Signature Verification:
HMAC_SHA256(order_id + "|" + payment_id, secret) == signature
   ↓
[Valid] -> Order Status = PAID -> /payment/success
[Invalid] -> Payment Failed -> /payment/failed
```
