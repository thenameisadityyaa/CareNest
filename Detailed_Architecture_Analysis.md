# CareNest - Detailed Architecture & Security Analysis

## 1. System Architecture Overview

CareNest is built on a scalable **MERN (MongoDB, Express, React, Node.js)** stack designed specifically for role-based healthcare monitoring.

### 1.1 Database Schema (MongoDB & Mongoose)
The core database architecture relies on a structured, relational-style User schema:
*   **Users Collection:** Handles both authentication and role-based permissions (`Parent`, `Child`, `Care Manager`).
*   **Many-to-Many Patient References:** The schema was explicitly upgraded to use a `patientIds` array `[{ type: ObjectId, ref: 'User' }]`. This ensures that in a production environment, a `Care Manager` can query and monitor dozens of distinct Elderly patients simultaneously without creating duplicate accounts.
*   **HealthData Collection:** Time-series style documents storing exact vitals (`heartRate`, `oxygen`, `bpSystolic`, `bpDiastolic`) strictly linked to the appropriate `patientId`.

### 1.2 REST API & Data Flow
The Express server handles stateless REST requests. State and sessions are entirely managed via JSON Web Tokens (JWT) to ensure horizontal scalability without server-side memory overhead.

## 2. Security & Production Readiness Measures

CareNest has been fortified against several common web vulnerabilities:

### 2.1 HTTP Header Protection (Helmet)
We integrated `helmet.js` to automatically set secure HTTP headers on all Express API responses:
*   **X-Frame-Options:** Set to `SAMEORIGIN` to prevent clickjacking attacks by ensuring CareNest cannot be embedded in malicious iframes.
*   **X-Content-Type-Options:** Prevents MIME-sniffing, forcing the browser to respect the `Content-Type` header sent by our server.
*   **Strict-Transport-Security (HSTS):** Enforces HTTPS usage (essential for a healthcare app).

### 2.2 Rate Limiting (DDoS Protection)
We integrated `express-rate-limit` globally:
*   **Policy:** A maximum of 100 requests per 15-minute window per IP address.
*   **Purpose:** Mitigates brute-force password guessing algorithms on the `/auth/login` endpoint and prevents API spam / Denial of Service attacks on the critical `/api/health` polling endpoint.

### 2.3 Cryptographic Security
*   **Password Hashing:** `bcryptjs` applies salt rounds (10) to secure passwords.
*   **Stateless Sessions:** JWT completely eliminates the need for CSRF tokens since authentication relies strictly on Authorization Bearer headers rather than session cookies.

## 3. The "Forgot Password" Email Flow
A fully weaponized production-ready password reset flow was engineered:
1.  **Token Generation:** `crypto.randomBytes(32)` creates a secure, mathematically robust hex key.
2.  **State Management:** The key, along with a strict 1-hour expiration timestamp (`resetPasswordExpires`), is saved to the User document in MongoDB.
3.  **Delivery System:** We integrated `nodemailer`. For secure assignment verification, it utilizes an ephemeral Ethereal test SMTP server to generate a secure recovery URL (`http://localhost:5173/reset-password/:token`).
4.  **Verification:** The `/auth/reset-password/:token` endpoint strictly enforces that the token must mathematically match MongoDB and strictly verifies the `$gt: Date.now()` expiration limitation before authorizing a `bcrypt` database overwrite.

## 4. Frontend Strategy
The frontend utilizes **Vite & React Context**. State (like the array of generated warnings) is completely decentralized away from local component props using `AuthContext` and `HealthDataContext`, avoiding "Prop Drilling".
The user interface exactly mirrors the clinical, high-trust blue-and-cyan design tokens of major health portals like Practo to establish psychological trust with the user.
