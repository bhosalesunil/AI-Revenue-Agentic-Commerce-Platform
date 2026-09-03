# SellPilot API Specification

## 1. Authentication
- `POST /api/auth/login`: Authenticate merchant or customer session.
- `POST /api/auth/register`: Create user session.
- `GET /api/auth/me`: Get active session.

## 2. Products
- `GET /api/products`: Query catalog by `category`, `query`, and `maxPrice`.
- `POST /api/products`: Create a new catalog item.
- `GET /api/products/:id`: Get product specifications.
- `PATCH /api/products/:id`: Update stock or price.
- `DELETE /api/products/:id`: Remove product.

## 3. Cart
- `GET /api/cart?cartId=default_cart`: Retrieve verified cart items, subtotal, and total.
- `POST /api/cart/add`: Add product (`{ productId, quantity, cartId }`).
- `POST /api/cart/remove`: Remove item (`{ productId, cartId }`).
- `DELETE /api/cart`: Clear cart.

## 4. Orders & Payments
- `GET /api/orders`: List merchant orders.
- `GET /api/orders/:id`: Get order breakdown.
- `POST /api/payments/create`: Validate cart, generate server order, and create Razorpay test order.
- `POST /api/payments/verify`: Cryptographically verify Razorpay HMAC-SHA256 signature and mark order PAID.
- `POST /api/payments/webhook`: Webhook handler for external Razorpay events.

## 5. AI Commerce & Tools
- `POST /api/ai/chat`: Interactive conversational agent endpoint.
- `GET /api/ai/recommendations`: Retrieve companion upsell recommendations.
- `POST /api/ai/tools`: Direct tool execution endpoint for testing/integrations.

## 6. Machine-Readable Agentic Catalog
- `GET /api/ai-catalog`: Machine-readable JSON schema for external autonomous AI buyers to discover merchant inventory and transact programmatically.
