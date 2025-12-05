import React, { useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { FaCrown, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// مكون عرض معلومات الاشتراك
const SubscriptionInfo = () => {
    const { subscription, getDaysRemaining, selectedCompany } = useCompany();
    const [showDetails, setShowDetails] = useState(false);

    if (!subscription) return null;

    const daysRemaining = getDaysRemaining();
    const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
    const isExpired = subscription.status !== 'active' || daysRemaining <= 0;

    // اختيار اللون حسب الحالة
    const getStatusColor = () => {
        if (isExpired) return 'red';
        if (isExpiringSoon) return 'yellow';
        return 'green';
    };

    const statusColor = getStatusColor();

    // الحصول على اسم الخطة بالعربية
    const getPlanName = () => {
        const plans = {
            'free': 'مجاني',
            'basic': 'أساسي',
            'standard': 'قياسي',
            'premium': 'مميز',
            'enterprise': 'مؤسسات'
        };
        return plans[subscription.plan] || subscription.plan;
    };

    return (
        <div className="relative">
            {/* زر عرض الاشتراك */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    statusColor === 'red' 
                        ? 'bg-red-50 hover:bg-red-100 text-red-700' 
                        : statusColor === 'yellow'
                        ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                }`}
            >
                <FaCrown className="text-sm" />
                <span className="text-sm font-medium hidden md:inline">
                    {getPlanName()}
                </span>
                {isExpiringSoon && !isExpired && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {daysRemaining} يوم
                    </span>
                )}
                {isExpired && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        منتهي
                    </span>
                )}
            </button>

            {/* نافذة التفاصيل */}
            {showDetails && (
                <>
                    {/* خلفية شفافة للإغلاق */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDetails(false)}
                    ></div>

                    {/* المحتوى */}
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                        {/* الهيدر */}
                        <div className={`p-4 ${
                            statusColor === 'red' 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : statusColor === 'yellow'
                                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                                : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FaCrown className="text-white text-xl" />
                                    <h3 className="text-white font-bold text-lg">معلومات الاشتراك</h3>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <p className="text-white text-sm opacity-90">{selectedCompany?.name}</p>
                        </div>

                        {/* المحتوى */}
                        <div className="p-4">
                            {/* الخطة */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">الخطة الحالية</span>
                                    <span className="font-bold text-gray-800 capitalize">{getPlanName()}</span>
                                </div>
                            </div>

                            {/* الحالة */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">حالة الاشتراك</span>
                                    <div className="flex items-center gap-2">
                                        {isExpired ? (
                                            <>
                                                <FaExclamationTriangle className="text-red-500" />
                                                <span className="font-semibold text-red-600">منتهي</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle className="text-green-500" />
                                                <span className="font-semibold text-green-600">نشط</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* التاريخ */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaCalendarAlt className="text-gray-400" />
                                    <span className="text-sm text-gray-600">تاريخ الانتهاء</span>
                                </div>
                                <p className="font-semibold text-gray-800 mr-6">
                                    {new Date(subscription.endDate).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* الأيام المتبقية */}
                            {!isExpired && (
                                <div className={`rounded-lg p-3 ${
                                    isExpiringSoon ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-medium ${
                                            isExpiringSoon ? 'text-yellow-700' : 'text-green-700'
                                        }`}>
                                            الأيام المتبقية
                                        </span>
                                        <span className={`text-2xl font-bold ${
                                            isExpiringSoon ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                            {daysRemaining}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* تحذير قرب الانتهاء */}
                            {isExpiringSoon && !isExpired && (
                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-yellow-700">
                                            اشتراكك على وشك الانتهاء! يرجى التجديد لتجنب انقطاع الخدمة.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* الميزات */}
                            {subscription.features && subscription.features.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">الميزات المفعلة</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {subscription.features.slice(0, 4).map((feature, index) => (
                                            <span 
                                                key={index}
                                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                        {subscription.features.length > 4 && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                +{subscription.features.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* الحدود */}
                            {subscription.limits && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">حدود الاستخدام</h4>
                                    <div className="space-y-2 text-xs text-gray-600">
                                        {subscription.limits.maxUsers && (
                                            <div className="flex justify-between">
                                                <span>المستخدمين</span>
                                                <span className="font-medium">{subscription.limits.maxUsers}</span>
                                            </div>
                                        )}
                                        {subscription.limits.maxProducts && (
                                            <div className="flex justify-between">
                                                <span>المنتجات</span>
                                                <span className="font-medium">{subscription.limits.maxProducts}</span>
                                            </div>
                                        )}
                                        {subscription.limits.maxInvoices && (
                                            <div className="flex justify-between">
                                                <span>الفواتير</span>
                                                <span className="font-medium">{subscription.limits.maxInvoices}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* زر التجديد (إذا كان قريب من الانتهاء أو منتهي) */}
                        {(isExpiringSoon || isExpired) && (
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <a
                                    href="mailto:support@berosystem.com?subject=تجديد الاشتراك"
                                    className={`block w-full text-center py-2 px-4 rounded-lg font-semibold transition-colors ${
                                        isExpired
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                    }`}
                                >
                                    {isExpired ? 'تجديد الآن' : 'تجديد الاشتراك'}
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default SubscriptionInfo;
