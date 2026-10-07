# CareConnect

CareConnect is a full-stack clinic management portal designed to streamline operations for patients, doctors, and clinic administrators.

## Project Structure

```text
CareConnect/
├── client/          # Frontend application (React + TypeScript + Vite + Tailwind CSS)
├── server/          # Backend application (Node.js + Express + TypeScript)
├── database/        # Database schema and seed scripts
├── .env.example     # Environment variable template
├── .gitignore       # Git ignore rules
└── README.md        # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MySQL (v8.0+ recommended)

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE careconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Execute the schema migration to create tables:
```bash
mysql -u <user> -p careconnect < database/schema.sql
```

3. (Optional) Populate development test data:
```bash
mysql -u <user> -p careconnect < database/seed.sql
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup
```bash
cd server
npm install
npm run dev
```

