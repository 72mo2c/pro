import React from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { FaExclamationTriangle, FaCalendarTimes, FaEnvelope, FaPhone, FaSignOutAlt } from 'react-icons/fa';

// صفحة انتهاء الاشتراك
const SubscriptionExpired = () => {
    const { selectedCompany, subscription, logoutCompany } = useCompany();

    const handleLogout = () => {
        logoutCompany();
    };

    // حساب عدد الأيام منذ انتهاء الاشتراك
    const getDaysExpired = () => {
        if (!subscription || !subscription.endDate) return 0;
        
        const endDate = new Date(subscription.endDate);
        const today = new Date();
        const diffTime = today - endDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
                
                {/* الأيقونة */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <FaExclamationTriangle className="text-white text-5xl" />
                        </div>
                    </div>
                </div>

                {/* العنوان */}
                <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-3">
                    اشتراكك منتهي
                </h1>
                
                <p className="text-center text-gray-600 mb-8">
                    للأسف، انتهت صلاحية اشتراك شركتك في نظام Bero System
                </p>

                {/* معلومات الشركة */}
                {selectedCompany && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                {selectedCompany.logo ? (
                                    <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-blue-600">
                                        {selectedCompany.name?.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 text-right">
                                <h3 className="text-xl font-bold text-gray-800">{selectedCompany.name}</h3>
                                <p className="text-sm text-gray-600">المعرف: {selectedCompany.identifier}</p>
                            </div>
                        </div>

                        {subscription && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">الخطة</p>
                                        <p className="font-semibold text-gray-800 capitalize">{subscription.plan}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">تاريخ الانتهاء</p>
                                        <p className="font-semibold text-red-600">
                                            {new Date(subscription.endDate).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </div>
                                
                                {getDaysExpired() > 0 && (
                                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                                        <FaCalendarTimes className="text-red-600" />
                                        <p className="text-sm text-red-700">
                                            انتهى منذ <span className="font-bold">{getDaysExpired()}</span> يوم
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* خطوات التجديد */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 text-right">
                        📋 لتجديد اشتراكك:
                    </h3>
                    <ol className="space-y-3 text-right">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                            <span className="text-gray-700">تواصل مع فريق الدعم الفني</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                            <span className="text-gray-700">اختر الخطة المناسبة لشركتك</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                            <span className="text-gray-700">أكمل عملية الدفع والتفعيل</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                            <span className="text-gray-700">سيتم تفعيل حسابك فوراً بعد الدفع</span>
                        </li>
                    </ol>
                </div>

                {/* معلومات التواصل */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <FaEnvelope className="text-green-600 text-xl" />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                            <a href="mailto:support@berosystem.com" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                                support@berosystem.com
                            </a>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaPhone className="text-blue-600 text-xl" />
                        </div>
                        <div className="flex-1 text-right">
                            <p className="text-xs text-gray-500 mb-1">الهاتف</p>
                            <a href="tel:+201234567890" className="text-sm font-semibold text-blue-600 hover:text-blue-800" dir="ltr">
                                +20 123 456 7890
                            </a>
                        </div>
                    </div>
                </div>

                {/* زر تسجيل الخروج */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                    <FaSignOutAlt />
                    تسجيل الخروج
                </button>

                {/* ملاحظة */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    جميع بياناتك محفوظة بأمان. بمجرد تجديد الاشتراك، ستتمكن من الوصول إلى جميع بياناتك مرة أخرى.
                </p>
            </div>
        </div>
    );
};

export default SubscriptionExpired;
