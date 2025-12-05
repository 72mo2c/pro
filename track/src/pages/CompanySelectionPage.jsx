import React, { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import { FaBuilding, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaWifi, FaExclamationTriangle } from 'react-icons/fa';

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-center">جاري التحميل...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                
                {/* تحذير عدم الاتصال */}
                {!isOnline && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <FaWifi className="text-red-600 text-xl" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">لا يوجد اتصال بالإنترنت</p>
                            <p className="text-xs text-red-600">يرجى التحقق من الاتصال للمتابعة</p>
                        </div>
                    </div>
                )}
                
                {/* عرض المرحلة الحالية */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            1
                        </div>
                        <div className={`h-1 w-16 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                            2
                        </div>
                    </div>
                </div>
                
                {/* عنوان الصفحة */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <FaBuilding className="text-blue-600 text-2xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        {step === 1 ? 'اختيار الشركة' : 'تسجيل الدخول'}
                    </h1>
                    <p className="text-gray-600">
                        {step === 1 
                            ? 'يرجى إدخال معرف شركتك للمتابعة' 
                            : `تسجيل الدخول إلى ${foundCompany?.name || 'الشركة'}`
                        }
                    </p>
                </div>
                
                {/* المرحلة الأولى: اختيار الشركة */}
                {step === 1 && (
                    <form onSubmit={handleCompanySearch} className="space-y-4">
                        <div>
                            <label htmlFor="companyIdentifier" className="block text-sm font-medium text-gray-700 mb-2">
                                معرف الشركة
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <FaBuilding className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="companyIdentifier"
                                    value={companyIdentifier}
                                    onChange={(e) => setCompanyIdentifier(e.target.value)}
                                    className="block w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right"
                                    placeholder="أدخل معرف شركتك"
                                    disabled={verifyingIdentifier || !isOnline}
                                />
                            </div>
                            {identifierError && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <FaExclamationTriangle />
                                    <span>{identifierError}</span>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={verifyingIdentifier || !isOnline}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {verifyingIdentifier ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    جاري التحقق...
                                </>
                            ) : (
                                <>
                                    <FaSignInAlt />
                                    المتابعة
                                </>
                            )}
                        </button>
                    </form>
                )}
                
                {/* المرحلة الثانية: تسجيل الدخول */}
                {step === 2 && foundCompany && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* معلومات الشركة */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    {foundCompany.logo ? (
                                        <img src={foundCompany.logo} alt={foundCompany.name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <FaBuilding className="text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1 text-right">
                                    <h3 className="font-medium text-gray-800">{foundCompany.name}</h3>
                                    <p className="text-sm text-gray-600">المعرف: {foundCompany.identifier}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* حقل كلمة المرور */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right"
                                    placeholder="أدخل كلمة المرور"
                                    disabled={isLoggingIn || !isOnline}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 left-3 flex items-center"
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <FaEye className="text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {loginError && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <FaExclamationTriangle />
                                    <span>{loginError}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* أزرار التنقل */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleBackToStep1}
                                disabled={isLoggingIn}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                            >
                                العودة
                            </button>
                            <button
                                type="submit"
                                disabled={isLoggingIn || !isOnline}
                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoggingIn ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        جاري الدخول...
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt />
                                        دخول
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
                
                {/* تذييل */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        نظام إدارة الشركات SaaS
                    </p>
                    <p className="text-xs text-gray-400 text-center mt-1">
                        &copy; 2025 Bero System - جميع الحقوق محفوظة
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompanySelectionPage;
