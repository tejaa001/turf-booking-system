import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ParkingCircle,
  Utensils,
  Droplets,
  Wifi,
  Sun,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  User as UserIcon,
} from 'lucide-react';
import { turfAPI, reviewsAPI } from '../services/api';
import { Turf, TimeSlot, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/Common/StarRating';
import ReviewCard from '../components/Turf/ReviewCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const amenityIconMap: { [key: string]: React.ReactElement } = {
  parking: <ParkingCircle className="w-5 h-5 text-green-600" />,
  changing: <Droplets className="w-5 h-5 text-green-600" />,
  cafeteria: <Utensils className="w-5 h-5 text-green-600" />,
  wifi: <Wifi className="w-5 h-5 text-green-600" />,
  default: <Sun className="w-5 h-5 text-green-600" />,
};

const getAmenityIcon = (amenity: string) => {
  const lowerAmenity = amenity.toLowerCase();
  const foundKey = Object.keys(amenityIconMap).find(key => lowerAmenity.includes(key));
  return amenityIconMap[foundKey || 'default'];
};

interface DisplayTimeSlot extends TimeSlot {
  isBooked: boolean;
};

const TurfDetail: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Booking related state
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [availableSlots, setAvailableSlots] = useState<DisplayTimeSlot[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const totalCost = turf ? selectedSlots.length * turf.pricePerHour : 0;

  useEffect(() => {
    const fetchTurfDetails = async () => {
      if (!turfId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await turfAPI.getTurfDetails(turfId);
        const turfData =
          response.data?.data?.turf || response.data?.data || response.data;
        if (turfData) {
          setTurf(turfData);
          if (turfData.images && turfData.images.length > 0) {
            setSelectedImage(turfData.images[0].url);
          }
        } else {
          setError('Turf not found.');
        }
      } catch (err) {
        console.error('Failed to fetch turf details:', err);
        setError('Failed to load turf details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTurfDetails();
  }, [turfId]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!turfId || !selectedDate) return;
      try {
        setLoadingAvailability(true);
        setSelectedSlots([]); // Reset selected slots when date changes
        const response = await turfAPI.getTurfAvailability(turfId, selectedDate);

        const apiSlots = response.data?.data?.slots || [];

        if (Array.isArray(apiSlots)) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const isToday = selectedDate === todayStr;

          const transformedSlots: DisplayTimeSlot[] = apiSlots.map(
            (slot: { time: string; isBooked: boolean }) => {
              const [start_time, end_time] = slot.time.split('-');
              let isPast = false;
              if (isToday) {
                const [hours, minutes] = start_time.split(':').map(Number);
                const slotTime = new Date();
                slotTime.setHours(hours, minutes, 0, 0);
                if (slotTime < now) {
                  isPast = true;
                }
              }
              return { start_time, end_time, isBooked: slot.isBooked || isPast };
            },
          );
          setAvailableSlots(transformedSlots);
        } else {
          console.error('API response for availability is not an array:', response.data);
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setAvailableSlots([]);
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [turfId, selectedDate]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!turfId) return;
      try {
        setLoadingReviews(true);
        const response = await reviewsAPI.getTurfReviews(turfId);
        const reviewsData = response.data?.data?.reviews || response.data?.data || response.data || [];
        if (Array.isArray(reviewsData)) {
          setReviews(reviewsData);
        } else {
          console.error('API response for reviews is not an array:', response.data);
          setReviews([]);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [turfId]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isBooked) return;
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.start_time === slot.start_time);
      if (isSelected) {
        return prev.filter(s => s.start_time !== slot.start_time);
      } else {
        // Sort slots by start time when adding a new one
        const newSlots = [...prev, slot];
        newSlots.sort((a, b) => a.start_time.localeCompare(b.start_time));
        return newSlots;
      }
    });
  };

  const handleProceedToBook = () => {
    if (!user) {
      // Redirect to login, and after login, come back to this turf detail page.
      navigate(`/login?redirect=/turfs/${turfId}`);
      return;
    }

    if (turf && selectedSlots.length > 0 && selectedDate) {
      // In a future step, this will navigate to a confirmation/payment page
      // with all the necessary booking details.
      navigate('/booking/confirm', {
        state: { turf, selectedSlots, selectedDate },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!turf) {
    return <div className="text-center py-10">Turf not found.</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-96 bg-gray-200">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={turf.turfName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <MapPin className="w-24 h-24 text-white" />
                </div>
              )}
            </div>
            {turf.images && turf.images.length > 1 && (
              <div className="p-2 flex space-x-2 bg-gray-100 overflow-x-auto">
                {turf.images.map((image) => (
                  <button
                    key={image._id}
                    onClick={() => setSelectedImage(image.url)}
                    className={`w-24 h-16 rounded-md overflow-hidden flex-shrink-0 focus:outline-none ring-2 transition-all duration-200 ${
                      selectedImage === image.url
                        ? 'ring-green-500'
                        : 'ring-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${turf.turfName} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {turf.turfName}
            </h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{turf.address}</span>
            </div>
            <div className="flex items-center mb-6">
              {turf.averageRating !== undefined && <StarRating rating={turf.averageRating} />}
              <span className="text-gray-700 font-semibold ml-2">{turf.averageRating?.toFixed(1) || 'N/A'}</span>
              <span className="text-gray-500 ml-1">
                ({turf.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="prose max-w-none text-gray-700 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                About this turf
              </h2>
              <p>{turf.description}</p>
            </div>

            <hr className="my-8" />

            <div className="mb-8" id="contact">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <a href={`tel:${turf.contactDetails}`} className="text-gray-700 hover:text-green-700 hover:underline">{turf.contactDetails}</a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <a href={`mailto:${turf.email}`} className="text-gray-700 hover:text-green-700 hover:underline">{turf.email}</a>
                </div>
              </div>
            </div>

            <hr className="my-8" />

            <div className="mb-8" id="amenities">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {turf.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-800 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-8" />

            <div id="reviews">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Reviews
              </h2>
              {loadingReviews ? (
                <div className="flex justify-center p-4">
                  <LoadingSpinner />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {/* Using a composite key as a fallback since review._id is missing from the API */}
                  {reviews.map((review, index) => (
                    <ReviewCard key={review._id || `${review.user?._id}-${index}`} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-500">
                  <p>No reviews yet. Be the first to review this turf!</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg sticky top-24">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Book Now</h2>
                <span className="text-2xl font-bold text-green-600">
                  ₹{turf.pricePerHour}
                  <span className="text-base font-normal text-gray-500">
                    /hr
                  </span>
                </span>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="booking-date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Date
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    id="booking-date"
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]} // Prevent booking past dates
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Available Slots
                </h3>
                {loadingAvailability ? (
                  <div className="flex justify-center items-center h-24">
                    <LoadingSpinner />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={`${slot.start_time}-${slot.end_time}`}
                        onClick={() => handleSlotClick(slot)}
                        disabled={slot.isBooked}
                        className={`px-3 py-2 text-sm rounded-md text-center transition-colors focus:outline-none ${
                          slot.isBooked
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                            : selectedSlots.some(s => s.start_time === slot.start_time)
                            ? 'bg-green-600 text-white ring-2 ring-green-500'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {slot.start_time} - {slot.end_time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500 bg-gray-100 p-4 rounded-md">
                    No slots available for this date.
                  </div>
                )}
              </div>

              {/* Total Cost Calculation */}
              {selectedSlots.length > 0 && (
                <div className="my-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-gray-800">
                    <span className="font-medium">Total Cost</span>
                    <span className="font-bold text-xl text-green-600">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {selectedSlots.length} slot(s) &times; ₹{turf.pricePerHour}/hr
                  </p>
                </div>
              )}

              <button
                disabled={selectedSlots.length === 0}
                onClick={handleProceedToBook}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {selectedSlots.length > 0
                  ? `Book for ₹${totalCost.toLocaleString()}`
                  : `Proceed to Book`}
              </button>
              {selectedSlots.length > 0 ? (
                <p className="text-xs text-center text-gray-500 mt-2">You have selected {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}.</p>
              ) : (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Please select a date and at least one time slot to continue.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TurfDetail;