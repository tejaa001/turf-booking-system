import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PlusCircle,
  List,
  DollarSign,
  BarChart,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';
import { turfAPI, adminAPI } from '../../services/api';
import { Turf, Booking, User } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import DeleteConfirmationModal from '../../components/Common/DeleteConfirmationModal';
import Pagination from '../../components/Common/Pagination';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [adminProfile, setAdminProfile] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    totalTurfs: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingTurf, setDeletingTurf] = useState<Turf | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

  useEffect(() => {
    if (location.state?.turfAdded) {
      const turfName = location.state.turfName || 'New turf';
      setSuccessMessage(`Successfully added "${turfName}"!`);
      window.history.replaceState({}, document.title); // Clear state on refresh
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    if (location.state?.turfUpdated) {
      const turfName = location.state.turfName || 'The turf';
      setSuccessMessage(`Successfully updated "${turfName}"!`);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.isAdmin) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch admin's profile and turfs in parallel
        const [profileRes, turfsRes] = await Promise.all([
          adminAPI.getProfile(),
          adminAPI.getAdminTurfs(),
        ]);

        const profileData = profileRes.data?.data?.admin || profileRes.data?.data;
        if (profileData) {
          setAdminProfile(profileData);
        }

        const adminTurfs: Turf[] = turfsRes.data?.data?.turfs || turfsRes.data?.data || turfsRes.data || [];
        setTurfs(adminTurfs);

        // 2. Fetch bookings for each turf
        if (adminTurfs.length > 0) {
          const bookingPromises = adminTurfs.map(turf =>
            adminAPI.getTurfBookings(turf._id)
          );
          const bookingsRes = await Promise.all(bookingPromises);
          const allBookings = bookingsRes.flatMap(
            (res) => (res.data?.data?.docs || res.data?.data || res.data || []).map((b: any) => ({
              ...b,
              // The API sends bookingStatus and a populated userId object.
              // We transform them to match our frontend Booking type.
              status: b.bookingStatus,
              user: typeof b.userId === 'object' ? b.userId : undefined,
              userId: typeof b.userId === 'object' ? b.userId._id : b.userId,
            }))
          );
          setBookings(allBookings as Booking[]);

          // 3. Calculate stats
          const totalRevenue = allBookings
            .filter(b => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalAmount, 0);

          setStats({
            totalTurfs: adminTurfs.length,
            totalBookings: allBookings.length,
            totalRevenue,
          });
        } else {
          setStats({ totalTurfs: 0, totalBookings: 0, totalRevenue: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch admin dashboard data:', err);
        setError('Could not load admin dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleToggleTurfStatus = async (
    turfId: string,
    currentStatus: boolean
  ) => {
    try {
      await adminAPI.toggleTurfStatus(turfId, !currentStatus);
      setTurfs(
        turfs.map((t) =>
          t._id === turfId ? { ...t, isActive: !currentStatus } : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle turf status:', err);
      alert('Failed to update turf status. Please try again.');
    }
  };

  const handleDeleteClick = (turf: Turf) => {
    setDeletingTurf(turf);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTurf) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await adminAPI.deleteTurf(deletingTurf._id);
      setTurfs(turfs.filter(t => t._id !== deletingTurf._id));
      setSuccessMessage(`Successfully deleted "${deletingTurf.turfName}".`);
      setDeletingTurf(null);
    } catch (err: any) {
      console.error('Failed to delete turf:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete turf.');
    } finally {
      setIsDeleting(false);
    }
  };

  const StatCard = ({
    icon,
    title,
    value,
    color,
  }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        {React.createElement(icon, { className: 'w-6 h-6 text-white' })}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

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

  return (
    <div className="bg-gray-100 min-h-screen">
      {deletingTurf && (
        <DeleteConfirmationModal
          itemName={deletingTurf.turfName}
          onClose={() => setDeletingTurf(null)}
          onConfirm={handleConfirmDelete}
          loading={isDeleting}
          apiError={deleteError}
        />
      )}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {adminProfile?.name || 'Admin'}!
          </h1>
          <Link
            to="/admin/turfs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Turf
          </Link>
        </div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={List}
            title="Total Turfs"
            value={stats.totalTurfs}
            color="bg-blue-500"
          />
          <StatCard
            icon={BarChart}
            title="Total Bookings"
            value={stats.totalBookings}
            color="bg-purple-500"
          />
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="bg-green-500"
          />
        </section>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <p className="font-bold mr-2">Success!</p>
              <p>{successMessage}</p>
            </div>
          </div>
        )}
        <div className="space-y-8">
          {/* Manage Turfs Section */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Manage Your Turfs
              </h2>
              {/* This link is a placeholder for a future implementation */}
              {/* <Link
                to="/admin/turfs/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Turf
              </Link> */}
            </div>
            {turfs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/hr</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {turfs.map((turf) => (
                      <tr key={turf._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{turf.turfName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{turf.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{turf.pricePerHour}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              turf.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {turf.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Link to={`/turfs/${turf._id}`} className="text-indigo-600 hover:text-indigo-900" title="View">
                            <Eye className="w-5 h-5 inline-block" />
                          </Link>
                          <Link to={`/admin/turfs/edit/${turf._id}`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                            <Edit className="w-5 h-5 inline-block" />
                          </Link>
                          <button
                            onClick={() => handleToggleTurfStatus(turf._id, turf.isActive)}
                            className={`hover:text-gray-900 ${turf.isActive ? 'text-green-600' : 'text-gray-400'}`}
                            title={turf.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {turf.isActive ? <ToggleRight className="w-5 h-5 inline-block" /> : <ToggleLeft className="w-5 h-5 inline-block" />}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(turf)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete">
                            <Trash2 className="w-5 h-5 inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">You haven't added any turfs yet.</p>
              </div>
            )}
          </section>

          {/* Recent Bookings Section */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              All Bookings
            </h2>
            {bookings.length > 0 ? (
              <>
                <ul className="divide-y divide-gray-200">
                  {bookings
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage)
                    .map((booking) => {
                      // Determine the time display logic for single or multi-slot bookings
                      let timeDisplay = 'N/A';
                      if (booking.timeSlots && booking.timeSlots.length > 0) {
                        const firstSlot = booking.timeSlots[0];
                        const lastSlot = booking.timeSlots[booking.timeSlots.length - 1];
                        timeDisplay = `${firstSlot.start_time} - ${lastSlot.end_time}`;
                      } else if (booking.timeSlot) {
                        timeDisplay = `${booking.timeSlot.start_time} - ${booking.timeSlot.end_time}`;
                      }

                      return (
                        <li key={booking._id} className="py-4 flex justify-between items-center flex-wrap gap-2">
                          <div className="flex-1 min-w-[200px]">
                            <p className="text-sm font-medium text-green-600">
                              {turfs.find(t => t._id === booking.turfId)?.turfName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-900">Booked by: {booking.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(booking.bookingDate).toLocaleDateString()} at {timeDisplay}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">₹{booking.totalAmount}</p>
                            <p className={`text-sm capitalize font-medium ${
                                booking.status === 'confirmed' ? 'text-green-600' :
                                booking.status === 'completed' ? 'text-blue-600' :
                                'text-red-600'
                              }`}>
                              {booking.status}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                </ul>
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(bookings.length / bookingsPerPage)}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No bookings found for your turfs.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;