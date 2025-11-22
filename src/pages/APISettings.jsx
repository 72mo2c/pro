// ======================================
// API Settings Page
// صفحة إعدادات الاتصال بالـ API
// ======================================

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiConfig from '../utils/apiConfig';

const APISettings = () => {
  const [config, setConfig] = useState({
    COMPANY_API_URL: '',
    API_URL: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isTauri, setIsTauri] = useState(false);
  const [configPath, setConfigPath] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      // Load current configuration
      const currentConfig = apiConfig.getConfig();
      setConfig(currentConfig);
      
      // Check if running in Tauri
      const isTauriApp = apiConfig.isTauriApp();
      setIsTauri(isTauriApp);
      
      // Get config file path
      if (isTauriApp) {
        const path = await apiConfig.getConfigPath();
        setConfigPath(path);
      }
      
    } catch (error) {
      toast.error('فشل تحميل الإعدادات');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate URLs
      if (!config.COMPANY_API_URL || !config.API_URL) {
        toast.error('جميع الحقول مطلوبة');
        return;
      }

      // Update configuration
      await apiConfig.updateConfig(config);
      
      toast.success('✅ تم حفظ الإعدادات بنجاح');
      
      if (isTauri) {
        toast.info('ℹ️ يُرجى إعادة تشغيل التطبيق لتفعيل التغييرات');
      }
      
    } catch (error) {
      toast.error('فشل حفظ الإعدادات');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('هل تريد إعادة تعيين الإعدادات إلى القيم الافتراضية؟')) {
      try {
        setSaving(true);
        await apiConfig.reset();
        await loadConfig();
        toast.success('✅ تم إعادة تعيين الإعدادات');
      } catch (error) {
        toast.error('فشل إعادة التعيين');
        console.error(error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      
      // Test Company API
      const companyResponse = await fetch(`${config.COMPANY_API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'test' }),
      });

      if (companyResponse.ok || companyResponse.status === 400 || companyResponse.status === 404) {
        // 400 or 404 means the API is accessible (just wrong credentials/identifier)
        toast.success('✅ الاتصال بـ Company API ناجح');
      } else {
        toast.error(`❌ فشل الاتصال بـ Company API: ${companyResponse.status}`);
      }

    } catch (error) {
      toast.error(`❌ خطأ في الاتصال: ${error.message}`);
      console.error(error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ⚙️ إعدادات الاتصال بالـ API
          </h1>
          <p className="text-gray-600">
            قم بتكوين عناوين الـ API للاتصال بالخادم
          </p>
        </div>

        {/* App Mode Info */}
        <div className={`mb-6 p-4 rounded-lg ${isTauri ? 'bg-blue-50' : 'bg-yellow-50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isTauri ? '💻' : '🌐'}</span>
            <div>
              <p className="font-semibold">
                {isTauri ? 'وضع التطبيق (Tauri)' : 'وضع المتصفح'}
              </p>
              <p className="text-sm text-gray-600">
                {isTauri 
                  ? 'التغييرات سيتم حفظها في ملف التكوين ويمكن تعديلها في أي وقت'
                  : 'التغييرات ستكون مؤقتة حتى إعادة تحميل الصفحة'
                }
              </p>
              {isTauri && configPath && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  📁 {configPath}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Company API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏢 عنوان Company API
            </label>
            <input
              type="text"
              dir="ltr"
              value={config.COMPANY_API_URL}
              onChange={(e) => handleInputChange('COMPANY_API_URL', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://your-server.com/api/v1/companies"
            />
            <p className="mt-1 text-sm text-gray-500">
              عنوان API الخاص بتسجيل دخول الشركات والاشتراكات
            </p>
          </div>

          {/* General API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌐 عنوان General API
            </label>
            <input
              type="text"
              dir="ltr"
              value={config.API_URL}
              onChange={(e) => handleInputChange('API_URL', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://your-server.com/api/v1"
            />
            <p className="mt-1 text-sm text-gray-500">
              عنوان API العام للبيانات
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving || testing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
            </button>

            <button
              onClick={handleTestConnection}
              disabled={saving || testing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {testing ? '⏳ جاري الاختبار...' : '🔍 اختبار الاتصال'}
            </button>

            <button
              onClick={handleReset}
              disabled={saving || testing}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              🔄 إعادة تعيين
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">📚 ملاحظات مهمة:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>تأكد من إدخال العنوان الكامل مع البروتوكول (http:// أو https://)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>لا تضع "/" في نهاية العنوان</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>في حالة استخدام HTTPS، تأكد من وجود شهادة SSL صالحة</span>
            </li>
            {isTauri && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span className="font-semibold">يُفضل إعادة تشغيل التطبيق بعد حفظ الإعدادات</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APISettings;
