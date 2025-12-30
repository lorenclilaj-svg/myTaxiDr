# Taxi App (Albania) - Full Stack

A complete taxi application suite built with NestJS, Next.js, and React Native (Expo), tailored for the Albanian market.

## 🏗 Stack Overview

- **Backend**: NestJS, PostgreSQL (Prisma), Redis, Socket.IO
- **Admin Panel**: Next.js 14, Tailwind CSS, React Query
- **Mobile Apps**: React Native (Expo)
- **Infrastructure**: Docker Compose

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose** installed and running.
- **Node.js** (v18+) installed.
- **Expo Go** app installed on your Android/iOS device (for mobile testing).

### 1. Start the Backend & Admin Panel

The easiest way to run the core infrastructure is via Docker.

```bash
# 1. Build and start services
docker-compose up --build
```

This will start:
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **Backend**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3001`

### 2. Database Setup

Once the containers are running, you need to seed the initial Admin user.

```bash
# Open a new terminal
cd backend

# Install dependencies locally to run scripts
npm install

# Run the seed script
npm run prisma:seed
```

**Default Admin Credentials:**
- **Phone**: `0000000000`
- **Password**: `admin123`

### 3. Running the Mobile Apps

The mobile apps (Passenger & Driver) are built with Expo. You need to run them locally and connect via your phone.

**Important**:
1. Open `passenger-app/App.js` and `driver-app/App.js`.
2. Find the `BACKEND_URL` constant.
3. Replace `'http://192.168.1.10:3000'` with your computer's **Local IP Address** (e.g., `192.168.1.5:3000`). *Do not use localhost.*

#### Passenger App

```bash
cd passenger-app
npm install
npx expo start
```
Scan the QR code with Expo Go.

#### Driver App

```bash
cd driver-app
npm install
npx expo start
```
Scan the QR code with Expo Go.

## 📱 Usage Flow

1.  **Register a Driver**:
    - Open the **Driver App**.
    - Switch to "Register" mode.
    - Sign up with a phone number (e.g., `0690000002`).
    - *Note*: You cannot accept rides yet.

2.  **Approve the Driver (Admin)**:
    - Go to `http://localhost:3001/login`.
    - Login with default credentials (`0000000000` / `admin123`).
    - Go to the **Drivers** page.
    - Click "Approve" next to the new driver.

3.  **Go Online**:
    - Back in the **Driver App**, login.
    - Click "Go Online".

4.  **Request a Ride**:
    - Open the **Passenger App**.
    - Login/Register (e.g., `0690000001`).
    - Click "Request Ride".

5.  **Ride Lifecycle**:
    - The Driver will receive a popup alert.
    - Driver clicks "Accept".
    - Both screens update with status changes.
    - Admin Dashboard updates live.

## 🛠 Troubleshooting

- **Socket Connection Failed**: Ensure your phone and computer are on the same Wi-Fi network and you updated the IP in `App.js`.
- **Database Errors**: Ensure the Docker containers are healthy (`docker-compose ps`).
