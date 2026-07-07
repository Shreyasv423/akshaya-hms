# 🏥 Akshaya HMS (Hospital Management System)

Akshaya HMS is a premium, modern, and production-grade Hospital Management System designed to handle clinical, administrative, billing, and operational workflows for a multi-specialty healthcare facility. 

Built with **React 19**, **TypeScript**, **Vite 7**, and secured by **Supabase (PostgreSQL)** with Row-Level Security (RLS) policies, Akshaya HMS is optimized for smooth, real-time performance and features a responsive premium glassmorphism interface.

---

## 🚀 Key Modules & Features

The system consists of **14 comprehensive modules** tailored to specific hospital roles:

### 1. 🔑 Authentication & Role-Based Access Control (RBAC)
*   **Secure Authentication**: Log in via Supabase Auth with custom role integration.
*   **Role Mapping**: Permissions are dynamically evaluated on the frontend and enforced in the database. 
*   **Supported Roles**:
    *   `admin` — Complete control over configuration, staff, settings, audit logs, and finances.
    *   `doctor` — Outpatient consultations, prescriptions, scheduling, and EMR access.
    *   `nurse` — Inpatient admissions, bed management, vitals monitoring, ICU tracking, and OT scheduling.
    *   `pharmacist` — Drug inventory, stock management, dispensing, and pharmacy sales.
    *   `lab_technician` — Lab test request queues, results entry, and report releases.
    *   `reception` — Front desk registrations, appointments, insurance claims, and billing checkout.

### 2. 🛡️ Administrator Dashboard (`src/modules/admin/`)
*   **Analytics Overview**: Track active IPD patients, occupied beds, daily OPD visits, pharmacy sales, and monthly revenues.
*   **Billing Settings (`BillingSettings.tsx`)**: Configure consultation fees, ward charges, ICU bed rates, laboratory test fees, and standard service costs.
*   **Security Audit Logs (`AuditLogs.tsx`)**: Track crucial database modifications, admin changes, and security events.

### 3. 👥 HR & Staff Management (`src/modules/hr/`)
*   **Staff Roster**: Manage employee lists, assign roles, contact details, and department allocations.
*   **Audit logs**: View active shifts and track administrative changes to staff roles.

### 4. 🗂️ Front Desk & Reception (`src/modules/frontdesk/`)
*   **Patient Intake**: Register new patients, issue unique hospital IDs, and edit demographic records.
*   **Queue Management**: Route walk-in patients directly to OPD, billing, or triage.

### 5. 🩺 Outpatient Department (OPD) (`src/modules/opd/`)
*   **Appointment Manager (`AppointmentForm.tsx`, `AppointmentList.tsx`)**: Book, reschedule, and cancel outpatient checkups.
*   **Doctor Consultations (`ConsultationForm.tsx`)**: Note symptoms, diagnoses, check history, and recommend clinical pathways.
*   **Prescriptions (`PrescriptionForm.tsx`)**: Digitally compile medicine prescriptions linked directly to the Pharmacy system.
*   **OPD Billing Modal (`OpdBillingModal.tsx`)**: Create quick receipts for outpatient appointments, lab work, or direct consultations.

### 6. 🛌 Inpatient Department (IPD) (`src/modules/ipd/`)
*   **Admissions Workflow (`AdmissionForm.tsx`, `AdmissionList.tsx`)**: Admit patients to specific wards (General, Semi-Private, Private, ICU).
*   **Ward Trackers**: Real-time status of admitted patients, treating doctors, and admission duration.

### 7. 🏥 Bed Management & Allocation (`src/modules/ipd/BedManagement.tsx`)
*   **Real-time Bed Mapping**: Visual map of all beds inside the hospital categorized by ward.
*   **Occupancy Tracker**: Instant visualization of occupied, reserved, and available beds. Includes automatic updates on patient admission or discharge.

### 8. 🚨 Intensive Care Unit (ICU) (`src/modules/icu/`)
*   **Vitals Dashboard (`IcuDashboard.tsx`)**: Real-time monitoring of ICU patient vitals (Heart Rate, SpO2, Blood Pressure, Temperature).
*   **Critical Alerts**: Visual alerts and system notifications for unstable vitals.
*   **Support Logging**: Monitor ventilator, oxygen therapy, or life-support settings.

### 9. 🔪 Operation Theatre (OT) (`src/modules/ot/`)
*   **OT Scheduler (`OtDashboard.tsx`)**: Queue surgeries, reserve theater rooms, and avoid scheduling conflicts.
*   **Surgical Staff Allocations**: Assign primary surgeons, assistants, anesthesiologists, and scrub nurses.
*   **Status Updates**: Monitor surgery status in real-time (Scheduled, In Progress, Completed, Post-Op recovery).

### 10. 📁 Electronic Medical Records (EMR) (`src/modules/emr/`)
*   **Unified Patient File (`EmrDashboard.tsx`)**: Longitudinal records compiling historical OPD consultations, IPD admissions, lab results, surgery logs, and pharmacy histories in a single timeline.

### 11. 🧪 Laboratory Dashboard (`src/modules/lab/`)
*   **Lab Orders Queue (`LabDashboard.tsx`)**: Track incoming doctor requests for diagnostics (Blood, Urine, Imaging, etc.).
*   **Result Entry**: Direct input of lab values and metrics with automatic range validation.
*   **Status Management**: Move orders seamlessly from *Pending Collection* to *Processing* and *Released*.

### 12. 💊 Pharmacy & Inventory (`src/modules/pharmacy/`)
*   **Stock Ledger (`PharmacyDashboard.tsx`)**: Maintain catalog of drugs, monitor stock counts, expiration dates, and low-inventory warnings.
*   **Sales POS**: Dispense medicines based on digital prescriptions and print receipts.

