import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaWifi, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

// صفحة اختيار الشركة مع تسجيل الدخول على مرحلتين
const CompanySelectionPage = () => {
    const { 
        verifyCompanyIdentifier,
        loginCompany,
        isLoading, 
        error: contextError,
        isOnline
    } = useCompany();
    
    const navigate = useNavigate();
    
    // حالة اختيار المرحلة
    const [step, setStep] = useState(1); // 1 = اختيار الشركة، 2 = تسجيل الدخول
    
    // بيانات المرحلة الأولى
    const [companyIdentifier, setCompanyIdentifier] = useState('');
    const [foundCompany, setFoundCompany] = useState(null);
    const [identifierError, setIdentifierError] = useState('');
    const [verifyingIdentifier, setVerifyingIdentifier] = useState(false);
    
    // بيانات المرحلة الثانية
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    // إعادة تعيين الصفحة عند كل تحميل
    useEffect(() => {
        setStep(1);
        setCompanyIdentifier('');
        setFoundCompany(null);
        setPassword('');
        setIdentifierError('');
        setLoginError('');
    }, []);
    
    // البحث عن الشركة بالمعرف
    const handleCompanySearch = async (e) => {
        e.preventDefault();
        setIdentifierError('');
        
        if (!companyIdentifier.trim()) {
            setIdentifierError('يرجى إدخال معرف الشركة');
            return;
        }
        
        if (!isOnline) {
            setIdentifierError('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال.');
            return;
        }
        
        setVerifyingIdentifier(true);
        
        try {
            const companyData = await verifyCompanyIdentifier(companyIdentifier.trim());
            
            if (!companyData) {
                setIdentifierError('معرف الشركة غير صحيح');
                return;
            }
            
            if (!companyData.isActive) {
                setIdentifierError('هذه الشركة غير مفعلة حالياً. يرجى التواصل مع الدعم.');
                return;
            }
            
            setFoundCompany(companyData);
            setStep(2);
            
        } catch (err) {
            console.error('خطأ في البحث عن الشركة:', err);
            setIdentifierError(err.message || 'فشل في التحقق من معرف الشركة');
        } finally {
            setVerifyingIdentifier(false);
        }
    };
    
    // تسجيل الدخول
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        
        if (!password.trim()) {
            setLoginError('يرجى إدخال كلمة المرور');
            return;
        }
        
        if (!isOnline) {
            setLoginError('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال.');
            return;
        }
        
        setIsLoggingIn(true);
        
        try {
            const result = await loginCompany(companyIdentifier, password);
            
            if (!result.success) {
                setLoginError(result.message);
                return;
            }
            
            // نجح تسجيل الدخول - التوجه للنظام
            navigate('/login');
            
        } catch (err) {
            console.error('خطأ في تسجيل الدخول:', err);
            setLoginError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setIsLoggingIn(false);
        }
    };
    
    // العودة إلى الخطوة الأولى
    const handleBackToStep1 = () => {
        setStep(1);
        setPassword('');
        setLoginError('');
    };
    
    // إذا كان التطبيق في وضع التحميل
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center relative overflow-hidden">
                {/* خلفية متحركة */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative z-10">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-700 text-center mt-4 font-medium">جاري التحميل...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* خلفية متحركة */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* شبكة خلفية */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]"></div>
            
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full relative z-10 border border-white/20 transform transition-all duration-500 hover:shadow-3xl">
                
                {/* تحذير عدم الاتصال */}
                {!isOnline && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3 shadow-sm animate-shake">
                        <div className="bg-red-500 p-2 rounded-lg">
                            <FaWifi className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">لا يوجد اتصال بالإنترنت</p>
                            <p className="text-xs text-red-600 mt-0.5">يرجى التحقق من الاتصال للمتابعة</p>
                        </div>
                    </div>
                )}
                
                {/* عرض المرحلة الحالية - تصميم محسّن */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {/* الخطوة 1 */}
                        <div className={`relative transition-all duration-500 ${step >= 1 ? 'scale-110' : 'scale-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                                step >= 1 
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/50' 
                                    : 'bg-gray-200 text-gray-500'
                            }`}>
                                {step > 1 ? <FaCheckCircle className="text-lg" /> : '1'}
                            </div>
                            {step >= 1 && (
                                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                            )}
                        </div>
                        
                        {/* الخط الفاصل */}
                        <div className="relative h-1 w-20">
                            <div className="absolute h-full w-full bg-gray-200 rounded-full"></div>
                            <div className={`absolute h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ${
                                step >= 2 ? 'w-full' : 'w-0'
                            }`}></div>
                        </div>
                        
                        {/* الخطوة 2 */}
                        <div className={`relative transition-all duration-500 ${step >= 2 ? 'scale-110' : 'scale-100'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shadow-lg ${
                                step >= 2 
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/50' 
                                    : 'bg-gray-200 text-gray-500'
                            }`}>
                                2
                            </div>
                            {step >= 2 && (
                                <div className="absolute inset-0 rounded-full bg-indigo-400 opacity-30 animate-ping"></div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* عنوان الصفحة - تصميم محسّن */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${
                        step === 1 ? 'from-blue-500 to-indigo-600' : 'from-indigo-600 to-purple-600'
                    } rounded-2xl mb-4 shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-3`}>
                        {step === 1 ? (
                            <FaBuilding className="text-white text-3xl" />
                        ) : (
                            <FaLock className="text-white text-3xl" />
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                        {step === 1 ? 'اختيار الشركة' : 'تسجيل الدخول'}
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {step === 1 
                            ? 'يرجى إدخال معرف شركتك للمتابعة' 
                            : `مرحباً بك في ${foundCompany?.name || 'الشركة'}`
                        }
                    </p>
                </div>
                
                {/* المرحلة الأولى: اختيار الشركة */}
                {step === 1 && (
                    <form onSubmit={handleCompanySearch} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="companyIdentifier" className="block text-sm font-semibold text-gray-700">
                                معرف الشركة
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none transition-colors">
                                    <FaBuilding className={`transition-colors ${
                                        companyIdentifier ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                </div>
                                <input
                                    type="text"
                                    id="companyIdentifier"
                                    value={companyIdentifier}
                                    onChange={(e) => setCompanyIdentifier(e.target.value)}
                                    className="block w-full pr-10 pl-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-right bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    placeholder="أدخل معرف شركتك"
                                    disabled={verifyingIdentifier || !isOnline}
                                    autoFocus
                                />
                            </div>
                            {identifierError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-slideDown">
                                    <FaExclamationTriangle className="flex-shrink-0" />
                                    <span className="font-medium">{identifierError}</span>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={verifyingIdentifier || !isOnline}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] group"
                        >
                            {verifyingIdentifier ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    <span>جاري التحقق...</span>
                                </>
                            ) : (
                                <>
                                    <span>المتابعة</span>
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
                
                {/* المرحلة الثانية: تسجيل الدخول */}
                {step === 2 && foundCompany && (
                    <form onSubmit={handleLogin} className="space-y-5 animate-slideIn">
                        {/* معلومات الشركة - تصميم محسّن */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                        {foundCompany.logo ? (
                                            <img 
                                                src={foundCompany.logo} 
                                                alt={foundCompany.name} 
                                                className="w-12 h-12 rounded-lg object-cover" 
                                            />
                                        ) : (
                                            <FaBuilding className="text-white text-xl" />
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                </div>
                                <div className="flex-1 text-right">
                                    <h3 className="font-bold text-gray-800 text-lg">{foundCompany.name}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                                        <span className="font-medium">المعرف:</span>
                                        <span className="font-mono bg-white/60 px-2 py-0.5 rounded">{foundCompany.identifier}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* حقل كلمة المرور */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                كلمة المرور
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <FaLock className={`transition-colors ${
                                        password ? 'text-indigo-600' : 'text-gray-400'
                                    }`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pr-10 pl-14 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right bg-gray-50/50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    placeholder="أدخل كلمة المرور"
                                    disabled={isLoggingIn || !isOnline}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 left-3 flex items-center transition-colors hover:scale-110 transform"
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="text-gray-400 hover:text-gray-600 text-lg" />
                                    ) : (
                                        <FaEye className="text-gray-400 hover:text-gray-600 text-lg" />
                                    )}
                                </button>
                            </div>
                            {loginError && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-slideDown">
                                    <FaExclamationTriangle className="flex-shrink-0" />
                                    <span className="font-medium">{loginError}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* أزرار التنقل */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleBackToStep1}
                                disabled={isLoggingIn}
                                className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-4 rounded-xl hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/20 transition-all disabled:opacity-50 font-semibold hover:scale-[1.02] active:scale-[0.98] border border-gray-200"
                            >
                                العودة
                            </button>
                            <button
                                type="submit"
                                disabled={isLoggingIn || !isOnline}
                                className="flex-2 flex-grow-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>جاري الدخول...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt />
                                        <span>تسجيل الدخول</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
                
                {/* تذييل محسّن */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="font-medium">نظام إدارة الشركات SaaS</p>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                        &copy; 2025 Bero System - جميع الحقوق محفوظة
                    </p>
                </div>
            </div>

            {/* إضافة CSS مخصص */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                .delay-700 {
                    animation-delay: 700ms;
                }
                
                .delay-1000 {
                    animation-delay: 1000ms;
                }
                
                .bg-grid-white {
                    background-image: linear-gradient(white 1px, transparent 1px),
                                    linear-gradient(90deg, white 1px, transparent 1px);
                }
            `}</style>
        </div>
    );
};

export default CompanySelectionPage;
