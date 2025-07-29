import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const BookingDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/bookings/${id}`);
        setBooking(response.data);
        setStatus(response.data.status);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.put(`/api/bookings/${id}/status`, { status: newStatus });
      setStatus(newStatus);
      setBooking(prev => ({ ...prev, status: newStatus }));
      setUpdating(false);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update booking status');
      setUpdating(false);
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    
    try {
      setSubmittingReview(true);
      await axios.post(`/api/bookings/${id}/review`, { rating, review });
      // Refresh booking data
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data);
      setShowReviewForm(false);
      setSubmittingReview(false);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
      setSubmittingReview(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
          statusClasses[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500"
            >
              &larr; Back to bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Booking not found
  if (!booking) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Booking not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested booking could not be found.</p>
        <div className="mt-6">
          <Link
            to="/bookings"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View all bookings
          </Link>
        </div>
      </div>
    );
  }

  // Action buttons based on current status
  const renderActionButtons = () => {
    if (booking.status === 'pending') {
      return (
        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={() => handleStatusUpdate('accepted')}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {updating ? 'Accepting...' : 'Accept Booking'}
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate('rejected')}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {updating ? 'Rejecting...' : 'Reject Booking'}
          </button>
        </div>
      );
    } else if (booking.status === 'accepted') {
      return (
        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {updating ? 'Marking as Complete...' : 'Mark as Complete'}
          </button>
          <button
            type="button"
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {updating ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      );
    } else if (booking.status === 'completed' && !booking.rating) {
      return (
        <div className="mt-6">
          {!showReviewForm ? (
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Leave a Review
            </button>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="mt-1 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      {star <= rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                  Review (optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="review"
                    name="review"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!rating || submittingReview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Booking Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Booking ID: {booking._id}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Customer Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{booking.customerName}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Customer Phone</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <a href={`tel:${booking.customerPhone}`} className="text-blue-600 hover:text-blue-500">
                {booking.customerPhone}
              </a>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Service Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {booking.serviceType}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDate(booking.date)}
            </dd>
          </div>
          {booking.duration && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {booking.duration.hours} {booking.duration.unit}
              </dd>
            </div>
          )}
          {booking.price && (
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Price</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900">
                ${booking.price.toFixed(2)}
              </dd>
            </div>
          )}
          {booking.address && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {booking.address}
              </dd>
            </div>
          )}
          {booking.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Special Instructions</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                {booking.notes}
              </dd>
            </div>
          )}
          {booking.rating && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Customer Review</dt>
              <dd className="mt-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">
                      {star <= booking.rating ? '★' : '☆'}
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({booking.rating.toFixed(1)})
                  </span>
                </div>
                {booking.review && (
                  <p className="mt-2 text-sm text-gray-900 italic">"{booking.review}"</p>
                )}
              </dd>
            </div>
          )}
        </dl>

        {renderActionButtons()}
      </div>
      <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Bookings
        </button>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
