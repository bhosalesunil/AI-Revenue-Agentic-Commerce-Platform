# AI Agent & Controlled Tool Calling

## Controlled Tools
The AI Agent operates through 8 gated tools:
1. `searchProducts({ query, category, maxPrice })`
2. `getProductDetails({ productId })`
3. `createCart({ userId })`
4. `addToCart({ cartId, productId, quantity })`
5. `removeFromCart({ cartId, productId })`
6. `calculateCart({ cartId })`
7. `createCheckout({ cartId, customerName, customerEmail })`
8. `getPaymentStatus({ orderId })`

## Money Action Principles
- **Bounded**: Quantities and search boundaries are clamped to valid ranges.
- **Explainable**: The AI must output its rationale (e.g. why a companion mouse was recommended).
- **Gated**: All database writes and payment intents pass through the Money Security Guard.
