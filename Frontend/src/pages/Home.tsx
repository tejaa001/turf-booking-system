import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import { Turf } from '../types';
import { turfAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Home: React.FC = () => {
  const [featuredTurfs, setFeaturedTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedTurfs();
  }, []);

  const fetchFeaturedTurfs = async () => {
    try {
      const response = await turfAPI.getAllTurfs();
      // Based on the API response, the turfs array is nested inside a paginated structure.
      // We'll safely access it, falling back to other potential structures.
      const turfsArray = response.data?.data?.turfs || response.data?.data || response.data;
      if (Array.isArray(turfsArray)) {
        setFeaturedTurfs(turfsArray.slice(0, 6)); // Show first 6 turfs
      } else {
        console.error("API response for turfs is not in the expected array format:", response.data);
        setFeaturedTurfs([]);
      }
    } catch (error) {
      console.error('Error fetching turfs:', error);
      // Set empty array to prevent UI issues when backend is unavailable
      // Set empty array if API is not available
      setFeaturedTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/turfs?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {featuredTurfs.length === 0 && !loading && (
              <div className="mb-6 p-4 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-400">
                <p className="text-yellow-100">
                  ⚠️ Backend server is not running. Please start your backend server to see live data.
                </p>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Book Your Perfect
              <span className="block text-green-300">Sports Turf</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Discover and reserve premium sports facilities in your area. 
              Play where champions are made.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for turfs, locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>

            <Link
              to="/turfs"
              className="inline-block px-8 py-4 bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg transition-colors"
            >
              Browse All Turfs
            </Link>
          </div>
        </div>
      </section>

   
      {/* Featured Turfs Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Turfs
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular sports facilities
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTurfs.map((turf) => (
                <div
                  key={turf._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    {turf.images && turf.images.length > 0 ? (
                      <img
                        src={turf.images[0].url}
                        alt={turf.turfName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {turf.turfName}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm truncate">{turf.address}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {turf.averageRating || 4.5} ({turf.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        ₹{turf.pricePerHour}/hr
                      </span>
                    </div>
                    <Link
                      to={`/turfs/${turf._id}`}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/turfs"
              className="inline-block px-8 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold rounded-lg transition-colors"
            >
              View All Turfs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;