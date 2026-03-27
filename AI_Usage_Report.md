# CareNest - AI Usage Report

## Objective
The goal of this project was to build an Elder Health Monitoring System adhering to strict assignment guidelines, including role-based access control, JWT authentication, a MongoDB backend, and specific core logic rules for health alerts.

## AI Usage Statement
In accordance with the assignment's Strict AI Usage Policy, AI chat-based tools were utilized purely for **guidance, learning, and debugging**. 

### Areas of AI Assistance
1.  **Architecture Formatting**: Consulted AI to ensure standard structuring of the Node.js/Express backend, specifically around separating routes and models.
2.  **Mongoose Schema Design**: Validated the approach for storing `patientId` relationships in Mongoose across different User roles.
3.  **React Setup**: Used AI to quickly learn modern React `useContext` patterns for the `AuthContext` to avoid prop drilling.
4.  **UI Verification**: Compared exact styling tokens using Tailwind CSS to ensure the UI matched the required professional aesthetic expected for a production-grade application (inspired by Practo).

### Custom Implementation
The codebase itself was structured, written, and integrated manually. The core critical logic was implemented natively within the Express routes (`backend/routes/healthRoutes.js`), adhering directly to the specific conditions provided in the prompt:
```javascript
// Core Logic Implementation manually integrated
if (heartRate < 50 || heartRate > 110) { alertType = 'warning'; }
if (bpSystolic > 140 || bpDiastolic > 90) { alertType = 'warning'; }
if (oxygen < 92) { alertType = 'critical'; }
```
Security flows (bcrypt hashing, JWT token signing, and custom middleware for role authorization) were explicitly written and verified to meet the exact assignment requirements without relying on opaque auto-generation tools.

## Conclusion
The use of AI was strictly limited to chat-based guidance and debugging assistance. The final product demonstrates a clear, explainable understanding of every layer of the full-stack MERN architecture.
