# Turf Booking System

A full-stack web application for booking sports turfs. This project includes a modern frontend built with React and a robust backend API powered by Node.js.

This repository contains the complete source code for both the client-side and server-side applications.

## Project Components

This monorepo contains two main packages:

-   `./Frontend`: A responsive client-side application built with React, TypeScript, and Tailwind CSS. See the Frontend README for more details.
-   `./Backend`: A RESTful API built with Node.js, Express, and MongoDB to handle all business logic, data storage, and payments. See the Backend README for more details.

## High-Level Features

-   **Dual User Roles**: Separate interfaces and functionalities for regular users and administrators.
-   **Secure Authentication**: JWT-based login and registration for both users and admins.
-   **Dynamic Turf Listings**: Admins can manage turf details, including images, pricing, and amenities.
-   **Advanced Search & Filter**: Users can easily find turfs by name, location, and availability.
-   **Real-time Booking System**: A seamless booking process with real-time slot availability checks.
-   **Integrated Payment Gateway**: Secure online payments handled by Razorpay.
-   **Comprehensive Dashboards**:
    -   **User Dashboard**: View booking history, manage profile, and submit reviews.
    -   **Admin Dashboard**: Overview of bookings, revenue tracking, and turf management.

## Tech Stack

| Area      | Technology                                                               |
| :-------- | :----------------------------------------------------------------------- |
| **Frontend**  | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide React |
| **Backend**   | Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt.js, Razorpay, Cors      |

## Getting Started

To get the full application running locally, you'll need to start both the backend server and the frontend client in separate terminal sessions.

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   MongoDB (local instance or a cloud service like MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Turf Booking System"
```

### 2. Setup & Run the Backend

Open a new terminal for the backend server.

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Create a .env file and add your environment variables
# (MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, etc.)
# You can copy the .env.example if it exists

# Start the backend server
npm run dev
```

The API will be running on the port specified in your `.env` file (e.g., `http://localhost:5000`).

### 3. Setup & Run the Frontend

Open a second terminal for the frontend client.

```bash
# Navigate to the frontend directory from the root
cd Frontend

# Install dependencies
npm install

# Create a .env file and point it to your backend API and Razorpay key
# Example .env content:
# VITE_API_URL=http://localhost:5000
# VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Start the frontend development server
npm run dev
```

The frontend application will be available at `http://localhost:5173` (or another port specified by Vite). You can now access the application in your browser.

## License

This project is licensed under the MIT License.
