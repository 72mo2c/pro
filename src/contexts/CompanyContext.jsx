import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import companyAPI from '../services/companyAPI';
import { saveToken, getToken, clearTokens, isTokenValid, getRefreshToken, needsRefresh } from '../utils/tokenManager';

// السياق الأساسي للشركات (Companies Context)
const CompanyContext = createContext();

// Context Provider للشركات
export function CompanyProvider({ children }) {
    // حالة الشركة المختارة حالياً
    const [selectedCompany, setSelectedCompany] = useState(null);
    
    // معلومات الاشتراك
    const [subscription, setSubscription] = useState(null);
    
    // حالة تحميل البيانات
    const [isLoading, setIsLoading] = useState(true);
    
    // حالة الأخطاء
    const [error, setError] = useState(null);
    
    // حالة الاتصال بالإنترنت
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // مراقبة حالة الاتصال
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // تحميل بيانات الشركة عند بدء التشغيل
    useEffect(() => {
        initializeCompany();
    }, []);

    // تهيئة الشركة من Token المحفوظ
    const initializeCompany = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            // التحقق من وجود Token صالح
            if (!isTokenValid()) {
                console.log('لا يوجد Token صالح');
                setIsLoading(false);
                return;
            }
            
            // محاولة جلب بيانات الشركة
            const companyData = await companyAPI.getCompanyDetails();
            const subscriptionData = await companyAPI.getSubscription();
            
            setSelectedCompany(companyData.data.company);
            setSubscription(subscriptionData.data.subscription);
            
            // حفظ في localStorage كنسخة احتياطية
            localStorage.setItem('selected_company', JSON.stringify(companyData.data.company));
            localStorage.setItem('company_subscription', JSON.stringify(subscriptionData.data.subscription));
            
            console.log('✅ تم تحميل بيانات الشركة بنجاح');
            
        } catch (err) {
            console.error('خطأ في تهيئة الشركة:', err);
            
            // محاولة التحميل من localStorage كنسخة احتياطية
            try {
                const savedCompany = localStorage.getItem('selected_company');
                const savedSubscription = localStorage.getItem('company_subscription');
                
                if (savedCompany && savedSubscription) {
                    setSelectedCompany(JSON.parse(savedCompany));
                    setSubscription(JSON.parse(savedSubscription));
                    console.log('⚠️ تم التحميل من النسخة الاحتياطية (Offline Mode)');
                } else {
                    // لا توجد بيانات محفوظة
                    clearTokens();
                }
            } catch (error) {
                console.error('فشل التحميل من النسخة الاحتياطية:', error);
                clearTokens();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // التحقق من معرف الشركة
    const verifyCompanyIdentifier = async (identifier) => {
        try {
            setError(null);
            
            if (!isOnline) {
                throw { message: 'لا يوجد اتصال بالإنترنت' };
            }
            
            const response = await companyAPI.verifyIdentifier(identifier);
            
            if (!response.success) {
                throw { message: response.message || 'معرف الشركة غير صحيح' };
            }
            
            return response.data;
            
        } catch (err) {
            console.error('خطأ في التحقق من المعرف:', err);
            setError(err.message || 'فشل في التحقق من معرف الشركة');
            throw err;
        }
    };

    // تسجيل دخول الشركة
    const loginCompany = async (identifier, password) => {
        try {
            setIsLoading(true);
            setError(null);
            
            if (!isOnline) {
                throw { message: 'لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.' };
            }
            
            const response = await companyAPI.login(identifier, password);
            
            if (!response.success) {
                throw { message: response.message || 'فشل تسجيل الدخول' };
            }
            
            const { company, subscription, tokens } = response.data;
            
            // حفظ Tokens
            saveToken(tokens.accessToken, tokens.refreshToken, tokens.expiresIn);
            
            // حفظ بيانات الشركة
            setSelectedCompany(company);
            setSubscription(subscription);
            
            // حفظ نسخة احتياطية في localStorage
            localStorage.setItem('selected_company', JSON.stringify(company));
            localStorage.setItem('company_subscription', JSON.stringify(subscription));
            
            console.log('✅ تم تسجيل دخول الشركة بنجاح');
            
            return { success: true, message: 'تم تسجيل الدخول بنجاح' };
            
        } catch (err) {
            console.error('خطأ في تسجيل دخول الشركة:', err);
            const errorMessage = err.message || 'حدث خطأ أثناء تسجيل الدخول';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // تسجيل خروج الشركة
    const logoutCompany = async () => {
        try {
            // محاولة تسجيل الخروج من API
            if (isOnline && getToken()) {
                await companyAPI.logout();
            }
        } catch (err) {
            console.error('خطأ في تسجيل الخروج:', err);
        } finally {
            // حذف جميع البيانات المحلية
            clearTokens();
            localStorage.removeItem('selected_company');
            localStorage.removeItem('company_subscription');
            
            setSelectedCompany(null);
            setSubscription(null);
            setError(null);
            
            // إعادة التوجيه
            window.location.href = '/company-select';
        }
    };

    // تحديث بيانات الشركة
    const refreshCompanyData = async () => {
        try {
            if (!isOnline || !isTokenValid()) {
                return;
            }
            
            const companyData = await companyAPI.getCompanyDetails();
            const subscriptionData = await companyAPI.getSubscription();
            
            setSelectedCompany(companyData.data.company);
            setSubscription(subscriptionData.data.subscription);
            
            // تحديث localStorage
            localStorage.setItem('selected_company', JSON.stringify(companyData.data.company));
            localStorage.setItem('company_subscription', JSON.stringify(subscriptionData.data.subscription));
            
        } catch (err) {
            console.error('خطأ في تحديث بيانات الشركة:', err);
        }
    };

    // تطبيق إعدادات الشركة على الواجهة
    const applyCompanyTheme = useCallback((company) => {
        if (!company) return;
        
        const root = document.documentElement;
        
        // تطبيق الألوان
        root.style.setProperty('--primary-color', company.primaryColor || '#3B82F6');
        root.style.setProperty('--secondary-color', company.secondaryColor || '#64748B');
        
        // تطبيق المظهر (فاتح/داكن)
        if (company.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // تطبيق اللوجو
        const logoElement = document.querySelector('.company-logo');
        if (logoElement && company.logo) {
            logoElement.src = company.logo;
        }
    }, []);

    // تطبيق إعدادات الشركة عند تغيير الشركة المختارة
    useEffect(() => {
        if (selectedCompany) {
            applyCompanyTheme(selectedCompany);
        }
    }, [selectedCompany, applyCompanyTheme]);

    // تجديد Token تلقائياً
    useEffect(() => {
        const refreshInterval = setInterval(async () => {
            if (needsRefresh() && isOnline) {
                try {
                    const refreshToken = getRefreshToken();
                    if (refreshToken) {
                        const response = await companyAPI.refreshToken(refreshToken);
                        saveToken(
                            response.data.accessToken,
                            response.data.refreshToken,
                            response.data.expiresIn
                        );
                        console.log('✅ تم تجديد Token بنجاح');
                    }
                } catch (err) {
                    console.error('فشل تجديد Token:', err);
                    // تسجيل خروج عند فشل التجديد
                    logoutCompany();
                }
            }
        }, 60000); // كل دقيقة
        
        return () => clearInterval(refreshInterval);
    }, [isOnline]);

    // التحقق من صلاحية الاشتراك
    const isSubscriptionValid = useCallback(() => {
        if (!subscription) return false;
        
        return subscription.status === 'active' && 
               new Date(subscription.endDate) > new Date();
    }, [subscription]);

    // الحصول على الأيام المتبقية
    const getDaysRemaining = useCallback(() => {
        if (!subscription || !subscription.endDate) return 0;
        
        const endDate = new Date(subscription.endDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    }, [subscription]);

    // التحقق من وجود ميزة في الخطة
    const hasFeature = useCallback((feature) => {
        if (!subscription || !subscription.features) return false;
        
        return subscription.features.includes(feature);
    }, [subscription]);

    // التحقق من الحدود
    const checkLimit = useCallback((limitType, currentValue) => {
        if (!subscription || !subscription.limits) return true;
        
        const limit = subscription.limits[limitType];
        if (!limit) return true;
        
        return currentValue < limit;
    }, [subscription]);

    // القيم الممررة للسياق
    const value = {
        // الحالة
        selectedCompany,
        subscription,
        isLoading,
        error,
        isOnline,
        
        // Methods
        verifyCompanyIdentifier,
        loginCompany,
        logoutCompany,
        refreshCompanyData,
        applyCompanyTheme,
        
        // Subscription Methods
        isSubscriptionValid,
        getDaysRemaining,
        hasFeature,
        checkLimit,
        
        // Utilities
        isAuthenticated: !!selectedCompany && isTokenValid(),
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
}

// Hook لاستخدام السياق
export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

export default CompanyContext;
