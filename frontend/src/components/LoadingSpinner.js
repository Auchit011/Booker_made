import React from 'react';

function LoadingSpinner({ size = 'md', color = 'blue' }) {
  const sizeClasses = {
    xs: 'h-4 w-4 border-2',
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-[4px]',
  };

  const colorClasses = {
    blue: 'border-t-blue-600 border-b-blue-100',
    green: 'border-t-green-600 border-b-green-100',
    red: 'border-t-red-600 border-b-red-100',
    yellow: 'border-t-yellow-500 border-b-yellow-100',
    indigo: 'border-t-indigo-600 border-b-indigo-100',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div 
          className={`absolute inset-0 rounded-full border-2 ${colorClasses[color].replace('border-t-', 'border-')} opacity-20`}
        ></div>
        
        {/* Animated spinner */}
        <div 
          className={`absolute inset-0 rounded-full animate-spin ${colorClasses[color]} border-l-transparent border-r-transparent`}
          style={{
            animation: 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          }}
        ></div>
      </div>
      
      {/* Optional loading text */}
      <span className="text-sm font-medium text-gray-500">Loading...</span>
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
