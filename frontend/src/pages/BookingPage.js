import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';

function BookingPage() {
  const [formData, setFormData] = useState({
    service_type: 'driver',
    customer_name: '',
    customer_phone: '',
    date: '',
    time: '',
    serviceProviderUniqueId: '',
    address: '',
    notes: ''
  });
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch available providers based on service type
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/bookings/available-providers?type=${formData.service_type}`);
        setProviders(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({ ...prev, serviceProviderUniqueId: response.data[0].user_id }));
        }
      } catch (err) {
        setError('Failed to load available service providers');
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [formData.service_type]);

  const validateForm = () => {
    const { customer_name, customer_phone, serviceProviderUniqueId, date, time, address } = formData;
    if (!customer_name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!customer_phone.trim()) {
      setError('Please enter your phone number');
      return false;
    } else if (!/^\d{10,15}$/.test(customer_phone.trim())) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!date) {
      setError('Please select a date');
      return false;
    }
    if (!time) {
      setError('Please select a time');
      return false;
    }
    if (!serviceProviderUniqueId) {
      setError('Please select a service provider');
      return false;
    }
    if (!address?.trim()) {
      setError('Please enter your address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setError('');
    try {
      console.log('Submitting booking:', formData);
      const response = await api.post('/bookings', {
        ...formData,
        service_type: formData.service_type.toLowerCase(),
      });
      if (response.data && response.data.booking && response.data.booking._id) {
        const selectedProvider = providers.find(p => p.user_id === formData.serviceProviderUniqueId);
        navigate('/success', {
          state: {
            bookingId: response.data.booking._id,
            providerName: selectedProvider?.name || 'your service provider'
          }
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Booking error:', err.response?.data || err.message);
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your {formData.service_type === 'driver' ? 'Driver' : 'Maid'}</h2>
          <p className="text-xl text-gray-600">Fill in the details below to book your service</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type Toggle */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Service Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, service_type: 'driver' }))}
                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                      formData.service_type === 'driver' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg 
                      className={`w-8 h-8 mb-2 ${formData.service_type === 'driver' ? 'text-blue-600' : 'text-gray-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Driver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, service_type: 'maid' }))}
                    className={`py-4 px-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                      formData.service_type === 'maid' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg 
                      className={`w-8 h-8 mb-2 ${formData.service_type === 'maid' ? 'text-blue-600' : 'text-gray-500'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <span className="font-medium">Maid</span>
                  </button>
                </div>
              </div>
              {/* Service Provider Selection */}
              <div className="mb-6">
                <label htmlFor="serviceProviderUniqueId" className="block text-sm font-medium text-gray-700 mb-2">
                  Select {formData.service_type === 'driver' ? 'Driver' : 'Maid'}
                </label>
                <select
                  id="serviceProviderUniqueId"
                  name="serviceProviderUniqueId"
                  value={formData.serviceProviderUniqueId}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border"
                  required
                >
                  {providers.length === 0 ? (
                    <option value="" disabled>No {formData.service_type}s available</option>
                  ) : (
                    providers.map((provider) => (
                      <option key={provider._id} value={provider.user_id}>
                        {provider.name} (ID: {provider.user_id})
                      </option>
                    ))
                  )}
                </select>
              </div>
              {/* Customer Name */}
              <div className="mb-6">
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Full Name
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
              {/* Phone Number */}
              <div className="mb-6">
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              {/* Address */}
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="123 Main St, City, State ZIP"
                  required
                />
              </div>
              {/* Additional Notes */}
              <div className="mb-8">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any special instructions or requirements..."
                />
              </div>
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || providers.length === 0}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white ${
                    isSubmitting || providers.length === 0
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Book ${formData.service_type} Service`
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your information is secure and will not be shared
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
