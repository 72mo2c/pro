// ======================================
// Confirmation Modal Component - مكون نافذة التأكيد
// ======================================

import React from 'react';
import { FaQuestionCircle, FaExclamationTriangle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm', // confirm, warning, danger, info
  variant = 'confirm', // إضافة دعم لـ variant كبديل لـ type
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  icon,
  children,
  onCancel // إضافة دعم لـ onCancel كبديل لـ onClose
}) => {
  // استخدام variant إذا كان متوفراً، وإلا استخدم type
  const modalType = variant || type;
  if (!isOpen) return null;

  // دعم كلاً من onClose و onCancel
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
    if (onCancel) {
      onCancel();
    }
  };

  const getTypeStyles = () => {
    switch (modalType) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBtnClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBtnClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBtnClass: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      default: // confirm
        return {
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          confirmBtnClass: 'bg-green-600 hover:bg-green-700 text-white'
        };
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (modalType) {
      case 'danger':
        return <FaExclamationTriangle className="text-red-600" size={18} />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-600" size={18} />;
      case 'info':
        return <FaInfoCircle className="text-blue-600" size={18} />;
      default:
        return <FaQuestionCircle className="text-green-600" size={18} />;
    }
  };

  const styles = getTypeStyles();
  const IconComponent = getIcon();

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-3">
        <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className={`${styles.iconBg} ${styles.iconColor} p-1.5 rounded-full flex-shrink-0`}>
                {IconComponent}
              </div>
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 leading-relaxed text-right text-sm">
              {message}
            </p>
            {children}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
            >
              {cancelText}
            </Button>
            <Button
              className={styles.confirmBtnClass}
              onClick={handleConfirm}
              size="sm"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;