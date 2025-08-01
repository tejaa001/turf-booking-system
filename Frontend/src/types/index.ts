export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isAdmin?: boolean;
}

export interface TurfImage {
  url: string;
  public_id: string;
  _id: string;
}

export interface Turf {
  _id: string;
  turfName: string;
  description: string;
  address: string;
  pricePerHour: number;
  contactDetails: string;
  email: string;
  operatingHours: {
    open_time: string;
    close_time: string;
  };
  amenities: string[];
  images: TurfImage[];
  isActive: boolean;
  adminId: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface BookingPayload {
  turfId: string;
  bookingDate: string;
  timeSlots: TimeSlot[];
  totalAmount: number;
  paymentMethod: string;
  playerCount: number;
}

export interface Booking {
  _id: string;
  bookingId?: string;
  userId: string;
  turfId: string;
  bookingDate: string;
  timeSlot?: TimeSlot; // For older, single-slot bookings
  timeSlots?: TimeSlot[]; // For multi-slot bookings
  totalAmount: number;
  paymentMethod: string;
  playerCount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  cancellationReason?: string;
  createdAt: string;
  turf?: Turf;
  user?: User;
  review?: string | Review; // Can be a review ID or a populated review object
}

export interface Review {
  _id?: string; // Made optional as it's missing in the turf reviews endpoint
  rating: number;
  review: string;
  date: string;
  user?: User;
  // The following fields are part of the full model but may not be in all API responses.
  bookingId?: string;
  userId?: string;
  turfId?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  isAdmin?: boolean;
}