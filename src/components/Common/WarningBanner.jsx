// ======================================
// WarningBanner - شريط تحذير لجميع أنحاء النظام
// ======================================

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const WarningBanner = ({ 
  message, 
  type = 'warning', // 'warning', 'error', 'info', 'success'
  className = '',
  showIcon = true,
  dismissible = false,
  onDismiss = null,
  ...props 
}) => {
  // تحديد الألوان حسب النوع
  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-400',
          button: 'text-red-500 hover:text-red-600'
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-400',
          button: 'text-green-500 hover:text-green-600'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-400',
          button: 'text-blue-500 hover:text-blue-600'
        };
      case 'warning':
      default:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-400',
          button: 'text-yellow-500 hover:text-yellow-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-lg p-4
        ${className}
      `}
      {...props}
    >
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              className={`h-5 w-5 ${styles.icon}`}
              aria-hidden="true"
            />
          </div>
        )}
        <div className={`${showIcon ? 'mr-3' : ''} flex-1`}>
          <div className={`text-sm ${styles.text}`}>
            {message}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="flex-shrink-0 mr-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
              onClick={onDismiss}
            >
              <span className="sr-only">إغلاق</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarningBanner;