// ======================================
// System Settings Specialized Hooks - خطافات متخصصة لإعدادات النظام
// ======================================

import { useEffect, useCallback, useRef } from 'react';
import { useSystemSettings as useCoreSettings } from '../hooks/useSystemSettings';

// Hook لإدارة العملة والعرض
export const useCurrency = () => {
  const { settings } = useCoreSettings();
  const currency = settings.general.currency || 'EGP';
  const company = settings.company || {};
  
  const currencyFormats = {
    EGP: { symbol: 'ج.م', decimals: 2 },
    USD: { symbol: '$', decimals: 2 },
    EUR: { symbol: '€', decimals: 2 },
    GBP: { symbol: '£', decimals: 2 },
    IQD: { symbol: 'د.ع', decimals: 0 }
  };
  
  const format = (amount) => {
    const format = currencyFormats[currency] || currencyFormats.EGP;
    return new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: format.decimals,
      maximumFractionDigits: format.decimals
    }).format(amount) + ' ' + format.symbol;
  };
  
  return {
    currency,
    symbol: currencyFormats[currency]?.symbol || 'ج.م',
    format,
    decimals: currencyFormats[currency]?.decimals || 2,
    companyCurrency: company.currencySymbol || 'EGP'
  };
};

// Hook لإدارة التاريخ والوقت
export const useDateTime = () => {
  const { settings } = useCoreSettings();
  const dateFormat = settings.general.dateFormat || 'DD/MM/YYYY';
  const timezone = settings.general.timezone || 'Africa/Cairo';
  
  const format = (date, format = dateFormat) => {
    const d = new Date(date);
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    const parts = new Intl.DateTimeFormat('ar-EG', options).formatToParts(d);
    const formatted = {
      DD: parts.find(p => p.type === 'day')?.value || '',
      MM: parts.find(p => p.type === 'month')?.value || '',
      YYYY: parts.find(p => p.type === 'year')?.value || ''
    };
    
    return format
      .replace('DD', formatted.DD)
      .replace('MM', formatted.MM)
      .replace('YYYY', formatted.YYYY);
  };
  
  const formatDateTime = (date) => {
    const dateStr = format(date);
    const timeStr = new Intl.DateTimeFormat('ar-EG', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(date));
    
    return `${dateStr} ${timeStr}`;
  };
  
  return {
    format,
    formatDateTime,
    timezone,
    dateFormat,
    now: () => new Date().toISOString()
  };
};

// Hook لإدارة الفواتير
export const useInvoiceSettings = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const invoice = settings.invoices || {};
  
  const generateInvoiceNumber = useCallback((currentNumber = null) => {
    const nextNumber = parseInt(currentNumber || invoice.startNumber) + 1;
    return `${invoice.prefix || 'INV'}-${nextNumber.toString().padStart(4, '0')}`;
  }, [invoice]);
  
  const getNextInvoiceNumber = useCallback(() => {
    const lastNumbers = JSON.parse(localStorage.getItem('last_invoice_numbers') || '{}');
    const nextNumber = (lastNumbers[invoice.prefix] || parseInt(invoice.startNumber)) + 1;
    
    // حفظ الرقم الجديد
    lastNumbers[invoice.prefix] = nextNumber;
    localStorage.setItem('last_invoice_numbers', JSON.stringify(lastNumbers));
    
    return `${invoice.prefix || 'INV'}-${nextNumber.toString().padStart(4, '0')}`;
  }, [invoice]);
  
  const calculateTax = useCallback((amount) => {
    if (!invoice.autoCalculateTax) return 0;
    return (amount * (parseFloat(invoice.taxRate) || 0)) / 100;
  }, [invoice]);
  
  const shouldShowLogo = () => invoice.showCompanyLogo !== false;
  const shouldShowTaxNumber = () => invoice.showTaxNumber !== false;
  
  return {
    prefix: invoice.prefix || 'INV',
    startNumber: invoice.startNumber || '1000',
    footerText: invoice.footerText || 'شكراً لتعاملكم معنا',
    taxRate: parseFloat(invoice.taxRate) || 0,
    autoCalculateTax: invoice.autoCalculateTax !== false,
    showLogo: shouldShowLogo(),
    showTaxNumber: shouldShowTaxNumber(),
    pdfQuality: invoice.pdfQuality || 'high',
    defaultPaymentTerms: invoice.defaultPaymentTerms || '30 يوم',
    allowPartialPayments: invoice.allowPartialPayments !== false,
    requireCustomerInfo: invoice.requireCustomerInfo !== false,
    generateInvoiceNumber,
    getNextInvoiceNumber,
    calculateTax,
    updateInvoiceSettings: (updates) => updateMultipleSettings({ invoices: updates })
  };
};

