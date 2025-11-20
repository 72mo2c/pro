// ======================================
// Subscription Guard - حماية المسارات بناءً على الاشتراك
// ======================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useCompany } from '../contexts/CompanyContext';
import Loading from '../components/Common/Loading';

/**
 * مكون للتحقق من صلاحية الاشتراك قبل الوصول للصفحات
 */
const SubscriptionGuard = ({ children }) => {
  const { subscription, isSubscriptionValid, isLoading, selectedCompany } = useCompany();

  // انتظار التحميل
  if (isLoading) {
    return <Loading fullScreen message="جاري التحقق من الاشتراك..." />;
  }

  // التحقق من وجود شركة مختارة
  if (!selectedCompany) {
    return <Navigate to="/company-select" replace />;
  }

  // التحقق من صلاحية الاشتراك
  if (!subscription || !isSubscriptionValid()) {
    return <Navigate to="/subscription-expired" replace />;
  }

  // كل شيء صحيح، عرض المحتوى
  return <>{children}</>;
};

/**
 * مكون للتحقق من ميزة معينة في الاشتراك
 */
export const FeatureGuard = ({ feature, fallback, children }) => {
  const { hasFeature } = useCompany();

  if (!hasFeature(feature)) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ميزة غير متاحة</h3>
          <p className="text-gray-600 mb-4">
            هذه الميزة غير متوفرة في خطتك الحالية
          </p>
          <p className="text-sm text-gray-500 mb-4">
            يرجى الترقية للخطة المناسبة للوصول إلى هذه الميزة
          </p>
          <a
            href="mailto:support@berosystem.com?subject=الترقية للخطة المميزة"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تواصل معنا للترقية
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * مكون للتحقق من الحدود
 */
export const LimitGuard = ({ limitType, currentValue, onLimitReached, children }) => {
  const { checkLimit } = useCompany();

  const canProceed = checkLimit(limitType, currentValue);

  if (!canProceed) {
    if (onLimitReached) {
      return onLimitReached();
    }

    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-3">
            <p className="text-sm text-yellow-700">
              لقد وصلت إلى الحد الأقصى المسموح في خطتك الحالية.
              يرجى الترقية للخطة الأعلى لإضافة المزيد.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook للتحقق من الحدود في أي مكان
 */
export const useSubscriptionLimits = () => {
  const { subscription, checkLimit } = useCompany();

  const canAddMore = (limitType, currentCount) => {
    return checkLimit(limitType, currentCount);
  };

  const getRemainingLimit = (limitType, currentCount) => {
    if (!subscription || !subscription.limits || !subscription.limits[limitType]) {
      return Infinity;
    }

    const limit = subscription.limits[limitType];
    return Math.max(0, limit - currentCount);
  };

  const getLimitPercentage = (limitType, currentCount) => {
    if (!subscription || !subscription.limits || !subscription.limits[limitType]) {
      return 0;
    }

    const limit = subscription.limits[limitType];
    return Math.min(100, (currentCount / limit) * 100);
  };

  return {
    canAddMore,
    getRemainingLimit,
    getLimitPercentage,
  };
};

export default SubscriptionGuard;
