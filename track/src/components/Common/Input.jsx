// ======================================
// Input Component - مكون حقل الإدخال
// ======================================

import React from 'react';
const Select = ({ 
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = '',
  className = ''
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-orange-200'}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  className = '',
  icon = null,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-orange-400 group-focus-within:text-orange-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-field ${icon ? 'pr-12' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-orange-200'}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

// PhoneInput Component - مكون حقل الهاتف مع كود الدولة
const PhoneInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = '1012345678',
  required = false,
  disabled = false,
  error = '',
  className = '',
  countryCode = '+20'
}) => {
  const handlePhoneChange = (e) => {
    let phoneValue = e.target.value;
    
    // إزالة أي حروف أو رموز غير الأرقام
    phoneValue = phoneValue.replace(/[^0-9]/g, '');
    
    // تحديث القيمة مع كود الدولة
    const newEvent = {
      target: {
        name: name,
        value: phoneValue ? `${countryCode}${phoneValue}` : ''
      }
    };
    
    onChange(newEvent);
  };

  // استخراج الأرقام بعد كود الدولة
  const phoneNumbers = value && value.startsWith(countryCode) 
    ? value.slice(countryCode.length) 
    : value || '';

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 text-lg">*</span>}
        </label>
      )}
      <div className="relative group flex">
        {/* كود الدولة الثابت */}
        <div className="flex items-center px-3 bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg text-gray-600 font-medium text-sm group-focus-within:border-orange-400 transition-colors">
          {countryCode}
        </div>
        {/* حقل إدخال الأرقام */}
        <input
          type="tel"
          id={name}
          name={name}
          value={phoneNumbers}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`flex-1 px-3 py-2.5 border border-gray-200 rounded-l-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm ${
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''
          } ${
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-orange-200'
          }`}
          maxLength="10"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
      {!error && (
        <p className="mt-1 text-xs text-gray-500">
          يبدأ تلقائياً بـ {countryCode} - أدخل الأرقام المتبقية فقط
        </p>
      )}
    </div>
  );
};

export { Select, PhoneInput };
export default Input;