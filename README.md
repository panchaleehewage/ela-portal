# English Literary Association (ELA) — Club Management Portal

An enterprise-grade club member and executive management portal developed for the **English Literary Association (ELA)**, secured with **WSO2 Asgardeo Identity & Access Management**.

---

## Overview & Problem Solved
University student clubs often struggle with manual event registrations, unverified attendance records, and non-transparent voting mechanisms. The **ELA Portal** provides a centralized, role-governed digital hub that enables:
- **Self-Service Member Onboarding:** Seamless sign-up and authentication powered by OpenID Connect (OIDC).
- **Granular Role-Based Access Control (RBAC):** Distinct capability tiers for General Members vs. Executive Board members (President, VPs, Secretaries).
- **Fortnightly Theme Voting with Vote-Locking:** Real-time polling with tamper-resistant 1-vote-per-member constraints.
- **Digital Member Literary Passport:** Tracking session attendance, club awards, and reading milestones.
- **Executive Board Console & CSV Attendance Exporter:** Event publishing and 1-click roster data exports for administrative records.

---

## WSO2 Asgardeo Integration Highlights
- **OIDC/OAuth 2.0 SPA Authentication:** Integrated via `@asgardeo/auth-react` to handle secure session lifecycle, authorization code flows with PKCE, and token decoding.
- **Role & Group Claim Mapping:** Custom claim mappings in Asgardeo project schemas allow client-side route guards (`ProtectedRoute`) to dynamically enforce role access without hardcoded user lists.
- **Identity Federation & Self-Registration:** Configured via the Asgardeo Admin Console to enable automated onboarding with zero server-side authentication overhead.

---

## Architecture & Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS (Custom ELA Brand Palette) + Lucide Icons
- **Identity & Access Management:** WSO2 Asgardeo
- **Persistence & Real-Time Engine:** Firebase Cloud Firestore
- **Routing & Route Guards:** React Router DOM v6

---

## Local Setup & Installation

### 1. Clone & Install Dependencies
\`\`\`bash
git clone https://github.com/panchaleehewage/ela-portal.git
cd ela-portal
npm install
\`\`\`

### 2. Configure Environment Variables
Create a \`.env\` file in the root directory:
\`\`\`env
VITE_ASGARDEO_CLIENT_ID=your_asgardeo_client_id
VITE_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_org_name
VITE_ASGARDEO_REDIRECT_URL=http://localhost:5173

VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`
Access the portal at \`http://localhost:5173\`.
