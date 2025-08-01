import * as authService from '../services/authService.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js'; // Import the Booking model directly
// import * as bookingService from '../services/bookingService.js'; // We are bypassing the service for this function
import asyncHandler from '../middleware/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res, next) => {
  // The authService handles hashing the password and creating the user
  const createdUser = await authService.registerUser(req.body);

  // Send a success response, avoiding sending back the password
  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    },
  });
});

export const updateUserProfile = asyncHandler(async (req, res, next) => {
  // The user ID is securely taken from the token via the `isAuthenticated` middleware
  const userId = req.user.id;
  const updateData = req.body;

  // The `validateBody` middleware with `stripUnknown: true` already removes unwanted fields.
  // This is an extra safeguard to prevent updating sensitive fields like 'role'.
  delete updateData.role;
  delete updateData.password;

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true, // Return the modified document
    runValidators: true, // Ensure schema validations are applied
  }).select('-password'); // Exclude the password from the response

  if (!updatedUser) {
    return res.status(404).json({ status: 'error', message: 'User not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});

export const getBookings = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query; // Pagination from query

  // By building the query directly in the controller, we bypass the service layer
  // to confirm if the query logic and data are correct. This is a robust way to isolate the issue.
  const query = {
    userId, // Filter by the authenticated user
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (req.path.includes('/upcoming')) {
    // For the '/upcoming' route, get bookings from today onwards.
    query.bookingDate = { $gte: startOfToday };
  } else {
    // For the base '/bookings' route, get past bookings (history).
    query.bookingDate = { $lt: startOfToday };
  }

  // Manually handle pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Define the sort order based on the route to ensure logical ordering.
  const sortOrder = {};
  if (req.path.includes('/upcoming')) {
    // For upcoming bookings, show the nearest dates first (ascending).
    sortOrder.bookingDate = 1;
  } else {
    // For booking history, show the most recent past bookings first (descending).
    sortOrder.bookingDate = -1;
  }

  // Execute the query using the Booking model
  const docs = await Booking.find(query)
    .populate('turfId', 'turfName address images') // Populate turf details for the response
    .sort(sortOrder) // Apply dynamic sorting
    .skip(skip)
    .limit(limitNum);

  // Get the total count for pagination metadata
  const totalDocs = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    // Construct the response in the expected format
    data: { docs, totalPages: Math.ceil(totalDocs / limitNum), currentPage: pageNum },
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  // The authService.login handles finding the user and verifying the password.
  // We pass isAdmin: false to specify we are looking for a regular user.
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password, isAdmin: false });
  // Sanitize the user object to avoid sending the password hash
  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  res.status(200).json({ status: 'success', data: { user: userResponse, token } });
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  // The `isAuthenticated` middleware has already fetched the user and attached it to req.user.
  // The password field is also already excluded.
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});