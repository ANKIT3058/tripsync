# TripSync - Hotel Booking Platform

A comprehensive full-stack hotel booking application built with Next.js, featuring real-time hotel search, secure payment processing, and admin management capabilities.

## 🚀 Features

### User Features
- **Hotel Search & Discovery** - Search hotels by location with real-time pricing
- **Detailed Hotel Views** - Comprehensive hotel and room information with photos
- **Secure Booking System** - Pessimistic locking prevents double bookings
- **Payment Processing** - Integrated Razorpay payment gateway with webhook support
- **Booking Management** - View and manage booking history
- **User Authentication** - Secure login/registration system

### Admin Features  
- **Admin Dashboard** - Comprehensive overview with statistics and analytics
- **Hotel Management** - Approve/reject hotels, edit details and photos
- **User Management** - View user accounts, suspend/unsuspend functionality
- **Support System** - Handle failed bookings, process refunds, manual confirmations
- **Payment Integration** - Direct links to Razorpay dashboard for payment management

### Technical Features
- **Pessimistic Locking** - 10-minute room locks prevent concurrent booking conflicts
- **Real-time API Integration** - EPS Rapid API for live hotel data and pricing
- **Webhook Processing** - Automated payment confirmation and booking finalization
- **Role-based Access Control** - Secure admin and user role separation
- **Responsive Design** - Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **Payments:** Razorpay Gateway with webhook support
- **External APIs:** EPS Rapid API for hotel data
- **Authentication:** NextAuth.js with JWT tokens
- **Deployment:** Vercel-ready configuration

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Razorpay account for payment processing
- EPS Rapid API access for hotel data

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd tripsync
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and configure:

```env
# Database Configuration
POSTGRES_URL="postgresql://user:password@localhost:5432/tripsync"
POSTGRES_PRISMA_URL="postgresql://user:password@localhost:5432/tripsync?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgresql://user:password@localhost:5432/tripsync?sslmode=disable"
POSTGRES_URL_NON_POOLING="postgresql://user:password@localhost:5432/tripsync"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-secret-key"

# Payment Gateway
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# External API
EPS_RAPID_API_KEY="your-eps-rapid-api-key"
EPS_RAPID_API_HOST="test.ean.com"
EPS_RAPID_BASE_URL="https://test.ean.com/v3"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🧪 Testing the Application

### Test Accounts (after seeding)
- **Admin:** `admin@tripsync.com` / `admin123`
- **User:** `user@example.com` / `user123`

### Complete Booking Flow Test

1. **User Registration/Login**
   - Navigate to `/auth/signup` to create new account
   - Or use test credentials to login

2. **Hotel Search**
   - Use search form on homepage
   - Try searching for "New York" or "Miami"
   - Verify real-time pricing integration

3. **Hotel Details & Room Selection**
   - Click on any hotel from search results
   - Review detailed hotel information
   - Select dates and number of guests
   - Choose a room type and click "Book Now"

4. **Booking Process**
   - Verify pessimistic locking (10-minute timer)
   - Complete guest information form
   - Review booking summary and pricing

5. **Payment Processing**
   - Click "Proceed to Payment"
   - Use Razorpay test credentials:
     - Card: `4111 1111 1111 1111`
     - Expiry: Any future date
     - CVV: Any 3 digits
   - Complete payment and verify confirmation

6. **Booking Management**
   - Visit `/bookings` to view booking history
   - Check booking status and details

### Admin Features Testing

1. **Login as Admin**
   - Use admin credentials: `admin@tripsync.com` / `admin123`

2. **Dashboard Overview**
   - Navigate to `/admin`
   - Review statistics and quick actions

3. **Hotel Management**
   - Go to `/admin/hotels`
   - Test approve/reject functionality
   - Edit hotel details and descriptions

4. **User Management**
   - Visit `/admin/users`
   - Test suspend/unsuspend user accounts
   - View user details and booking history

5. **Support System**
   - Navigate to `/admin/support`
   - View failed or problematic bookings
   - Test manual confirmation feature
   - Process refunds for test bookings

## 🏗️ Architecture Overview

The application follows a modern full-stack architecture:

- **Frontend:** Server-side rendered React with Next.js App Router
- **API Layer:** RESTful APIs with proper error handling and validation
- **Database:** PostgreSQL with Prisma ORM for type-safe queries
- **Authentication:** JWT-based sessions with role-based permissions
- **Payment Processing:** Secure integration with webhook verification
- **External Integration:** Real-time hotel data via EPS Rapid API
- **Concurrency Control:** Pessimistic locking prevents booking conflicts

The system is designed to be scalable, secure, and maintainable with clear separation of concerns and comprehensive error handling throughout.
