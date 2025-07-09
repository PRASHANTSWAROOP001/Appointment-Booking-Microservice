# AppointmentBooking

A full-stack appointment booking platform built with Node.js, Express, TypeScript, and Prisma. The system is designed with a microservices architecture, including Identity Service, User Service, and an API Gateway.

## Features

- User authentication and authorization (JWT-based)
- Role-based access (User, Seller, Admin)
- Shop and service management for sellers
- Location-based service search
- Booking creation, conflict checking, and history tracking
- Rate limiting and security best practices
- Environment configuration with dotenv
- Logging with Pino

## Project Structure

```
AppointmentBooking/
│
├── Api Gateway/
│   └── ... (API Gateway code)
│
├── Identity Service/
│   ├── prisma/
│   │   └── schema.prisma
│   └── ... (Identity microservice code)
│
├── User Service/
│   ├── prisma/
│   │   └── schema.prisma
│   └── ... (User microservice code)
│
├── package.json
└── readme.md
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL (or your preferred database, update `prisma/schema.prisma` accordingly)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/AppointmentBooking.git
   cd AppointmentBooking
   ```

2. **Install dependencies for each service:**
   ```bash
   cd "Identity Service"
   npm install
   cd ../"User Service"
   npm install
   cd ../"Api Gateway"
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in each service and update the values as needed.

4. **Set up the database:**
   ```bash
   # For each service with a Prisma schema
   npx prisma migrate dev
   ```

5. **Start the services:**
   ```bash
   # In each service directory
   npm run dev
   ```

## Usage

- Access the API Gateway endpoints for all client interactions.
- Use the Identity Service for authentication and user management.
- Use the User Service for booking, shop, and service management.

## Technologies Used

- Node.js, Express
- TypeScript
- Prisma ORM
- PostgreSQL (default, can be changed)
- JWT for authentication
- Pino for logging
- Zod for validation

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

ISC