// Hook لإدارة الأمان
export const useSecuritySettings = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const security = settings.security || {};
  
  const getSessionTimeout = () => (parseInt(security.sessionTimeout) || 30) * 60 * 1000; // convert to milliseconds
  const getPasswordMinLength = () => parseInt(security.passwordMinLength) || 6;
  const shouldRequirePasswordChange = () => security.requirePasswordChange === true;
  const isTwoFactorEnabled = () => security.enableTwoFactor === true;
  const getMaxLoginAttempts = () => parseInt(security.maxLoginAttempts) || 5;
  const getLockoutDuration = () => (parseInt(security.accountLockoutDuration) || 15) * 60 * 1000; // convert to milliseconds
  
  const updateSecuritySettings = useCallback((updates) => {
    updateMultipleSettings({ security: updates });
  }, [updateMultipleSettings]);
  
  return {
    sessionTimeout: getSessionTimeout(),
    passwordMinLength: getPasswordMinLength(),
    requirePasswordChange: shouldRequirePasswordChange(),
    passwordRequireSpecial: security.passwordRequireSpecial === true,
    passwordRequireNumbers: security.passwordRequireNumbers === true,
    passwordRequireUppercase: security.passwordRequireUppercase === true,
    enableTwoFactor: isTwoFactorEnabled(),
    enableAuditLog: security.enableAuditLog !== false,
    maxLoginAttempts: getMaxLoginAttempts(),
    lockoutDuration: getLockoutDuration(),
    updateSecuritySettings
  };
};

// Hook للنسخ الاحتياطي التلقائي
export const useAutoBackup = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const backup = settings.backup || {};
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (backup.autoBackup) {
      startAutoBackup();
    } else {
      stopAutoBackup();
    }
    
    return stopAutoBackup;
  }, [backup.autoBackup, backup.frequency, backup.time]);
  
  const startAutoBackup = useCallback(() => {
    stopAutoBackup();
    
    const now = new Date();
    const [hours, minutes] = (backup.time || '00:00').split(':');
    const nextBackup = new Date();
    nextBackup.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // إذا كان الوقت قد مر اليوم، اجعله للغد
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    
    const delay = nextBackup.getTime() - now.getTime();
    
    intervalRef.current = setTimeout(() => {
      performScheduledBackup();
    }, delay);
  }, [backup.time]);
  
  const performScheduledBackup = useCallback(async () => {
    try {
      const backupData = {
        settings,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      
      localStorage.setItem('bero_auto_backup', JSON.stringify(backupData));
      updateMultipleSettings({ backup: { lastBackup: new Date().toISOString() } });
      console.log('🔄 تم تنفيذ النسخ الاحتياطي التلقائي');
    } catch (error) {
      console.error('❌ فشل في النسخ الاحتياطي التلقائي:', error);
    } finally {
      // جدولة النسخة التالية
      startAutoBackup();
    }
  }, [settings, updateMultipleSettings, startAutoBackup]);
  
  const stopAutoBackup = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const toggleAutoBackup = useCallback(() => {
    updateMultipleSettings({
      backup: { autoBackup: !backup.autoBackup }
    });
  }, [backup.autoBackup, updateMultipleSettings]);
  
  return {
    autoBackup: backup.autoBackup === true,
    frequency: backup.frequency || 'daily',
    time: backup.time || '00:00',
    lastBackup: backup.lastBackup,
    retentionDays: parseInt(backup.retentionDays) || 30,
    backupLocation: backup.backupLocation || 'local',
    compressBackup: backup.compressBackup !== false,
    includeImages: backup.includeImages !== false,
    toggleAutoBackup,
    startAutoBackup,
    stopAutoBackup
  };
};

// Hook لإدارة الأداء
export const usePerformanceSettings = () => {
  const { settings } = useCoreSettings();
  const reports = settings.reports || {};
  const intervalRef = useRef(null);
  
  const startAutoRefresh = useCallback((callback, interval = null) => {
    stopAutoRefresh();
    
    const refreshInterval = interval || parseInt(reports.refreshInterval) || 60;
    if (reports.autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(callback, refreshInterval * 1000);
    }
  }, [reports]);
  
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  return {
    autoRefresh: reports.autoRefresh === true,
    refreshInterval: parseInt(reports.refreshInterval) || 60,
    defaultDateRange: parseInt(reports.defaultDateRange) || 30,
    includeSubCategories: reports.includeSubCategories !== false,
    includeZeroValues: reports.includeZeroValues === true,
    showPercentages: reports.showPercentages !== false,
    groupByMonth: reports.groupByMonth === true,
    defaultChartType: reports.defaultChartType || 'bar',
    startAutoRefresh,
    stopAutoRefresh
  };
};

// Hook لاستخدام بيانات الشركة في أي مكان
export const useCompany = () => {
  const { settings } = useCoreSettings();
  const company = settings.company || {};
  
  return {
    name: company.name || 'Bero System',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
    tax: company.tax || '',
    logo: company.logo || ''
  };
};