### 13. 💵 Billing & Invoices (`src/modules/billing/`)
*   **Central Invoice Register (`BillingDashboard.tsx`)**: Comprehensive ledger of paid, unpaid, and pending bills.
*   **IPD Billing (`IpdBillingModal.tsx`)**: Calculate aggregated room charges, nurse fees, doctor consultation costs, labs, and medicines for inpatient stays.

### 14. 🚪 Discharge Management (`src/modules/discharge/`)
*   **Discharge Summaries (`DischargeForm.tsx`)**: Log final diagnoses, follow-up advice, emergency instructions, and prescribed take-home drugs.
*   **Financial Clearance**: Restrict discharge approvals until active bills are fully settled or cleared by insurance.

---

## 🛠️ Tech Stack & Styling

*   **Core Framework**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
*   **Build System**: [Vite 7](https://vite.dev/)
*   **Database & Backend-as-a-Service**: [Supabase](https://supabase.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Charts**: [Recharts](https://recharts.org/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Styling**: Premium Custom Vanilla CSS styles (`src/index.css` & `src/App.css`) leveraging CSS Variables, glassmorphic blur panels (`.glass-panel`), and micro-animated premium card components (`.premium-card`).

---

## 🗄️ Database Schema & RLS Policies

The backend is backed by PostgreSQL on Supabase. Row-Level Security (RLS) is strictly enforced to protect sensitive health data.

### Database Tables:
*   `profiles` - Stores user credentials, emails, and RBAC roles (`admin`, `doctor`, etc.).
*   `beds` - Hospital beds, ward classifications, and occupancy indicators.
*   `hospital_settings` - Global variables like fee charts, service costs, and ward pricing.
*   `billing_records` - All financial invoices (OPD consultations, IPD aggregated stays).
*   `lab_tests` - Laboratory orders, results, and current processing state.
*   `pharmacy_sales` & `pharmacy_sale_items` - Pharmacy POS transaction histories and stock decrements.
*   `opd_billing` / `opd_bills` - Outpatient fees and transactions.
*   `ot_schedules` - Scheduled procedures, theater numbers, and clinical staff assignments.
*   `insurance_claims` - TPA logs, policy numbers, claim states, and approved amounts.
*   `audit_logs` - Immutable trail tracking system modifications and configuration updates.

### SQL Scripts Included:
*   [supabase_rls_fix.sql](file:///home/shreyasv/akshaya-hms/supabase_rls_fix.sql): Secures the five core transaction tables (`billing_records`, `lab_tests`, `pharmacy_sale_items`, `opd_billing`, `pharmacy_sales`) by enabling Row-Level Security.
*   [supabase_warnings_fix.sql](file:///home/shreyasv/akshaya-hms/supabase_warnings_fix.sql): Rectifies security loopholes.
    1.  Sets secure `search_path = public` on database trigger functions (e.g. `handle_new_user`) to block search-path injection.
    2.  Converts wide-open `USING (true)` and `WITH CHECK (true)` policies into secure user checks ensuring `auth.uid() IS NOT NULL`.

---

## 🇮🇳 India Bypass: Supabase DNS Proxy Fix

As of February 2026, the Indian government (MeitY) has blocked the default `supabase.co` domains on domestic ISPs. Akshaya HMS implements a resilient double-fallback system to guarantee 100% uptime in India:

### Option A: Vercel Production Rewrites (Automated)
The production bundle uses a reverse proxy configured in the root-level [vercel.json](file:///home/shreyasv/akshaya-hms/akshaya-hms/vercel.json). All client database calls are routed locally via the same server host (e.g., `/rest/v1/*` maps directly to Supabase APIs).
*   *Configured in:* `akshaya-hms/vercel.json`
*   *Url Mapping:* routes `/rest/v1/` and `/auth/v1/` directly to `https://isjgcavuisocwqnxkrzz.supabase.co` behind the scenes, bypassing the domestic ISP blocks.

### Option B: Cloudflare Worker Proxy (Development / Mobile testing)
For local testing or native mobile apps, you can spin up a free Cloudflare Worker:
1.  See full details in the [SUPABASE_FIX.md](file:///home/shreyasv/akshaya-hms/akshaya-hms/SUPABASE_FIX.md).
2.  Deploy the worker proxy script.
3.  Set the `VITE_SUPABASE_PROXY` environment variable to the worker URL.

---

## ⚙️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   Supabase Account & Project ID

### Installation & Run

1.  **Clone the Repository** and navigate to the project directory:
    ```bash
    cd akshaya-hms/akshaya-hms
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the `akshaya-hms/akshaya-hms` subdirectory:
    ```env
    VITE_SUPABASE_URL=https://isjgcavuisocwqnxkrzz.supabase.co
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    # Optional Cloudflare Worker proxy if testing in India without VPN:
    VITE_SUPABASE_PROXY=https://your-proxy.workers.dev
    ```

3.  **Seed Hospital Bed Data**
    Run the bed-seeding script to populate the `beds` database table with the initial 25 general, private, and ICU beds:
    ```bash
    # Ensure dependencies are installed for the seed script
    npm install dotenv @supabase/supabase-js
    node seed_beds.js
    ```

4.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Building & Deploying

### Production Build
To compile and bundle the React code using Vite:
```bash
npm run build
```

### Vercel Deployment
The app is fully compatible with Vercel deployment. Since it uses `vercel.json` for routing/rewrites, deploying the project is as simple as running:
```bash
vercel --prod
```
Ensure that you set the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your Vercel Dashboard settings.
