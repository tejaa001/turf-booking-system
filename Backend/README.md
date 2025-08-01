# TurfBook Backend

The robust and scalable backend for the TurfBook system. This RESTful API is built with Node.js and Express, providing all the necessary endpoints for user management, turf listings, bookings, and payments.

## Features

-   **Secure Authentication**: JWT-based authentication and authorization for users and admins.
-   **RESTful API**: Well-structured and documented API endpoints for all frontend functionalities.
-   **Turf Management**: Complete CRUD operations for managing turf facilities, including details and images.
-   **Real-time Booking**: Endpoints for creating, viewing, and managing user bookings.
-   **Payment Integration**: Secure payment processing with Razorpay, including order creation and payment verification.
-   **Admin Panel Support**: Specialized endpoints for admin dashboard analytics, revenue tracking, and management.
-   **Password Encryption**: Uses `bcryptjs` for secure hashing and storage of user passwords.

## Tech Stack

-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web framework for Node.js.
-   **MongoDB**: NoSQL database for storing application data.
-   **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js.
-   **JSON Web Token (JWT)**: For creating secure access tokens.
-   **Bcrypt.js**: Library for hashing passwords.
-   **Razorpay**: Payment gateway integration.
-   **Cors**: Middleware for enabling Cross-Origin Resource Sharing.
-   **Dotenv**: For managing environment variables.

## Getting Started

Follow these instructions to get the backend server up and running on your local machine.

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd "Turf Booking System/Backend"
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**

    Create a `.env` file in the root of the `Backend` directory. You can copy the example file if one exists, or create it from scratch.

    Update the `.env` file with your configuration, such as your MongoDB connection string and API keys. See the Environment Variables section for details.

4.  **Start the development server**
    ```bash
    npm run dev
    ```
    The server will start, typically on the port specified in your `.env` file (e.g., `http://localhost:5000`).

## Project Structure

```
.
├── config/         # Database configuration
├── controllers/    # Route handling logic (request/response)
├── middlewares/    # Custom middlewares (e.g., authentication, error handling)
├── models/         # Mongoose data models/schemas
├── routes/         # API route definitions
├── utils/          # Utility functions
├── .env.example    # Example environment variables
└── server.js       # Main application entry point
```

## API Endpoints

Here is a summary of the main API endpoints.

| Method | Endpoint                       | Description                                  | Access       |
| :----- | :----------------------------- | :------------------------------------------- | :----------- |
| `POST` | `/api/auth/register`           | Register a new user.                         | Public       |
| `POST` | `/api/auth/login`              | Authenticate a user and get a token.         | Public       |
| `GET`  | `/api/turfs`                   | Get all turfs (with filtering/searching).    | Public       |
| `GET`  | `/api/turfs/:id`               | Get a single turf by ID.                     | Public       |
| `POST` | `/api/turfs`                   | Create a new turf.                           | Admin        |
| `PUT`  | `/api/turfs/:id`               | Update a turf's details.                     | Admin        |
| `DELETE`| `/api/turfs/:id`              | Delete a turf.                               | Admin        |
| `GET`  | `/api/bookings`                | Get all bookings for the logged-in user.     | User/Admin   |
| `POST` | `/api/bookings`                | Create a new booking order with Razorpay.    | User         |
| `POST` | `/api/bookings/verify-payment` | Verify payment and confirm booking.          | User         |
| `GET`  | `/api/users/profile`           | Get the profile of the logged-in user.       | User         |
| `PUT`  | `/api/users/profile`           | Update the user's profile.                   | User         |
| `GET`  | `/api/admin/dashboard`         | Get dashboard statistics for the admin panel.| Admin        |
| `GET`  | `/api/admin/bookings`          | Get all bookings for the admin panel.        | Admin        |

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

-   `PORT`: The port for the server to run on (e.g., `5000`).
-   `MONGO_URI`: Your MongoDB connection string.
-   `JWT_SECRET`: A secret key for signing JWTs.
-   `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
-   `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
-   `NODE_ENV`: The application environment (e.g., `development` or `production`).

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.