// Hook لإعدادات الواجهة
export const useUI = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const general = settings.general || {};
  const ui = settings.ui || {};
  
  const toggleSidebar = useCallback(() => {
    updateMultipleSettings({
      ui: { sidebarCollapsed: !ui.sidebarCollapsed }
    });
  }, [ui.sidebarCollapsed, updateMultipleSettings]);
  
  const toggleTheme = useCallback(() => {
    const newTheme = general.theme === 'light' ? 'dark' : 'light';
    updateMultipleSettings({
      general: { theme: newTheme },
      ui: { enableDarkMode: newTheme === 'dark' }
    });
  }, [general.theme, updateMultipleSettings]);
  
  return {
    language: general.language || 'ar',
    theme: general.theme || 'light',
    timezone: general.timezone || 'Africa/Cairo',
    dateFormat: general.dateFormat || 'DD/MM/YYYY',
    currency: general.currency || 'EGP',
    notifications: general.notifications !== false,
    soundEnabled: general.soundEnabled !== false,
    compactMode: ui.compactMode === true,
    showQuickActions: ui.showQuickActions !== false,
    showSearchBar: ui.showSearchBar !== false,
    defaultPageSize: parseInt(ui.defaultPageSize) || 25,
    enableDarkMode: ui.enableDarkMode === true,
    sidebarCollapsed: ui.sidebarCollapsed === true,
    showTooltips: ui.showTooltips !== false,
    enableKeyboardShortcuts: ui.enableKeyboardShortcuts === true,
    enableAnimations: ui.enableAnimations !== false,
    toggleSidebar,
    toggleTheme,
    updateUISettings: (updates) => updateMultipleSettings({ ui: updates })
  };
};

// Hook لإعدادات المخزون
export const useInventorySettings = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const inventory = settings.inventory || {};
  
  return {
    enableBarcodeScanning: inventory.enableBarcodeScanning !== false,
    defaultWarehouse: inventory.defaultWarehouse,
    lowStockThreshold: parseInt(inventory.lowStockThreshold) || 10,
    enableBatchTracking: inventory.enableBatchTracking === true,
    enableExpiryTracking: inventory.enableExpiryTracking === true,
    autoGenerateProductCodes: inventory.autoGenerateProductCodes !== false,
    allowNegativeStock: inventory.allowNegativeStock === true,
    roundToNearest: parseFloat(inventory.roundToNearest) || 1,
    updateInventorySettings: (updates) => updateMultipleSettings({ inventory: updates })
  };
};

// Hook لإعدادات العملاء والموردين
export const useContactsSettings = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const contacts = settings.contacts || {};
  
  return {
    requireCustomerApproval: contacts.requireCustomerApproval === true,
    allowCustomerSelfRegistration: contacts.allowCustomerSelfRegistration === true,
    defaultCreditLimit: parseFloat(contacts.defaultCreditLimit) || 0,
    enableCreditLimit: contacts.enableCreditLimit === true,
    paymentTermsDays: parseInt(contacts.paymentTermsDays) || 30,
    enableSupplierPortal: contacts.enableSupplierPortal === true,
    requireSupplierApproval: contacts.requireSupplierApproval === true,
    updateContactsSettings: (updates) => updateMultipleSettings({ contacts: updates })
  };
};

// Hook لإعدادات التقارير
export const useReportsSettings = () => {
  const { settings, updateMultipleSettings } = useCoreSettings();
  const reports = settings.reports || {};
  
  return {
    defaultDateRange: parseInt(reports.defaultDateRange) || 30,
    includeSubCategories: reports.includeSubCategories !== false,
    includeZeroValues: reports.includeZeroValues === true,
    showPercentages: reports.showPercentages !== false,
    groupByMonth: reports.groupByMonth === true,
    defaultChartType: reports.defaultChartType || 'bar',
    autoRefresh: reports.autoRefresh === false,
    refreshInterval: parseInt(reports.refreshInterval) || 60,
    updateReportsSettings: (updates) => updateMultipleSettings({ reports: updates })
  };
};

// Hook للتحقق من الميزات المفعلة
export const useFeatureToggle = () => {
  const { settings } = useCoreSettings();
  
  const isEnabled = useCallback((featureName) => {
    const featureMap = {
      'barcode_scanning': settings.inventory.enableBarcodeScanning,
      'batch_tracking': settings.inventory.enableBatchTracking,
      'expiry_tracking': settings.inventory.enableExpiryTracking,
      'audit_log': settings.security.enableAuditLog,
      'two_factor': settings.security.enableTwoFactor,
      'email_notifications': settings.notifications.emailNotifications,
      'low_stock_alerts': settings.notifications.lowStockAlerts,
      'auto_backup': settings.backup.autoBackup,
      'customer_self_registration': settings.contacts.allowCustomerSelfRegistration,
      'supplier_portal': settings.contacts.enableSupplierPortal
    };

    return Boolean(featureMap[featureName]);
  }, [settings]);
  
  return {
    isEnabled,
    features: {
      barcodeScanning: isEnabled('barcode_scanning'),
      batchTracking: isEnabled('batch_tracking'),
      expiryTracking: isEnabled('expiry_tracking'),
      auditLog: isEnabled('audit_log'),
      twoFactor: isEnabled('two_factor'),
      emailNotifications: isEnabled('email_notifications'),
      lowStockAlerts: isEnabled('low_stock_alerts'),
      autoBackup: isEnabled('auto_backup'),
      customerSelfRegistration: isEnabled('customer_self_registration'),
      supplierPortal: isEnabled('supplier_portal')
    }
  };
};