# CareConnect

A full-stack clinic management platform with role-based dashboards for Patients, Doctors, and Administrators.

## Features

### Patient

- Patient dashboard
- Doctor search
- Appointment booking
- Appointment cancellation
- Appointment status tracking
- Vital recording and history
- Medical history
- Prescription viewing

### Doctor

- Doctor dashboard
- Appointment management
- Appointment status updates
- Patient directory and search
- Patient details
- Clinical notes
- Doctor profile management

### Admin

- Clinic overview
- Doctor management
- Patient management
- Appointment management
- System audit logs

---

## Tech Stack

### Frontend

- React
- TypeScript
- React Router
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database

- MySQL
- Relational database
- Foreign keys
- Seed data

---


### Authentication APIs

#### Register

POST /api/auth/register

Register a new user.

**Access:** Public

#### Login

POST /api/auth/login

Authenticate a user and return a JWT token.

**Access:** Public

#### Current User

GET /api/auth/me

Verify the JWT and return the currently authenticated user.

**Access:** Authenticated

## Patient APIs

All Patient APIs require a valid JWT and the `patient` role.

#### Get Doctors

```http
GET /api/patient/doctors
```

Returns active doctors available for appointment booking.

#### Get Appointments

```http
GET /api/patient/appointments
```

Returns appointments of the logged-in patient.

#### Book Appointment

```http
POST /api/patient/appointments
```

Creates a new appointment for the logged-in patient.

#### Cancel Appointment

```http
PATCH /api/patient/appointments/:id/cancel
```

Cancels a patient's appointment.

#### Get Vitals

```http
GET /api/patient/vitals
```

Returns the patient's recorded vitals.

#### Add Vital

```http
POST /api/patient/vitals
```

Records a new patient vital.

#### Medical History

```http
GET /api/patient/medical-history
```

Returns the patient's medical history.

#### Prescriptions

```http
GET /api/patient/prescriptions
```

Returns prescriptions belonging to the logged-in patient.

---

## Doctor APIs

All Doctor APIs require a valid JWT and the `doctor` role.

#### Doctor Overview

```http
GET /api/doctor/overview
```

Returns the doctor's dashboard overview.

#### Get Appointments

```http
GET /api/doctor/appointments
```

Returns appointments assigned to the logged-in doctor.

#### Update Appointment Status

```http
PATCH /api/doctor/appointments/:id/status
```

Updates appointment status such as `upcoming`, `in-progress`, or `completed`.

#### Get Patients

```http
GET /api/doctor/patients
```

Returns and searches patients associated with the doctor.

#### Get Patient Details

```http
GET /api/doctor/patients/:id
```

Returns details of a specific patient.

#### Get Clinical Notes

```http
GET /api/doctor/clinical-notes
```

Returns clinical notes.

#### Add Clinical Note

```http
POST /api/doctor/clinical-notes
```

Creates a clinical note containing diagnosis, treatment, and follow-up information.

#### Get Doctor Profile

```http
GET /api/doctor/profile
```

Returns the logged-in doctor's profile.

#### Update Doctor Profile

```http
PATCH /api/doctor/profile
```

Updates the logged-in doctor's profile.

---

## Admin APIs

All Admin APIs require a valid JWT and the `admin` role.

#### Admin Overview

```http
GET /api/admin/overview
```

Returns clinic overview statistics including doctors, patients, and appointments.

#### Get Doctors

```http
GET /api/admin/doctors
```

Returns doctors with search and filter support.

#### Add Doctor

```http
POST /api/admin/doctors
```

Creates a new doctor account and doctor profile.

#### Update Doctor Status

```http
PATCH /api/admin/doctors/:id/status
```

Updates doctor status such as `active`, `on-leave`, or `inactive`.

#### Get Patients

```http
GET /api/admin/patients
```

Returns and searches registered patients.

#### Add Patient

```http
POST /api/admin/patients
```

Creates a new patient account and patient profile.

#### Get All Appointments

```http
GET /api/admin/appointments
```

Returns all clinic appointments with search and filter support.

#### Audit Logs

```http
GET /api/admin/logs
```

Returns system audit logs including information, warnings, and errors.

---

## Authentication & Authorization

CareConnect uses JWT-based authentication and role-based authorization.

Request flow:

```text
Client
   ↓
JWT Bearer Token
   ↓
Authentication Middleware
   ↓
Role Authorization Middleware
   ↓
Controller
   ↓
Service Layer
   ↓
MySQL
```

Roles:

```text
patient
doctor
admin
```

The backend determines the authenticated user's identity and role rather than trusting the frontend for authorization.

---

## Database Schema

The application uses a relational MySQL database.

Main tables:

text
users
patients
doctors
appointments
vitals
medical_history
prescriptions
clinical_notes
system_logs
```

The database uses foreign keys to maintain relationships between users, patients, doctors, and clinical records.

Database scripts:

text
database/schema.sql
database/seed.sql
```

## Security

- Passwords are hashed using bcrypt.
- JWT is used for authenticated requests.
- Protected APIs use authentication middleware.
- Role-based middleware restricts access by user role.
- Patient data ownership is enforced at the backend.
- Server-side request validation is implemented.
- SQL queries use parameterized statements.
- Sensitive configuration is stored in environment variables.
- `.env` files are excluded from Git.

---

## Project Structure

```text
CareConnect/
│
├── client/
│   └── React frontend
│
├── server/
│   └── Express backend
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .env.example
├── .gitignore
└── README.md
```


## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jayeshpatil127/CareConnect.git
cd CareConnect
```

### 2. Setup MySQL

Create the database and run:

```text
database/schema.sql
database/seed.sql
```

### 3. Setup Backend

```bash
cd server
npm install
```

Configure the environment variables and start the server:

```bash
npm run dev
```

### 4. Setup Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend and backend run as separate applications.

## Demo Credentials

### Patient

text
Email: patient@careconnect.test
Password: Patient@123

### Doctor

text
Email: doctor@careconnect.test
Password: Doctor@123

### Admin

Email: admin@careconnect.test
Password: Admin@123

These credentials are provided for demonstration/testing purposes.

## Challenges Faced

- Implementing secure authentication and role-based authorization for multiple user roles.
- Maintaining patient data ownership and preventing unauthorized access.
- Designing a relational MySQL schema with appropriate foreign-key relationships.
- Connecting patient, doctor, and admin workflows through REST APIs.
- Persisting appointment status changes in the database.
- Maintaining loading, error, and empty states across multiple dashboards.
- Keeping the frontend and backend separated while integrating them through APIs.


## Future Improvements

- Add automated unit and integration tests.
- Add Docker-based deployment.
- Add appointment notifications and reminders.
- Improve production monitoring and observability.
- Add more advanced appointment scheduling and availability management.
- Deploy the application using production-grade infrastructure.


## Git Workflow

The project was developed using feature-based and fix-based commits.

Examples:

feat: add MySQL database schema
feat: implement patient appointment APIs
feat: implement patient vitals APIs
feat: implement patient medical history APIs
feat: implement patient prescription APIs
feat: implement doctor appointment APIs
feat: implement doctor management
feat: implement admin management
fix: resolve patient appointment flow
```

This keeps the development history traceable and makes individual features easier to review.