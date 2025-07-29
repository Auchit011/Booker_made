import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaChevronRight, FaHome, FaEnvelope, FaPhone } from 'react-icons/fa';

function SuccessPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [checkmarkVisible, setCheckmarkVisible] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Trigger animations with delays
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setCheckmarkVisible(true), 300);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div 
        className={`max-w-2xl mx-auto transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl"
        >
          <div className="p-8 sm:p-10 text-center">
            {/* Animated Checkmark */}
            <div className="relative mx-auto flex items-center justify-center h-24 w-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-green-100 transform scale-0 transition-transform duration-700 ease-out" 
                   style={checkmarkVisible ? { transform: 'scale(1)' } : {}}>
              </div>
              <div className={`relative text-green-600 transition-all duration-700 ${checkmarkVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <FaCheck className="h-16 w-16" />
              </div>
            </div>

            <h2 
              className={`text-3xl font-bold text-gray-900 mb-3 transition-all duration-500 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Booking Confirmed!
            </h2>
            
            <p 
              className={`text-lg text-gray-600 mb-8 max-w-md mx-auto transition-all duration-500 delay-150 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Thank you for choosing our service. Your booking has been successfully received and we've sent a confirmation to your email.
            </p>

            <div 
              className={`space-y-4 transition-all duration-500 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <div className="bg-blue-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h3 className="font-medium text-gray-900 mb-2">What's next?</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FaEnvelope className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You'll receive a confirmation email with all the details</span>
                  </li>
                  <li className="flex items-start">
                    <FaPhone className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Our team will contact you shortly to confirm the schedule</span>
                  </li>
                  <li className="flex items-start">
                    <FaEnvelope className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Feel free to contact us if you have any questions</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleBackHome}
                  className="group w-full max-w-xs mx-auto px-8 py-3.5 text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FaHome className="h-4 w-4" />
                    <span>Back to Home</span>
                  </div>
                </button>
                
                <p className="mt-4 text-sm text-gray-500">
                  Need help?{' '}
                  <a href="#" className="font-medium text-green-600 hover:text-green-700 transition-colors">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Booking ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </div>
        </div>
        
        <div 
          className={`mt-8 text-center text-sm text-gray-500 transition-all duration-500 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p>© {new Date().getFullYear()} Booking App. All rights reserved.</p>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .checkmark-container {
          animation: scaleIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default SuccessPage;
