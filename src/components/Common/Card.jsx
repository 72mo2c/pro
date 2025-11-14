// ======================================
// Card Component - مكون البطاقة
// ======================================

import React from 'react';

const Card = ({ 
  title, 
  children, 
  icon = null, 
  className = '',
  headerAction = null,
  footer = null,
  variant = 'default' // default, glass, gradient
}) => {
  
  const variantClasses = {
    default: 'card',
    glass: 'glass-card rounded-xl p-4 transition-all duration-300 hover:shadow-xl',
    gradient: 'rounded-xl p-4 transition-all duration-300 hover:shadow-xl gradient-orange-soft border border-orange-200'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {(title || icon || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-orange-100">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-orange-600 text-2xl p-1.5 bg-orange-50 rounded-lg">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                {title}
              </h3>
            )}
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-3 border-t-2 border-orange-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
