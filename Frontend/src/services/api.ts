import axios from 'axios';
import { RegisterData, Turf, Booking, Review, BookingPayload } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired.
      // Log the user out by clearing storage.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page with a message.
      // Using window.location to force a full page reload and state reset.
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?sessionExpired=true';
      }
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running. Please start your backend server at http://localhost:5000');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: RegisterData) => {
    const endpoint = userData.isAdmin ? '/api/admin/register' : '/api/users/register';
    // The isAdmin flag is for client-side routing, not part of the server payload.
    const { isAdmin, ...payload } = userData;
    return api.post(endpoint, payload);
  },
  
  login: (email: string, password: string, isAdmin = false) => {
    const endpoint = isAdmin ? '/api/admin/login' : '/api/users/login';
    // The backend determines the role from the endpoint, so the payload is the same.
    const payload = { email, password };
    return api.post(endpoint, payload);
  },
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: { name: string; phoneNumber: string }) => 
    api.put('/api/users/profile', data),
  getBookingHistory: () => api.get('/api/users/bookings'),
  getUpcomingBookings: () => api.get('/api/users/bookings/upcoming'),
};

// Admin API
export const adminAPI = {
  getProfile: () => api.get('/api/admin/profile'),
  updateProfile: (data: { name: string; phoneNumber: string }) => 
    api.put('/api/admin/profile', data),
  getTurfBookings: (turfId: string) => api.get(`/api/admin/turfs/${turfId}/bookings`),
  getDailyRevenue: (date: string, turfId?: string) => {
    const params = turfId ? { turfId } : {};
    return api.get(`/api/admin/revenue/daily/${date}`, { params });
  },
  getRevenueReport: (startDate: string, endDate: string, turfId?: string) => {
    const params = { startDate, endDate, ...(turfId && { turfId }) };
    return api.get('/api/admin/revenue/report', { params });
  },
  // Turf management
  createTurf: (formData: FormData) => api.post('/api/admin/turfs', formData),
  getAdminTurfs: () => api.get('/api/admin/turfs'),
  updateTurf: (turfId: string, formData: FormData) => 
    api.put(`/api/admin/turfs/${turfId}`, formData),
  deleteTurf: (turfId: string) => api.delete(`/api/admin/turfs/${turfId}`),
  toggleTurfStatus: (turfId: string, isActive: boolean) => 
    api.patch(`/api/admin/turfs/${turfId}/status`, { isActive }),
};

// Turf API
export const turfAPI = {
  getAllTurfs: () => api.get('/api/turfs'),
  searchTurfs: (params: { name?: string; location?: string }) => 
    api.get('/api/turfs/search', { params }),
  filterTurfs: (params: { name?: string; location?: string }) =>
    api.get('/api/turfs', { params }),
  getTurfDetails: (turfId: string) => api.get(`/api/turfs/${turfId}`),
  getTurfAvailability: (turfId: string, date: string) => 
    api.get(`/api/turfs/${turfId}/availability/${date}`),
};

// Booking API
export const bookingAPI = {
  createBooking: (bookingData: BookingPayload) => api.post('/api/bookings/create', bookingData),
  
  getBooking: (bookingId: string) => api.get(`/api/bookings/${bookingId}`),
  
  cancelBooking: (bookingId: string, cancellationReason: string) => 
    api.put(`/api/bookings/${bookingId}/cancel`, { cancellationReason }),
  
  submitReview: (bookingId: string, rating: number, review: string) => 
    api.post(`/api/bookings/${bookingId}/review`, { rating, review }),
};

// Payment API
export const paymentAPI = {
  createOrder: (amount: number, receipt: string) =>
    api.post('/api/payments/create-order', { amount, currency: 'INR', receipt }),
  
  verifyPayment: (paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => api.post('/api/payments/verify', paymentData),
};

// Reviews API
export const reviewsAPI = {
  getTurfReviews: (turfId: string) => api.get(`/api/reviews/turf/${turfId}`),
};