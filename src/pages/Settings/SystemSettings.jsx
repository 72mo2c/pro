// ======================================
// System Settings - إعدادات النظام الحقيقية والمترابطة
// ======================================

import React, { useState, useEffect, useCallback } from 'react';
import { useSystemSettings } from '../../context/SystemSettingsContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Button from '../../components/Common/Button';
import { FaCog, FaBuilding, FaMoneyBillWave, FaFileInvoice, FaShieldAlt, FaDatabase, FaSave, FaUndo, FaDownload, FaUpload, FaCheckCircle } from 'react-icons/fa';

const SystemSettings = () => {
  const { showSuccess, showWarning, showError } = useNotification();
  const { 
    settings, 
    loading, 
    lastSaved,
    updateSettings,
    updateMultipleSettings,
    resetSettings,
    exportSettings,
    importSettings
  } = useSystemSettings();
  
  const [activeTab, setActiveTab] = useState('company');
  const [validationErrors, setValidationErrors] = useState([]);
  
  // مراقبة التغييرات - تحديث الإحصائيات
  useEffect(() => {
    if (!loading && settings) {
      // يمكن إضافة منطق إضافي هنا لمراقبة التغييرات
    }
  }, [settings, loading]);

  // التحقق من صحة البيانات قبل الحفظ
  const validateSettings = useCallback(() => {
    const errors = [];
    
    // التحقق من معلومات الشركة
    if (!settings.company.name.trim()) {
      errors.push('اسم الشركة مطلوب');
    }
    
    // التحقق من الإعدادات الأمنية
    if (parseInt(settings.security?.sessionTimeout || 30) < 5 || parseInt(settings.security?.sessionTimeout || 30) > 480) {
      errors.push('مهلة الجلسة يجب أن تكون بين 5 و 480 دقيقة');
    }
    
    if (parseInt(settings.security?.passwordMinLength || 6) < 4) {
      errors.push('الحد الأدنى لطول كلمة المرور يجب أن يكون 4 أحرف على الأقل');
    }
    
    // التحقق من إعدادات الفواتير
    if (parseFloat(settings.invoice.taxRate) < 0 || parseFloat(settings.invoice.taxRate) > 100) {
      errors.push('نسبة الضريبة يجب أن تكون بين 0 و 100');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [settings]);

  // تحديث إعدادات القسم المحدد
  const handleSectionUpdate = useCallback((sectionName, updates) => {
    updateMultipleSettings({ [sectionName]: updates });
    showSuccess(`تم تحديث إعدادات ${sectionName} بنجاح`);
  }, [updateMultipleSettings, showSuccess]);



  // إعادة تعيين الإعدادات
  const handleReset = useCallback(() => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      resetSettings();
      showWarning('تم إعادة تعيين جميع الإعدادات');
    }
  }, [resetSettings, showWarning]);

  const handleBackupNow = () => {
    const backupData = {
      settings: settings,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bero-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Update backup timestamp
    updateMultipleSettings({ backup: { ...settings.backup, lastBackup: new Date().toISOString() } });
    showSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
  };

  const currencyOptions = [
    { value: 'EGP', label: 'جنيه مصري (EGP)' },
    { value: 'USD', label: 'دولار أمريكي (USD)' },
    { value: 'EUR', label: 'يورو (EUR)' },
    { value: 'GBP', label: 'جنيه استرليني (GBP)' },
    { value: 'IQD', label: 'دينار عراقي (IQD)' }
  ];

  const languageOptions = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' },
    { value: 'ku', label: 'كوردي' }
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'يوم/شهر/سنة' },
    { value: 'MM/DD/YYYY', label: 'شهر/يوم/سنة' },
    { value: 'YYYY-MM-DD', label: 'سنة-شهر-يوم' }
  ];

  const backupFrequencyOptions = [
    { value: 'daily', label: 'يومياً' },
    { value: 'weekly', label: 'أسبوعياً' },
    { value: 'monthly', label: 'شهرياً' }
  ];

  const tabs = [
    { id: 'company', label: 'معلومات الشركة', icon: <FaBuilding /> },
    { id: 'general', label: 'إعدادات عامة', icon: <FaCog /> },
    { id: 'invoice', label: 'إعدادات الفواتير', icon: <FaFileInvoice /> },
    { id: 'security', label: 'الأمان', icon: <FaShieldAlt /> },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: <FaDatabase /> },
    { id: 'advanced', label: 'متقدم', icon: <FaCog /> }
  ];

  // البيانات الحية للـ statistics
  const companyName = settings.company.name || 'Bero System';
  const currency = settings.general.currency || 'EGP';
  const language = settings.general.language || 'ar';
  const twoFactorEnabled = settings.security.enableTwoFactor || false;
  const autoBackupEnabled = settings.backup.autoBackup || false;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">إعدادات النظام</h1>
        {loading && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleReset}>
              <FaUndo className="ml-2" /> تراجع
            </Button>
            <Button variant="success" onClick={() => {
              if (validateSettings()) {
                updateSettings();
                showSuccess('تم حفظ الإعدادات بنجاح');
              } else {
                showError('يرجى تصحيح الأخطاء قبل الحفظ');
              }
            }}>
              <FaSave className="ml-2" /> حفظ التغييرات
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">العملة الأساسية</p>
              <p className="text-2xl font-bold">{currency}</p>
            </div>
            <FaMoneyBillWave className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">اللغة</p>
              <p className="text-2xl font-bold">
                {language === 'ar' ? 'عربي' : language === 'en' ? 'English' : 'كوردي'}
              </p>
            </div>
            <FaCog className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">المصادقة الثنائية</p>
              <p className="text-2xl font-bold">{twoFactorEnabled ? 'مفعل' : 'معطل'}</p>
            </div>
            <FaShieldAlt className="text-3xl opacity-75" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">النسخ الاحتياطي</p>
              <p className="text-xl font-bold">{autoBackupEnabled ? 'تلقائي' : 'يدوي'}</p>
            </div>
            <FaDatabase className="text-3xl opacity-75" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <Card>
        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              معلومات الشركة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="اسم الشركة"
                name="name"
                value={settings.company.name}
                onChange={(e) => handleSectionUpdate('company', { name: e.target.value })}
                placeholder="أدخل اسم الشركة"
                required
              />
              <Input
                label="عنوان الشركة"
                name="address"
                value={settings.company.address}
                onChange={(e) => handleSectionUpdate('company', { address: e.target.value })}
                placeholder="أدخل عنوان الشركة"
              />
              <Input
                label="هاتف الشركة"
                name="phone"
                value={settings.company.phone}
                onChange={(e) => handleSectionUpdate('company', { phone: e.target.value })}
                placeholder="+20 XXX XXX XXXX"
              />
              <Input
                label="بريد الشركة الإلكتروني"
                name="email"
                type="email"
                value={settings.company.email}
                onChange={(e) => handleSectionUpdate('company', { email: e.target.value })}
                placeholder="info@company.com"
              />
              <Input
                label="الرقم الضريبي"
                name="tax"
                value={settings.company.tax}
                onChange={(e) => handleSectionUpdate('company', { tax: e.target.value })}
                placeholder="أدخل الرقم الضريبي"
              />
              <Input
                label="رابط شعار الشركة"
                name="logo"
                value={settings.company.logo}
                onChange={(e) => handleSectionUpdate('company', { logo: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCog className="text-blue-600" />
              الإعدادات العامة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="العملة الأساسية"
                name="currency"
                value={settings.general.currency}
                onChange={(e) => handleSectionUpdate('general', { currency: e.target.value })}
                options={currencyOptions}
              />
              <Select
                label="اللغة"
                name="language"
                value={settings.general.language}
                onChange={(e) => handleSectionUpdate('general', { language: e.target.value })}
                options={languageOptions}
              />
              <Input
                label="المنطقة الزمنية"
                name="timezone"
                value={settings.general.timezone || 'Asia/Riyadh'}
                onChange={(e) => handleSectionUpdate('general', { timezone: e.target.value })}
              />
              <Select
                label="تنسيق التاريخ"
                name="dateFormat"
                value={settings.general.dateFormat}
                onChange={(e) => handleSectionUpdate('general', { dateFormat: e.target.value })}
                options={dateFormatOptions}
              />
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>ملاحظة:</strong> تغيير هذه الإعدادات سيؤثر على عرض البيانات في جميع أنحاء النظام.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              إعدادات الفواتير
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="بادئة رقم الفاتورة"
                name="prefix"
                value={settings.invoice.prefix}
                onChange={(e) => handleSectionUpdate('invoices', { prefix: e.target.value })}
                placeholder="INV"
              />
              <Input
                label="رقم البداية للفواتير"
                name="startNumber"
                type="number"
                value={settings.invoice.startNumber}
                onChange={(e) => handleSectionUpdate('invoices', { startNumber: e.target.value })}
                placeholder="1000"
              />
              <div className="md:col-span-2">
                <Input
                  label="نص تذييل الفاتورة"
                  name="footerText"
                  value={settings.invoice.footerText}
                  onChange={(e) => handleSectionUpdate('invoices', { footerText: e.target.value })}
                  placeholder="شكراً لتعاملكم معنا"
                />
              </div>
              <Input
                label="نسبة الضريبة (%)"
                name="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.invoice.taxRate}
                onChange={(e) => handleSectionUpdate('invoices', { taxRate: e.target.value })}
                placeholder="0"
              />
              <Select
                label="جودة PDF"
                name="pdfQuality"
                value={settings.invoice.pdfQuality}
                onChange={(e) => handleSectionUpdate('invoices', { pdfQuality: e.target.value })}
                options={[
                  { value: 'low', label: 'منخفضة (سريع)' },
                  { value: 'medium', label: 'متوسطة' },
                  { value: 'high', label: 'عالية (بطيء)' }
                ]}
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showCompanyLogo"
                  checked={settings.invoice.showCompanyLogo}
                  onChange={(e) => handleSectionUpdate('invoices', { showCompanyLogo: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">إظهار شعار الشركة في الفواتير</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showTaxNumber"
                  checked={settings.invoice.showTaxNumber}
                  onChange={(e) => handleSectionUpdate('invoices', { showTaxNumber: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">إظهار الرقم الضريبي في الفواتير</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoCalculateTax"
                  checked={settings.invoice.autoCalculateTax}
                  onChange={(e) => handleSectionUpdate('invoices', { autoCalculateTax: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">حساب الضريبة تلقائياً</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowPartialPayments"
                  checked={settings.invoice.allowPartialPayments}
                  onChange={(e) => handleSectionUpdate('invoices', { allowPartialPayments: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">السماح بالدفعات الجزئية</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-blue-600" />
              إعدادات الأمان
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="مهلة الجلسة (بالدقائق)"
                name="sessionTimeout"
                type="number"
                value={settings.security.sessionTimeout || 30}
                onChange={(e) => handleSectionUpdate('security', { sessionTimeout: e.target.value })}
                placeholder="30"
              />
              <Input
                label="الحد الأدنى لطول كلمة المرور"
                name="passwordMinLength"
                type="number"
                value={settings.security.passwordMinLength || 6}
                onChange={(e) => handleSectionUpdate('security', { passwordMinLength: e.target.value })}
                placeholder="6"
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="requirePasswordChange"
                  checked={settings.security.requirePasswordChange || false}
                  onChange={(e) => handleSectionUpdate('security', { requirePasswordChange: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">طلب تغيير كلمة المرور بشكل دوري (كل 90 يوم)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="enableTwoFactor"
                  checked={settings.security.enableTwoFactor || false}
                  onChange={(e) => handleSectionUpdate('security', { enableTwoFactor: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">تفعيل المصادقة الثنائية (2FA)</span>
              </label>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700">
                <strong>⚠️ تحذير:</strong> تأكد من حفظ إعدادات الأمان بعناية. قد يؤدي تغيير بعض الإعدادات إلى تسجيل خروج جميع المستخدمين.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaDatabase className="text-blue-600" />
              النسخ الاحتياطي والإعدادات
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="تكرار النسخ الاحتياطي"
                name="backupFrequency"
                value={settings.backup.frequency}
                onChange={(e) => handleSectionUpdate('backup', { frequency: e.target.value })}
                options={[
                  { value: 'daily', label: 'يومياً' },
                  { value: 'weekly', label: 'أسبوعياً' },
                  { value: 'monthly', label: 'شهرياً' }
                ]}
              />
              <Input
                label="وقت النسخ الاحتياطي"
                name="backupTime"
                type="time"
                value={settings.backup.time}
                onChange={(e) => handleSectionUpdate('backup', { time: e.target.value })}
              />
              <Input
                label="فترة الاحتفاظ (بالأيام)"
                name="retentionDays"
                type="number"
                min="1"
                max="365"
                value={settings.backup.retentionDays}
                onChange={(e) => handleSectionUpdate('backup', { retentionDays: e.target.value })}
              />
              <Select
                label="موقع النسخ الاحتياطي"
                name="backupLocation"
                value={settings.backup.backupLocation}
                onChange={(e) => handleSectionUpdate('backup', { backupLocation: e.target.value })}
                options={[
                  { value: 'local', label: 'محلي' },
                  { value: 'cloud', label: 'السحابة' },
                  { value: 'both', label: 'محلي والسحابة' }
                ]}
              />
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoBackup"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => handleSectionUpdate('backup', { autoBackup: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">تفعيل النسخ الاحتياطي التلقائي</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="compressBackup"
                  checked={settings.backup.compressBackup}
                  onChange={(e) => handleSectionUpdate('backup', { compressBackup: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">ضغط النسخ الاحتياطية</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="includeImages"
                  checked={settings.backup.includeImages}
                  onChange={(e) => handleSectionUpdate('backup', { includeImages: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">تضمين الصور والملفات</span>
              </label>
            </div>
            
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg">النسخة الاحتياطية اليدوية</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {settings.backup?.lastBackup 
                      ? `آخر نسخة احتياطية: ${new Date(settings.backup.lastBackup).toLocaleString('ar-EG')}`
                      : 'لم يتم إنشاء نسخة احتياطية بعد'}
                  </p>
                </div>
                <Button variant="primary" onClick={handleBackupNow}>
                  <FaDatabase className="ml-2" />
                  إنشاء نسخة احتياطية الآن
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                يمكنك إنشاء نسخة احتياطية من إعدادات النظام في أي وقت. سيتم تنزيل ملف JSON يحتوي على جميع الإعدادات.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaCog className="text-blue-600" />
              الميزات المتقدمة
            </h3>
            
            {/* أخطاء التحقق */}
            {validationErrors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">أخطاء في الإعدادات:</h4>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* معلومات النظام */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="معلومات النظام">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الإصدار:</span>
                    <span className="font-semibold">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">آخر تحديث:</span>
                    <span className="font-semibold">
                      {lastSaved ? new Date(lastSaved).toLocaleString('ar-EG') : 'غير محدد'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الحفظ التلقائي:</span>
                    <span className="font-semibold text-green-600">
                      مفعل
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">حالة التغييرات:</span>
                    <span className="font-semibold text-green-600">
                      محفوظ
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="إدارة الإعدادات">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    fullWidth 
                    onClick={exportSettings}
                    disabled={loading}
                  >
                    <FaDownload className="ml-2" />
                    تصدير الإعدادات
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          importSettings(file).then(success => {
                            if (success) {
                              showSuccess('تم استيراد الإعدادات بنجاح');
                            }
                          });
                        }
                      }}
                      className="hidden"
                      id="import-settings"
                    />
                    <Button 
                      variant="outline" 
                      fullWidth
                      onClick={() => {
                        document.getElementById('import-settings').click();
                      }}
                      disabled={loading}
                    >
                      <FaUpload className="ml-2" />
                      استيراد الإعدادات
                    </Button>
                  </div>
                  
                  <Button 
                    variant="danger" 
                    fullWidth 
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟ هذا الإجراء لا يمكن التراجع عنه.')) {
                        resetSettings();
                        showWarning('تم إعادة تعيين جميع الإعدادات');
                      }
                    }}
                    disabled={loading}
                  >
                    <FaUndo className="ml-2" />
                    إعادة تعيين الإعدادات
                  </Button>
                </div>
              </Card>
            </div>

            {/* إعدادات المطورين */}
            <Card title="إعدادات المطورين">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.developer?.enableDebugMode || false}
                    onChange={(e) => handleSectionUpdate('developer', { enableDebugMode: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">وضع التطوير</span>
                    <p className="text-sm text-gray-500">تفعيل خيارات التطوير والتصحيح</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.developer?.showConsoleLogs || false}
                    onChange={(e) => handleSectionUpdate('developer', { showConsoleLogs: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">رسائل Console</span>
                    <p className="text-sm text-gray-500">عرض رسائل التطوير في Console</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.developer?.testMode || false}
                    onChange={(e) => handleSectionUpdate('developer', { testMode: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">وضع الاختبار</span>
                    <p className="text-sm text-gray-500">استخدام البيانات التجريبية</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* إحصائيات الاستخدام */}
            <Card title="إحصائيات الاستخدام">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(settings).length}
                  </div>
                  <div className="text-sm text-gray-600">أقسام الإعدادات</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(settings).reduce((acc, section) => 
                      acc + Object.keys(section || {}).length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">إعداد مفصل</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    0
                  </div>
                  <div className="text-sm text-gray-600">تغييرات معلقة</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {validationErrors.length}
                  </div>
                  <div className="text-sm text-gray-600">أخطاء التحقق</div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Card>

    </div>
  );
};

export default SystemSettings;
