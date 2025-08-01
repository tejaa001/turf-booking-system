import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Plus, Trash2, UploadCloud, ArrowLeft } from 'lucide-react';

const AddTurf: React.FC = () => {
  const navigate = useNavigate();
  const [turfName, setTurfName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [email, setEmail] = useState('');
  const [openTime, setOpenTime] = useState('06:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [amenities, setAmenities] = useState<string[]>(['']);
  const [images, setImages] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmenityChange = (index: number, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
  };

  const addAmenity = () => {
    setAmenities([...amenities, '']);
  };

  const removeAmenity = (index: number) => {
    if (amenities.length > 1) {
      const newAmenities = amenities.filter((_, i) => i !== index);
      setAmenities(newAmenities);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
      const previews = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('turfName', turfName);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('pricePerHour', pricePerHour);
    formData.append('contactDetails', contactDetails);
    formData.append('email', email);
    formData.append('operatingHours[open_time]', openTime);
    formData.append('operatingHours[close_time]', closeTime);
    
    amenities.forEach(amenity => {
      if (amenity.trim()) {
        formData.append('amenities', amenity.trim());
      }
    });

    if (images) {
      Array.from(images).forEach(image => {
        formData.append('images', image);
      });
    }

    try {
      await adminAPI.createTurf(formData);
      navigate('/admin/dashboard', { state: { turfAdded: true, turfName } });
    } catch (err: any) {
      console.error('Failed to create turf:', err);
      setError(err.response?.data?.message || 'Failed to create turf. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-green-600 hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Turf</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md" role="alert">
              <strong className="font-bold">Error: </strong>
              <span>{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
            <div>
              <label htmlFor="turfName" className="block text-sm font-medium text-gray-700">Turf Name</label>
              <input type="text" id="turfName" value={turfName} onChange={e => setTurfName(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">Price per Hour (₹)</label>
              <input type="number" id="pricePerHour" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Contact & Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactDetails" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="tel" id="contactDetails" value={contactDetails} onChange={e => setContactDetails(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="openTime" className="block text-sm font-medium text-gray-700">Opening Time</label>
                <input type="time" id="openTime" value={openTime} onChange={e => setOpenTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700">Closing Time</label>
                <input type="time" id="closeTime" value={closeTime} onChange={e => setCloseTime(e.target.value)} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Amenities</h2>
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-4">
                <input type="text" value={amenity} onChange={e => handleAmenityChange(index, e.target.value)} placeholder={`Amenity ${index + 1}`} className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                <button type="button" onClick={() => removeAmenity(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addAmenity} className="text-sm text-green-600 hover:underline flex items-center">
              <Plus className="w-4 h-4 mr-1" /> Add Amenity
            </button>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Images</h2>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <span>Upload files</span>
                    <input id="images" name="images" type="file" multiple onChange={handleImageChange} className="sr-only" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((src, index) => (
                  <img key={index} src={src} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-md" />
                ))}
              </div>
            )}
          </div>

          {/* Submission */}
          <div className="pt-5">
            <div className="flex justify-end">
              <Link to="/admin/dashboard" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {loading ? <LoadingSpinner size="sm" color="white" /> : 'Create Turf'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTurf;