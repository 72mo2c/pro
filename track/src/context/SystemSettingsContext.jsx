// ======================================
// System Settings Context - سياق إعدادات النظام الحقيقية
// ======================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SystemSettingsContext = createContext();

// التقييم الافتراضي للإعدادات
const DEFAULT_SETTINGS = {
  // معلومات الشركة
  company: {
    name: 'Bero System',
    address: '',
    phone: '',
    email: '',
    tax: '',
    logo: '',
    currencySymbol: 'EGP'
  },

  // الإعدادات العامة
  general: {
    language: 'ar',
    timezone: 'Africa/Cairo',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    notifications: {
      enabled: true,
      soundEnabled: true,
      soundVolume: 0.5
    }
  },

  // إعدادات الفواتير
  invoice: {
    prefix: 'INV',
    startNumber: '1000',
    footerText: 'شكراً لتعاملكم معنا',
    showLogo: true,
    showCompanyLogo: true,
    showTaxNumber: true,
    autoCalculateTax: true,
    taxRate: 0,
    includeBranding: true,
    pdfFormat: 'A4',
    pdfQuality: 'high',
    allowPartialPayments: true
  },

  // إعدادات الأمان
  security: {
    sessionTimeout: 30, // minutes
    passwordMinLength: 6,
    requirePasswordChange: false,
    passwordChangeDays: 90,
    enableTwoFactor: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15 // minutes
  },

  // إعدادات النسخ الاحتياطي
  backup: {
    autoBackup: false,
    frequency: 'daily',
    time: '00:00',
    retentionDays: 30,
    lastBackup: null,
    backupLocation: 'local'
  },

  // إعدادات الأداء
  performance: {
    autoRefresh: true,
    refreshInterval: 30, // seconds
    cacheEnabled: true,
    compressionEnabled: true
  },

  // إعدادات المستخدم
  user: {
    preferences: {
      defaultView: 'dashboard',
      itemsPerPage: 25,
      enableTooltips: true,
      enableAnimations: true
    }
  },

  // معلومات النظام
  system: {
    version: '1.0.0',
    lastUpdate: null,
    maintenanceMode: false,
    debugMode: false
  }
};

