import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { Booking, Review } from '../types';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import CancellationModal from '../components/Common/CancellationModal';
import ReviewModal from '../components/Common/ReviewModal';
import StarRating from '../components/Common/StarRating';
import { MapPin, Calendar, Clock, Users, DollarSign, Info, ShieldCheck, User as UserIcon } from 'lucide-react';

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        setLoading(true);
        const res = await bookingAPI.getBooking(bookingId);
        // The API response for a single booking might be nested
        const bookingData = res.data?.data?.booking || res.data?.data || res.data;
        // Adapt the API response to the frontend's Booking type
        const transformedBooking = {
          ...bookingData,
          // Standardize status field
          status: bookingData.bookingStatus,
          // Map populated objects to the correct fields
          turf: bookingData.turfId,
          user: bookingData.userId,
          // Ensure the ID fields are strings
          turfId: bookingData.turfId?._id,
          userId: bookingData.userId?._id,
        };
        setBooking(transformedBooking);
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
        setError('Could not load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingId) return;

    setCancelling(true);
    setCancelError(null);
    try {
      await bookingAPI.cancelBooking(bookingId, reason);
      
      // Optimistically update the booking state
      setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setShowCancelModal(false);
      setSuccessMessage('Your booking has been successfully cancelled.');
    } catch (err: any) {
      console.error('Failed to cancel booking:', err);
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred during cancellation.';
      setCancelError(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!bookingId || !booking) return;

    setSubmittingReview(true);
    setReviewError(null);
    try {
      const response = await bookingAPI.submitReview(bookingId, rating, reviewText);
      const newReview = response.data?.data?.review || response.data?.data;
      
      // Optimistically update the booking state to show review is submitted
      setBooking(prev => {
        if (!prev) return null;
        const reviewObject: Review = newReview || {
          rating: rating,
          review: reviewText,
          date: new Date().toISOString(),
          user: prev.user,
        };
        return { ...prev, review: reviewObject };
      });
      setShowReviewModal(false);
      setSuccessMessage('Thank you for your review! It is now live.');
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred while submitting your review.';
      setReviewError(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!booking) {
    return <div className="text-center py-10">Booking not found.</div>;
  }

  const { turf } = booking;

  // Determine the last slot to check for cancellability
  let lastSlot;
  if (booking.timeSlots && booking.timeSlots.length > 0) {
    lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
  } else if (booking.timeSlot) {
    lastSlot = booking.timeSlot;
  }

  // A booking can only be cancelled if it's confirmed and in the future.
  let isCancellable = false;
  if (lastSlot) {
    const now = new Date();
    const [endHours, endMinutes] = lastSlot.end_time.split(':').map(Number);
    const bookingEndDateTime = new Date(booking.bookingDate);
    bookingEndDateTime.setHours(endHours, endMinutes, 0, 0);
    isCancellable = booking.status === 'confirmed' && bookingEndDateTime > now;
  }

  const hasReview = !!booking.review;
  const submittedReview =
    typeof booking.review === 'object' && booking.review !== null
      ? (booking.review as Review)
      : null;
  const isReviewable = booking.status === 'completed' && !hasReview;

  // Prepare time slots for display, handling both single and multi-slot bookings.
  const allSlots = booking.timeSlots && booking.timeSlots.length > 0
    ? booking.timeSlots
    : (booking.timeSlot ? [booking.timeSlot] : []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {showCancelModal && (
        <CancellationModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
          apiError={cancelError}
        />
      )}
      {showReviewModal && (
        <ReviewModal
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
          loading={submittingReview}
          apiError={reviewError}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-green-600 hover:underline">&larr; Back to Dashboard</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Details</h1>
        <p className="text-gray-500 mb-8">Booking ID: {booking.bookingId || booking._id}</p>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <p className="font-bold mr-2">Success!</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{turf?.turfName || 'Turf Details'}</h2>
              <div className="space-y-4">
                <div className="flex items-start"><MapPin className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Location</p><p className="text-gray-600">{turf?.address}</p></div></div>
                <div className="flex items-start"><Calendar className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Date</p><p className="text-gray-600">{formatDate(booking.bookingDate)}</p></div></div>
                <div className="flex items-start"><Clock className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Time Slot{allSlots.length > 1 ? 's' : ''}</p>
                    <div className="text-gray-600 space-y-1">
                      {allSlots.map(slot => <div key={slot.start_time}>{slot.start_time} - {slot.end_time}</div>)}
                      {allSlots.length === 0 && <p>Not available</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-start"><Users className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Players</p><p className="text-gray-600">{booking.playerCount}</p></div></div>
                <div className="flex items-start"><UserIcon className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Booked By</p><p className="text-gray-600">{booking.user?.name || 'N/A'}</p></div></div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment & Status</h2>
              <div className="space-y-4">
                <div className="flex items-start"><DollarSign className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Total Amount</p><p className="text-gray-600 font-bold text-lg">₹{booking.totalAmount}</p></div></div>
                <div className="flex items-start"><ShieldCheck className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Payment Status</p><p className={`capitalize font-semibold ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{booking.paymentStatus}</p></div></div>
                <div className="flex items-start"><Info className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0" /><div><p className="font-medium">Booking Status</p><p className={`capitalize font-semibold ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'completed' ? 'text-blue-600' : 'text-red-600'}`}>{booking.status}</p></div></div>
              </div>
              {isCancellable && (
                <div className="mt-6">
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Cancel Booking
                  </button>
                  <p className="text-xs text-center mt-2 text-gray-500">Cancellation policies may apply.</p>
                </div>
              )}
              {isReviewable && (
                <div className="mt-6">
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </button>
                  <p className="text-xs text-center mt-2 text-gray-500">Share your experience with others.</p>
                </div>
              )}
              {hasReview && !submittedReview && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Review Submitted</h3>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 italic">
                      Thank you! Your review has been submitted.
                    </p>
                  </div>
                </div>
              )}
              {submittedReview && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Review</h3>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <StarRating rating={submittedReview.rating} />
                    </div>
                    <p className="text-gray-700 italic">"{submittedReview.review}"</p>
                    {submittedReview.date && (
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        Reviewed on {new Date(submittedReview.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;