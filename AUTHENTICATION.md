# Authentication Documentation (Ecoomo E-Commerce)

This document describes the **authentication and authorization flow** used by the Ecoomo app.

## 1) Architecture summary

- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT (JSON Web Token)
- **Frontend**: React
- **Auth mechanism**: JWT bearer token

Flow:
1. User **registers** or **logs in**.
2. Backend returns a JWT **token**.
3. Frontend stores the response in `localStorage.userInfo`.
4. For protected requests, frontend sends:
   - `Authorization: Bearer <token>`
5. Backend `protect` middleware verifies the JWT and loads the user.
6. Admin-only routes additionally require `admin` middleware (checks `req.user.isAdmin`).

---

## 2) Data model

Backend user model (`backend/src/models/userModel.js`):
- `name` (string, required)
- `email` (string, required, unique)
- `password` (string, required, bcrypt-hashed)
- `isAdmin` (boolean, required, default `false`)

---

## 3) JWT token details

Token generation (`backend/src/utils/generateToken.js`):
- JWT payload: `{ id: <userId> }`
- Signed with `process.env.JWT_SECRET`.
- If `JWT_SECRET` is not set, a fallback secret string is used:
  - `supersecretjwtkeyforecoomowebsite12345`
- Expiration: **30 days** (`expiresIn: '30d'`)

### Important (security)
For production, you should always set `JWT_SECRET` and remove/avoid hardcoded fallbacks.

---

## 4) Backend authentication endpoints

Base URL:
- `http://localhost:5000/api`

### 4.1 Register a new user

- **Endpoint**: `POST /api/users`
- **Access**: Public

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "userPassword"
}
```

Response (success) returns a user payload + token:
```json
{
  "_id": "<mongoUserId>",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "<jwt>",
  "message": null
}
```

Failure cases:
- `400 { "message": "User already exists" }`

Implementation:
- `backend/src/controllers/userController.js` → `registerUser`
- Route: `backend/src/routes/userRoutes.js`

---

### 4.2 Login

- **Endpoint**: `POST /api/users/login`
- **Access**: Public

Request body:
```json
{
  "email": "john@example.com",
  "password": "userPassword"
}
```

Response (success):
```json
{
  "_id": "<mongoUserId>",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "<jwt>"
}
```

Failure cases:
- `401 { "message": "Invalid email or password" }`

Implementation:
- `backend/src/controllers/userController.js` → `authUser`
- Route: `backend/src/routes/userRoutes.js`

---

### 4.3 Get user profile (protected)

- **Endpoint**: `GET /api/users/profile`
- **Access**: Private (`protect`)

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "_id": "<mongoUserId>",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false
}
```

Implementation:
- `backend/src/controllers/userController.js` → `getUserProfile`
- Route: `backend/src/routes/userRoutes.js`

---

### 4.4 Update user profile (protected)

- **Endpoint**: `PUT /api/users/profile`
- **Access**: Private (`protect`)

Headers:
- `Authorization: Bearer <token>`

Request body (fields are optional):
```json
{
  "name": "New Name",
  "email": "new@example.com",
  "password": "newPassword"
}
```

Response (success):
```json
{
  "_id": "<mongoUserId>",
  "name": "Updated Name",
  "email": "updated@example.com",
  "isAdmin": false,
  "token": "<new-jwt>"
}
```

Notes:
- If `password` is provided, it is hashed with bcrypt before saving.
- Backend regenerates and returns a **new token**.

Implementation:
- `backend/src/controllers/userController.js` → `updateUserProfile`

---

### 4.5 List all users (admin only)

- **Endpoint**: `GET /api/users`
- **Access**: Admin only (`protect + admin`)

Implementation:
- Route: `backend/src/routes/userRoutes.js`
- Controller: `getUsers`

Returns an array of users with passwords excluded.

---

## 5) Backend authorization middleware

### 5.1 `protect` middleware
File: `backend/src/middleware/authMiddleware.js`

Checks:
1. Verifies `Authorization` header exists and starts with `Bearer`.
2. Extracts token.
3. `jwt.verify(token, JWT_SECRET)`.
4. Loads `User.findById(decoded.id)`.
5. Sets `req.user` and removes password from the returned user object.

Errors:
- Missing header/token:
  - `401 { "message": "Not authorized, no token" }`
- Token invalid/verify failed:
  - `401 { "message": "Not authorized, token failed" }`
- User not found:
  - `401 { "message": "Not authorized, user not found" }`

---

### 5.2 `admin` middleware
File: `backend/src/middleware/authMiddleware.js`

If `req.user.isAdmin` is true → allow.
Else → `403 { "message": "Not authorized as an admin" }`.

---

## 6) Protected routes overview (orders/products)

### Products (`backend/src/routes/productRoutes.js`)
- `GET /api/products` → public
- `POST /api/products` → `protect + admin`
- `PUT /api/products/:id` → `protect + admin`
- `DELETE /api/products/:id` → `protect + admin`

---

### Orders (`backend/src/routes/orderRoutes.js`)
- `POST /api/orders` → `protect`
- `GET /api/orders` → `protect + admin`
- `GET /api/orders/myorders` → `protect`
- `GET /api/orders/:id` → `protect`
- `PUT /api/orders/:id/pay` → `protect`
- `PUT /api/orders/:id/deliver` → `protect + admin`

---

## 7) Frontend authentication flow

### 7.1 Auth state storage
File: `frontend/src/contexts/AuthContext.jsx`

- On mount, reads:
  - `localStorage.getItem('userInfo')`
- If present, sets `user` state to the parsed JSON.

`logout()`:
- clears `user` state
- removes `localStorage.userInfo`

### 7.2 Login / Register calls
From `AuthContext.jsx`:
- Login:
  - `POST /api/users/login`
- Register:
  - `POST /api/users`

On success:
- sets `user` state with backend response (including `token`)
- writes it to `localStorage.userInfo`

### 7.3 Protected API calls (Bearer header)
Examples:
- Orders list:
  - `GET /api/orders/myorders`
  - header: `Authorization: Bearer ${user.token}`
- Create order:
  - `POST /api/orders`
  - header: `Authorization: Bearer ${user.token}`
- Admin endpoints:
  - same header + admin routes handled by backend `admin` middleware.

---

## 8) Example curl commands

### Register
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"user123"}'
```

### Login (get token)
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"user123"}'
```

### Call a protected endpoint
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <jwt-token>"
```

---

## 9) Status & limitations to be aware of
- This project uses a client-side stored JWT in `localStorage`. This is convenient but can increase XSS impact compared to httpOnly cookies.
- JWT secret fallback exists in code; production deployments should set `JWT_SECRET`.

---

## 10) Where to look in the code
- JWT generation: `backend/src/utils/generateToken.js`
- Auth middleware: `backend/src/middleware/authMiddleware.js`
- User controller: `backend/src/controllers/userController.js`
- User routes: `backend/src/routes/userRoutes.js`
- Frontend auth state: `frontend/src/contexts/AuthContext.jsx`
- Frontend auth UI: `frontend/src/pages/Auth.jsx`