// مفاتيح التخزين
const STORAGE_KEYS = {
  MAIN: 'bero_system_settings',
  CACHE: 'bero_settings_cache',
  BACKUP: 'bero_settings_backup'
};

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // تحميل الإعدادات عند بدء التشغيل
  useEffect(() => {
    loadSettings();
  }, []);

  // التحقق من التغييرات
  useEffect(() => {
    if (loading) return;
    
    const originalSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.CACHE) || JSON.stringify(settings));
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanges);
  }, [settings, loading]);

  // تحميل الإعدادات من LocalStorage
  const loadSettings = useCallback(() => {
    try {
      setLoading(true);
      const savedSettings = localStorage.getItem(STORAGE_KEYS.MAIN);
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        localStorage.setItem(STORAGE_KEYS.CACHE, savedSettings);
        console.log('✅ تم تحميل إعدادات النظام بنجاح');
      } else {
        console.log('📝 استخدام الإعدادات الافتراضية');
        localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(DEFAULT_SETTINGS));
      }
      
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('❌ خطأ في تحميل الإعدادات:', error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  // حفظ الإعدادات في LocalStorage
  const saveSettings = useCallback(async (newSettings = null) => {
    try {
      const settingsToSave = newSettings || settings;
      
      // إنشاء نسخة احتياطية قبل الحفظ
      await createBackup();
      
      localStorage.setItem(STORAGE_KEYS.MAIN, JSON.stringify(settingsToSave));
      localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(settingsToSave));
      
      setSettings(settingsToSave);
      setHasChanges(false);
      setLastSaved(new Date().toISOString());
      
      // إرسال حدث للإعدادات المحدثة
      window.dispatchEvent(new CustomEvent('systemSettingsUpdated', { 
        detail: settingsToSave 
      }));
      
      console.log('✅ تم حفظ إعدادات النظام بنجاح');
      return true;
    } catch (error) {
      console.error('❌ خطأ في حفظ الإعدادات:', error);
      return false;
    }
  }, [settings]);

  // تحديث إعدادات محددة
  const updateSettings = useCallback((updates) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        ...updates
      };
      
      // حفظ مؤقت للاستجابة السريعة
      setHasChanges(true);
      
      return updatedSettings;
    });
  }, []);

  // تحديث قسم معين من الإعدادات
  const updateSection = useCallback((section, updates) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [section]: {
        ...prevSettings[section],
        ...updates
      }
    }));
    
    setHasChanges(true);
  }, []);

  // تحديث إعدادات متعددة في نفس الوقت
  const updateMultipleSettings = useCallback((updates) => {
    setSettings(prevSettings => {
      const updatedSettings = {
        ...prevSettings,
        ...updates
      };
      
      // حفظ مؤقت للاستجابة السريعة
      setHasChanges(true);
      
      return updatedSettings;
    });
  }, []);

  // الحصول على إعداد محدد
  const getSetting = useCallback((path, defaultValue = null) => {
    const keys = path.split('.');
    let value = settings;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }, [settings]);

  // إعادة تعيين الإعدادات إلى الافتراضية
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  }, []);

  // التراجع عن التغييرات
  const revertChanges = useCallback(() => {
    const cachedSettings = localStorage.getItem(STORAGE_KEYS.CACHE);
    if (cachedSettings) {
      setSettings(JSON.parse(cachedSettings));
      setHasChanges(false);
      console.log('↩️ تم التراجع عن التغييرات');
    }
  }, []);

  // إنشاء نسخة احتياطية
  const createBackup = useCallback(async () => {
    try {
      const backupData = {
        settings,
        timestamp: new Date().toISOString(),
        version: settings.system.version,
        checksum: btoa(JSON.stringify(settings))
      };
      
      localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backupData));
    } catch (error) {
      console.warn('⚠️ فشل في إنشاء النسخة الاحتياطية:', error);
    }
  }, [settings]);

  // استعادة من النسخة الاحتياطية
  const restoreBackup = useCallback(() => {
    try {
      const backupData = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (backupData) {
        const parsed = JSON.parse(backupData);
        setSettings(parsed.settings);
        saveSettings(parsed.settings);
        console.log('🔄 تم استعادة النسخة الاحتياطية بنجاح');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ فشل في استعادة النسخة الاحتياطية:', error);
      return false;
    }
  }, [saveSettings]);

  // تصدير الإعدادات
  const exportSettings = useCallback(() => {
    try {
      const exportData = {
        settings,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: settings.system.version,
          totalSettings: Object.keys(settings).length
        }
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bero-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      console.log('📤 تم تصدير الإعدادات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تصدير الإعدادات:', error);
    }
  }, [settings]);

  // استيراد الإعدادات
  const importSettings = useCallback(async (file) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      if (importedData.settings) {
        await saveSettings(importedData.settings);
        console.log('📥 تم استيراد الإعدادات بنجاح');
        return true;
      } else {
        console.error('❌ ملف الإعدادات غير صحيح');
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في استيراد الإعدادات:', error);
      return false;
    }
  }, [saveSettings]);

  // التحقق من صحة الإعدادات
  const validateSettings = useCallback(() => {
    const errors = [];
    
    // التحقق من معلومات الشركة
    if (!settings.company.name.trim()) {
      errors.push('اسم الشركة مطلوب');
    }
    
    // التحقق من الإعدادات الأمنية
    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480) {
      errors.push('مهلة الجلسة يجب أن تكون بين 5 و 480 دقيقة');
    }
    
    if (settings.security.passwordMinLength < 4) {
      errors.push('الحد الأدنى لطول كلمة المرور يجب أن يكون 4 أحرف على الأقل');
    }
    
    // التحقق من إعدادات الفواتير
    if (settings.invoice.taxRate < 0 || settings.invoice.taxRate > 100) {
      errors.push('نسبة الضريبة يجب أن تكون بين 0 و 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [settings]);

  const value = {
    // الإعدادات
    settings,
    loading,
    hasChanges,
    lastSaved,
    
    // الوظائف الأساسية
    loadSettings,
    saveSettings,
    updateSettings,
    updateMultipleSettings,
    updateSection,
    getSetting,
    
    // إدارة النسخ الاحتياطي
    createBackup,
    restoreBackup,
    exportSettings,
    importSettings,
    
    // إدارة التغييرات
    resetToDefaults,
    resetSettings: resetToDefaults,
    revertChanges,
    
    // التحقق من الصحة
    validateSettings,
    
    // إعدادات محددة للسهولة
    company: settings.company,
    general: settings.general,
    invoice: settings.invoice,
    security: settings.security,
    backup: settings.backup,
    performance: settings.performance,
    user: settings.user
  };

  return (
    <SystemSettingsContext.Provider value={value}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

// Hook لاستخدام إعدادات النظام
export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within SystemSettingsProvider');
  }
  return context;
};

// Hook للقراءة فقط (للاستخدام في المكونات)
export const useSettings = (path = null) => {
  const { getSetting } = useSystemSettings();
  return path ? getSetting(path) : null;
};

// Hook للتحقق من حالة التحميل
export const useSettingsLoading = () => {
  const { loading } = useSystemSettings();
  return loading;
};

// Hook للتحقق من التغييرات
export const useSettingsChanged = () => {
  const { hasChanges } = useSystemSettings();
  return hasChanges;
};