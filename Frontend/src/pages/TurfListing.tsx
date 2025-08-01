import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { Turf } from '../types';
import { turfAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const TurfListing: React.FC = () => {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      let response;

      if (searchQuery && locationFilter) {
        // Use the dedicated search endpoint when both name and location are provided
        response = await turfAPI.searchTurfs({
          name: searchQuery,
          location: locationFilter,
        });
      } else {
        // Use the general turf endpoint for fetching all, or filtering by only name or only location
        response = await turfAPI.filterTurfs({
          name: searchQuery || undefined,
          location: locationFilter || undefined,
        });
      }
      
      // The API response might wrap the array in a 'data' property.
      // Based on the API response, the turfs array is nested inside a paginated structure.
      // We'll safely access it, falling back to other potential structures.
      const turfsArray = response.data?.data?.turfs || response.data?.data || response.data;
      if (Array.isArray(turfsArray)) {
        setTurfs(turfsArray);
      } else {
        console.error("API response for turfs is not in the expected array format:", response.data);
        setTurfs([]);
      }
    } catch (error) {
      console.error('Error fetching turfs:', error);
      // Set empty array to prevent UI issues when backend is unavailable
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTurfs();
  };

  const filteredTurfs = turfs.filter(turf => {
    if (priceFilter) {
      const price = turf.pricePerHour;
      switch (priceFilter) {
        case 'low':
          return price < 1000;
        case 'medium':
          return price >= 1000 && price <= 2000;
        case 'high':
          return price > 2000;
        default:
          return true;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Turfs</h1>
          <p className="text-gray-600">Find the perfect sports facility for your next game</p>
          {turfs.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                ⚠️ Unable to load turfs. Please ensure your backend server is running at http://localhost:5000
              </p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search turfs by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Search
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Prices</option>
                    <option value="low">Under ₹1,000</option>
                    <option value="medium">₹1,000 - ₹2,000</option>
                    <option value="high">Above ₹2,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {filteredTurfs.length} Turfs Found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTurfs.map((turf) => (
                <div
                  key={turf._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
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
                    {!turf.isActive && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Currently Unavailable</span>
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
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {turf.operatingHours.open_time} - {turf.operatingHours.close_time}
                      </span>
                    </div>

                    {turf.amenities && turf.amenities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {turf.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                          {turf.amenities.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{turf.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {turf.averageRating || 4.5} ({turf.reviewCount || 0})
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        ₹{turf.pricePerHour}/hr
                      </span>
                    </div>

                    <Link
                      to={`/turfs/${turf._id}`}
                      className={`w-full py-2 px-4 rounded-lg transition-colors text-center block font-semibold ${
                        turf.isActive
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {turf.isActive ? 'View Details' : 'Unavailable'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredTurfs.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No turfs found</h3>
                <p className="text-gray-500">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TurfListing;