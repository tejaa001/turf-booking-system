import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { turfAPI, adminAPI } from '../../services/api';
import { Turf, TurfImage } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Plus, Trash2, UploadCloud, ArrowLeft } from 'lucide-react';

const EditTurf: React.FC = () => {
  const { turfId } = useParams<{ turfId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    turfName: '',
    description: '',
    address: '',
    pricePerHour: '',
    contactDetails: '',
    email: '',
    openTime: '06:00',
    closeTime: '22:00',
  });
  const [amenities, setAmenities] = useState<string[]>(['']);
  const [existingImages, setExistingImages] = useState<TurfImage[]>([]);
  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTurfData = async () => {
      if (!turfId) return;
      try {
        setLoading(true);
        const response = await turfAPI.getTurfDetails(turfId);
        const turf: Turf = response.data?.data?.turf || response.data?.data;
        
        setFormData({
          turfName: turf.turfName,
          description: turf.description,
          address: turf.address,
          pricePerHour: turf.pricePerHour.toString(),
          contactDetails: turf.contactDetails,
          email: turf.email,
          openTime: turf.operatingHours.open_time,
          closeTime: turf.operatingHours.close_time,
        });
        setAmenities(turf.amenities.length > 0 ? turf.amenities : ['']);
        setExistingImages(turf.images);
      } catch (err) {
        console.error('Failed to fetch turf data:', err);
        setError('Could not load turf data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTurfData();
  }, [turfId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAmenityChange = (index: number, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
  };

  const addAmenity = () => setAmenities([...amenities, '']);

  const removeAmenity = (index: number) => {
    if (amenities.length > 1) {
      setAmenities(amenities.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(e.target.files);
      const previews = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turfId) return;

    setLoading(true);
    setError(null);

    const submissionData = new FormData();
    submissionData.append('turfName', formData.turfName);
    submissionData.append('description', formData.description);
    submissionData.append('address', formData.address);
    submissionData.append('pricePerHour', formData.pricePerHour);
    submissionData.append('contactDetails', formData.contactDetails);
    submissionData.append('email', formData.email);
    submissionData.append('operatingHours[open_time]', formData.openTime);
    submissionData.append('operatingHours[close_time]', formData.closeTime);
    
    amenities.forEach(amenity => {
      if (amenity.trim()) submissionData.append('amenities', amenity.trim());
    });

    if (newImages) {
      Array.from(newImages).forEach(image => submissionData.append('images', image));
    }

    try {
      await adminAPI.updateTurf(turfId, submissionData);
      navigate('/admin/dashboard', { state: { turfUpdated: true, turfName: formData.turfName } });
    } catch (err: any) {
      console.error('Failed to update turf:', err);
      setError(err.response?.data?.message || 'Failed to update turf. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.turfName) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/dashboard" className="text-sm text-green-600 hover:underline flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Turf</h1>

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
              <input type="text" id="turfName" name="turfName" value={formData.turfName} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleFormChange} rows={4} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" id="address" name="address" value={formData.address} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">Price per Hour (₹)</label>
              <input type="number" id="pricePerHour" name="pricePerHour" value={formData.pricePerHour} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Contact & Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactDetails" className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input type="tel" id="contactDetails" name="contactDetails" value={formData.contactDetails} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="openTime" className="block text-sm font-medium text-gray-700">Opening Time</label>
                <input type="time" id="openTime" name="openTime" value={formData.openTime} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
              <div>
                <label htmlFor="closeTime" className="block text-sm font-medium text-gray-700">Closing Time</label>
                <input type="time" id="closeTime" name="closeTime" value={formData.closeTime} onChange={handleFormChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Amenities</h2>
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-4">
                <input type="text" value={amenity} onChange={e => handleAmenityChange(index, e.target.value)} placeholder={`Amenity ${index + 1}`} className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                <button type="button" onClick={() => removeAmenity(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
            <button type="button" onClick={addAmenity} className="text-sm text-green-600 hover:underline flex items-center"><Plus className="w-4 h-4 mr-1" /> Add Amenity</button>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Images</h2>
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map(img => <img key={img._id} src={img.url} alt="Existing turf" className="w-full h-32 object-cover rounded-md" />)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Uploading new images will replace the existing ones.</p>
              </div>
            )}
            <label htmlFor="images" className="block text-sm font-medium text-gray-700">Upload New Images</label>
            <input id="images" name="images" type="file" multiple onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((src, index) => <img key={index} src={src} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-md" />)}
              </div>
            )}
          </div>

          {/* Submission */}
          <div className="pt-5">
            <div className="flex justify-end">
              <Link to="/admin/dashboard" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400">
                {loading ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTurf;