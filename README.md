# Setup Instructions

## Prerequisites
- Docker & Docker Compose
- Node.js & NPM
- Expo Go app on your phone (Android/iOS)

## 1. Start the Backend & Database
Run the following command to start PostgreSQL, NestJS Backend, and Admin Panel:

```bash
docker-compose up --build -d
```

- **Backend API**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

## 2. Initialize Database
You need to push the Prisma schema to the database inside the container:

```bash
# Get the container ID of the backend
docker ps

# Run migration
docker exec -it <backend_container_id> npx prisma db push
```

## 3. Run Mobile Apps
You need to run these locally as they interact with the Expo ecosystem.

### Passenger App
```bash
cd passenger-app
npm install
npm start
```
Scan the QR code with Expo Go.

### Driver App
```bash
cd driver-app
npm install
npm start
```
Scan the QR code with Expo Go.

## 4. Usage Flow
1. **Register** a user on the Passenger App.
2. **Register** a user on the Driver App.
3. Open **Admin Panel** (http://localhost:3001/drivers) and **Approve** the driver.
4. On Driver App, toggle **Online**.
5. On Passenger App, **Request a Ride**.
6. Driver should receive a notification/popup to **Accept**.
