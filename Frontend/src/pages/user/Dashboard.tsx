import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  History,
  User as UserIcon,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, bookingAPI } from '../../services/api';
import { Booking, User } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ReviewModal from '../../components/Common/ReviewModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<User | null>(user);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      const turfName = location.state.turfName || 'your turf';
      setBookingSuccessMessage(`Successfully booked ${turfName}! It's now in your upcoming bookings.`);
      // Clear location state to prevent message from showing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleReviewSubmit = async (bookingId: string, rating: number, review: string) => {
    await bookingAPI.submitReview(bookingId, rating, review);
    setReviewingBooking(null);
    setReviewSuccessMessage('Thank you for your review!');
    // Optimistically update the UI to hide the review button
    setBookingHistory(prev => 
      prev.map(b => (b._id === bookingId ? { ...b, review: 'submitted' } : b))
    );
    // Hide the success message after 5 seconds
    setTimeout(() => setReviewSuccessMessage(null), 5000);
  };

  // This function adapts the API response (which has populated `turfId` and `bookingStatus`)
  // to the frontend's expected Booking type (which uses `turf` and `status`).
  const transformApiBooking = (apiBooking: any): Booking => {
    const { bookingStatus, turfId, timeSlots, timeSlot, ...rest } = apiBooking;
    // The backend might send `timeSlots` for multi-slot bookings,
    // or a single `timeSlot` for older ones. We normalize it here.
    const finalTimeSlots = Array.isArray(timeSlots) && timeSlots.length > 0 ? timeSlots : undefined;

    return {
      ...rest,
      turfId: typeof turfId === 'object' && turfId !== null ? turfId._id : turfId,
      status: bookingStatus,
      turf: typeof turfId === 'object' && turfId !== null ? turfId : undefined,
      timeSlots: finalTimeSlots,
      timeSlot: !finalTimeSlots ? timeSlot : undefined,
    };
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        const [profileRes, upcomingRes, historyRes] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getUpcomingBookings(),
          userAPI.getBookingHistory(),
        ]);

        // Safely access nested profile data
        const profileData =
          profileRes.data?.data?.user ||
          profileRes.data?.data ||
          profileRes.data;
        if (profileData) {
          setProfile(profileData);
        }

        const upcomingData = upcomingRes.data?.data?.docs || upcomingRes.data?.data || upcomingRes.data || [];
        const historyData = historyRes.data?.data?.docs || historyRes.data?.data || historyRes.data || [];

        // Combine and filter bookings on the frontend to ensure correctness, as the backend might
        // incorrectly place past bookings in the "upcoming" list.
        const allApiBookings = [
          ...(Array.isArray(upcomingData) ? upcomingData : []),
          ...(Array.isArray(historyData) ? historyData : []),
        ];

        const uniqueBookings = new Map<string, any>();
        allApiBookings.forEach(booking => {
          uniqueBookings.set(booking._id, booking);
        });

        const now = new Date();
        const upcoming: Booking[] = [];
        const history: Booking[] = [];

        uniqueBookings.forEach(apiBooking => {
          const booking = transformApiBooking(apiBooking);

          // Determine the end time of the booking from the last slot
          let lastSlot;
          if (booking.timeSlots && booking.timeSlots.length > 0) {
            lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
          } else if (booking.timeSlot) {
            lastSlot = booking.timeSlot;
          }

          if (!lastSlot || !lastSlot.end_time) {
            console.error('Booking with no time slot information:', booking);
            history.push(booking); // Default to history if no time info
            return;
          }

          const [endHours, endMinutes] = lastSlot.end_time.split(':').map(Number);
          const bookingEndDateTime = new Date(booking.bookingDate);
          bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);

          if (booking.status === 'completed' || booking.status === 'cancelled' || bookingEndDateTime < now) {
            history.push(booking);
          } else {
            upcoming.push(booking);
          }
        });

        // Sort for consistent display
        upcoming.sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime());
        history.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

        setUpcomingBookings(upcoming);
        setBookingHistory(history);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const BookingCard = ({ booking, isHistory = false }: { booking: Booking; isHistory?: boolean }) => {
    // Determine the time display logic
    let timeDisplay = 'N/A';
    let slotCount = 0;
    if (booking.timeSlots && booking.timeSlots.length > 0) {
      const firstSlot = booking.timeSlots[0];
      const lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
      timeDisplay = `${firstSlot.start_time} - ${lastSlot.end_time}`;
      slotCount = booking.timeSlots.length;
    } else if (booking.timeSlot) {
      timeDisplay = `${booking.timeSlot.start_time} - ${booking.timeSlot.end_time}`;
      slotCount = 1;
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-lg text-green-700 mb-2">
            {booking.turf?.turfName || 'Turf Name Not Available'}
          </h4>
          {slotCount > 1 && (
            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
              {slotCount} slots
            </span>
          )}
        </div>
        <div className="text-sm text-gray-600 mt-2 space-y-1">
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" /> {formatDate(booking.bookingDate)}
          </p>
          <p className="flex items-center">
            <Clock className="w-4 h-4 mr-2" /> {timeDisplay}
          </p>
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />{' '}
            {booking.turf?.address || 'Address not available'}
          </p>
          <p className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" /> ₹{booking.totalAmount}
          </p>
          <p className="flex items-center capitalize">
            <span
              className={`mr-2 h-2 w-2 rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-500' :
                booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
              }`}
            ></span>
            {booking.status}
          </p>
        </div>
        <div className="border-t border-gray-200 mt-4 pt-3 flex items-center justify-between">
          <Link
            to={`/bookings/${booking.bookingId || booking._id}`}
            className="text-sm text-green-600 hover:underline font-medium"
          >
            View Details
          </Link>
          {isHistory && booking.status === 'completed' && !booking.review && (
            <button
              onClick={() => setReviewingBooking(booking)}
              className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Write a Review
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {reviewingBooking && (
        <ReviewModal
          bookingId={reviewingBooking._id}
          turfName={reviewingBooking.turf?.turfName || 'the turf'}
          onClose={() => setReviewingBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {bookingSuccessMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <p className="font-bold mr-2">Booking Successful!</p>
              <p>{bookingSuccessMessage}</p>
            </div>
          </div>
        )}
        {reviewSuccessMessage && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <p className="font-bold mr-2">Success!</p>
              <p>{reviewSuccessMessage}</p>
            </div>
          </div>
        )}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your dashboard. Manage your bookings and profile information.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-green-600" />
                Upcoming Bookings
              </h2>
              {upcomingBookings.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                  <p>You have no upcoming bookings.</p>
                  <Link
                    to="/turfs"
                    className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Book a Turf
                  </Link>
                </div>
              )}
            </section>

            {/* Booking History */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <History className="w-6 h-6 mr-3 text-blue-600" />
                Booking History
              </h2>
              {bookingHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {bookingHistory.map(booking => (
                    <BookingCard key={booking._id} booking={booking} isHistory={true} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                  <p>You have no past bookings.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar for Profile */}
          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                Your Profile
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>Name:</strong> {profile?.name}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p><strong>Phone:</strong> {profile?.phoneNumber}</p>
              </div>
              {/* This link is a placeholder for a future implementation */}
              {/* <Link to="/profile/edit" className="mt-6 w-full text-center inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                Edit Profile
              </Link> */}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
        