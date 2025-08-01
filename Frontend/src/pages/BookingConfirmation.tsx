import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Turf, TimeSlot, BookingPayload } from '../types';
import { bookingAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useRazorpay from '../hooks/useRazorpay';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { MapPin, Calendar, Clock, Users, CreditCard } from 'lucide-react';

interface LocationState {
  turf: Turf;
  selectedSlots: TimeSlot[];
  selectedDate: string;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRazorpayLoaded = useRazorpay();

  const [state, setState] = useState<LocationState | null>(null);
  const [playerCount, setPlayerCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);

  useEffect(() => {
    if (location.state) {
      const stateData = location.state as LocationState;
      if (stateData.selectedSlots && stateData.selectedSlots.length > 0) {
        setState(stateData);
      } else {
        navigate('/turfs');
      }
    } else {
      // If no state is passed, user probably landed here by mistake.
      // Redirect them to the turf listing page.
      navigate('/turfs');
    }
  }, [location, navigate]);

  useEffect(() => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (isRazorpayLoaded) {
      if (razorpayKey) {
        setIsPaymentReady(true);
      } else {
        console.error('VITE_RAZORPAY_KEY_ID is not defined in .env file');
        setError('Payment gateway is not configured. Please contact support.');
        setIsPaymentReady(false);
      }
    }
  }, [isRazorpayLoaded]);

  const handlePayment = async () => {
    if (!state || !user || !isRazorpayLoaded) {
      setError('Payment gateway is not ready or booking details are missing.');
      return;
    }

    const { turf, selectedSlots, selectedDate } = state;
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      setError('Payment gateway is not configured correctly.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1. Create a booking record on the backend.
    // This endpoint should create a 'pending' booking and a Razorpay order,
    // then return the order details to the frontend.
    const totalAmount = turf.pricePerHour * selectedSlots.length;

    const bookingData = {
      turfId: turf._id,
      bookingDate: new Date(selectedDate).toISOString(),
      timeSlots: selectedSlots,
      totalAmount: totalAmount,
      paymentMethod: 'online',
      playerCount: playerCount,
    };

    try {
      const response = await bookingAPI.createBooking(bookingData);

      // Safely access the Razorpay order data from the response
      const orderData = response.data?.data?.order || response.data?.data;
      if (!orderData || !orderData.id || !orderData.amount) {
        throw new Error('Invalid payment order data received from server.');
      }

      const { amount, id: order_id, currency } = orderData;

      // 2. Configure and open the Razorpay payment modal
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: 'TurfBook',
        description: `Booking for ${turf.turfName}`,
        image: 'https://i.imgur.com/4L2pC3i.png',
        order_id: order_id,
        handler: async function (paymentResponse: any) {
          // 3. On successful payment, verify it with the backend.
          // The backend will then finalize the booking status.
          try {
            await paymentAPI.verifyPayment({
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            navigate('/dashboard', { state: { bookingSuccess: true, turfName: turf.turfName } });
          } catch (verificationError: any) {
            console.error('Payment verification failed:', verificationError);
            setError(verificationError.response?.data?.message || 'Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phoneNumber,
        },
        notes: {
          turfId: turf._id,
          bookingDate: selectedDate,
        },
        theme: {
          color: '#16a34a', // Tailwind's green-600
        },
        modal: {
          ondismiss: () => {
            console.log('User cancelled the payment.');
            setLoading(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error);
        setError(`Payment failed: ${response.error.description || response.error.reason}. Please try again.`);
        setLoading(false);
      });
      paymentObject.open();
    } catch (bookingError: any) {
      console.error('Failed to create booking or payment order:', bookingError);
      const errorMessage = bookingError.response?.data?.message || 'Could not initiate booking. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (!state) {
    // Render a loading state while we check for location.state
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  const { turf, selectedSlots, selectedDate } = state;
  const totalAmount = turf.pricePerHour * selectedSlots.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Avoid timezone issues
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Confirm Your Booking</h1>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left side: Booking Summary */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Summary</h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg">{turf.turfName}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  {turf.address}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-1 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Time Slot{selectedSlots.length > 1 ? 's' : ''}</p>
                    <div className="text-gray-600 space-y-1">
                      {selectedSlots.map(slot => (
                        <div key={slot.start_time}>{slot.start_time} - {slot.end_time}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Payment and Confirmation */}
          <div className="p-8 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Finalize Details</h2>

            <div className="mb-6">
              <label htmlFor="player-count" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Number of Players
              </label>
              <input 
                type="number"
                id="player-count"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value, 10) || 1)}
                min="1"
                max="22"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Payment will be processed securely.</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading || !isPaymentReady}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <LoadingSpinner /> : <><CreditCard className="w-5 h-5 mr-2" />Confirm & Proceed to Pay</>}
            </button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By clicking, you agree to our <Link to="/terms" className="underline hover:text-green-600">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;