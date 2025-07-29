import React, { useState, useEffect } from 'react';
import { format, addDays, isToday, isSameDay, parseISO } from 'date-fns';
import axios from 'axios';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
];

const AvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recurringSchedule, setRecurringSchedule] = useState({
    monday: { start: '9:00 AM', end: '5:00 PM', available: true },
    tuesday: { start: '9:00 AM', end: '5:00 PM', available: true },
    wednesday: { start: '9:00 AM', end: '5:00 PM', available: true },
    thursday: { start: '9:00 AM', end: '5:00 PM', available: true },
    friday: { start: '9:00 AM', end: '5:00 PM', available: true },
    saturday: { start: '9:00 AM', end: '2:00 PM', available: false },
    sunday: { start: '9:00 AM', end: '2:00 PM', available: false },
  });
  const [showRecurring, setShowRecurring] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/availability');
        setAvailability(response.data.availability || {});
        setLoading(false);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability data');
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Generate dates for the week view
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - selectedDate.getDay()));

  // Toggle time slot selection
  const toggleTimeSlot = (date, time) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedSlots(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [time]: !prev[dateStr]?.[time]
      }
    }));
  };

  // Save availability changes
  const saveAvailability = async (isRecurring = false) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const data = isRecurring 
        ? { type: 'recurring', schedule: recurringSchedule }
        : { type: 'specific', dates: selectedSlots };

      await axios.put('/api/availability', data);
      setSuccess('Availability updated successfully!');
      setSaving(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error updating availability:', err);
      setError(err.response?.data?.message || 'Failed to update availability');
      setSaving(false);
    }
  };

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    setSelectedDate(prev => addDays(prev, direction * 7));
  };

  // Check if a time slot is selected
  const isTimeSlotSelected = (date, time) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return selectedSlots[dateStr]?.[time] || false;
  };

  // Handle recurring schedule change
  const handleRecurringChange = (day, field, value) => {
    setRecurringSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'available' ? !prev[day].available : value
      }
    }));
  };

  // Render time slots for a specific date
  const renderTimeSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const isAvailable = recurringSchedule[dayOfWeek]?.available;
    
    return (
      <div className="space-y-2">
        {timeSlots.map((time, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => toggleTimeSlot(date, time)}
            className={`w-full py-2 px-3 text-sm rounded-md ${
              isTimeSlotSelected(date, time)
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            disabled={!isAvailable}
          >
            {time}
          </button>
        ))}
      </div>
    );
  };

  // Render recurring schedule form
  const renderRecurringSchedule = () => (
    <div className="space-y-4">
      {daysOfWeek.map((day, idx) => {
        const dayLower = day.toLowerCase();
        const daySchedule = recurringSchedule[dayLower] || {};
        
        return (
          <div key={day} className="flex items-center space-x-4">
            <div className="w-24">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={daySchedule.available}
                  onChange={() => handleRecurringChange(dayLower, 'available')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {day}
                </span>
              </label>
            </div>
            
            <div className="flex-1 flex space-x-2">
              <select
                value={daySchedule.start}
                onChange={(e) => handleRecurringChange(dayLower, 'start', e.target.value)}
                disabled={!daySchedule.available}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {timeSlots.map((time, i) => (
                  <option key={`${day}-start-${i}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              
              <span className="flex items-center text-gray-500">to</span>
              
              <select
                value={daySchedule.end}
                onChange={(e) => handleRecurringChange(dayLower, 'end', e.target.value)}
                disabled={!daySchedule.available}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {timeSlots.map((time, i) => (
                  <option key={`${day}-end-${i}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
      
      <div className="pt-4">
        <button
          type="button"
          onClick={() => saveAvailability(true)}
          disabled={saving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Recurring Schedule'}
        </button>
      </div>
    </div>
  );

  // Render calendar view
  const renderCalendarView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {format(weekDates[0], 'MMMM d')} - {format(weekDates[6], 'MMMM d, yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigateWeek(-1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Previous week</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => navigateWeek(1)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Next week</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, idx) => {
          const dayOfWeek = format(date, 'EEEE').toLowerCase();
          const isAvailable = recurringSchedule[dayOfWeek]?.available;
          
          return (
            <div key={idx} className="space-y-2">
              <div className={`text-center py-2 rounded-md ${
                isToday(date) ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
              }`}>
                <div className="text-sm font-medium">{format(date, 'EEE')}</div>
                <div className="text-lg font-semibold">{format(date, 'd')}</div>
              </div>
              
              <div className={`h-1 w-full ${
                isAvailable ? 'bg-green-500' : 'bg-gray-200'
              } rounded-full`}></div>
              
              <div className="h-64 overflow-y-auto">
                {renderTimeSlots(date)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="pt-4">
        <button
          type="button"
          onClick={() => saveAvailability(false)}
          disabled={saving || Object.keys(selectedSlots).length === 0}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set your available time slots for appointments.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {showRecurring ? 'Recurring Schedule' : 'Calendar View'}
            </h3>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setShowRecurring(true)}
                className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
                  showRecurring 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              >
                Recurring
              </button>
              <button
                type="button"
                onClick={() => setShowRecurring(false)}
                className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
                  !showRecurring 
                    ? 'bg-blue-100 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                } text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              >
                Calendar
              </button>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {showRecurring 
              ? 'Set your regular weekly availability' 
              : 'Set specific availability for individual days'}
          </p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : showRecurring ? (
            renderRecurringSchedule()
          ) : (
            renderCalendarView()
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
