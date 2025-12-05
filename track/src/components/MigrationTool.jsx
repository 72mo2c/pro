// ======================================
// Migration Tool Component - مكون أداة الترحيل
// ======================================

import React, { useState, useEffect } from 'react';
import { 
  initializeDatabase, 
  checkDatabaseStatus, 
  migrationManager 
} from '../services/databaseService';

const MigrationTool = ({ onMigrationComplete }) => {
  const [databaseStatus, setDatabaseStatus] = useState({
    connected: false,
    message: 'جاري فحص قاعدة البيانات...',
    error: null
  });
  
  const [migrationStatus, setMigrationStatus] = useState({
    isMigrating: false,
    progress: 0,
    status: 'ready',
    error: null
  });
  
  const [localDataExists, setLocalDataExists] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // فحص وجود بيانات في LocalStorage
  useEffect(() => {
    const checkLocalData = () => {
      const keys = [
        'bero_warehouses', 'bero_products', 'bero_categories', 
        'bero_customers', 'bero_suppliers', 'bero_sales_invoices', 
        'bero_purchase_invoices'
      ];
      
      const hasData = keys.some(key => {
        const data = localStorage.getItem(key);
        return data && JSON.parse(data).length > 0;
      });
      
      setLocalDataExists(hasData);
    };

    checkLocalData();
  }, []);

  // فحص حالة قاعدة البيانات
  useEffect(() => {
    const checkDB = async () => {
      try {
        const status = await checkDatabaseStatus();
        setDatabaseStatus(status);
      } catch (error) {
        setDatabaseStatus({
          connected: false,
          message: 'خطأ في فحص قاعدة البيانات',
          error: error.message
        });
      }
    };

    checkDB();
  }, []);

  // تحديث حالة الترحيل
  useEffect(() => {
    const updateStatus = () => {
      const status = migrationManager.getStatus();
      setMigrationStatus(status);
    };

    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // بدء عملية الترحيل
  const startMigration = async () => {
    try {
      setShowMigrationModal(true);
      
      const result = await migrationManager.startMigration((progress, message) => {
        setMigrationStatus(prev => ({
          ...prev,
          progress,
          status: message
        }));
      });

      if (result.success) {
        // إعادة فحص قاعدة البيانات
        const newStatus = await checkDatabaseStatus();
        setDatabaseStatus(newStatus);
        
        setLocalDataExists(false);
        
        // إشعار بالاكتمال
        onMigrationComplete?.(result);
        
        setShowMigrationModal(false);
        
        // عرض رسالة نجاح
        alert('تم ترحيل البيانات بنجاح! 🎉');
      }
    } catch (error) {
      setMigrationStatus(prev => ({
        ...prev,
        error: error.message,
        status: 'failed'
      }));
      
      alert(`فشل في ترحيل البيانات: ${error.message}`);
    }
  };

  // الحصول على لون شريط التقدم
  const getProgressColor = () => {
    if (migrationStatus.status === 'failed') return 'bg-red-500';
    if (migrationStatus.status === 'completed') return 'bg-green-500';
    return 'bg-blue-500';
  };

  // عرض معلومات البيانات الموجودة
  const showLocalDataInfo = () => {
    const info = {};
    const keys = [
      'bero_warehouses', 'bero_products', 'bero_categories', 
      'bero_customers', 'bero_suppliers', 'bero_sales_invoices', 
      'bero_purchase_invoices'
    ];
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          info[key] = parsed.length;
        }
      } catch (error) {
        info[key] = 0;
      }
    });
    
    return info;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔄 أداة ترحيل البيانات
        </h2>
        <p className="text-gray-600">
          ترحيل البيانات من LocalStorage إلى قاعدة البيانات المحلية
        </p>
      </div>

      {/* حالة قاعدة البيانات */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">حالة قاعدة البيانات</h3>
        <div className={`p-4 rounded-lg border ${
          databaseStatus.connected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              databaseStatus.connected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={databaseStatus.connected ? 'text-green-800' : 'text-red-800'}>
              {databaseStatus.message}
            </span>
          </div>
          {databaseStatus.error && (
            <p className="text-red-600 text-sm mt-2">{databaseStatus.error}</p>
          )}
        </div>
      </div>

      {/* البيانات الموجودة في LocalStorage */}
      {localDataExists && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">البيانات الموجودة</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 mb-3">
              تم العثور على بيانات في متصفح الويب (LocalStorage)
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(showLocalDataInfo()).map(([key, count]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-700">
                    {key.replace('bero_', '').replace('_', ' ')}:
                  </span>
                  <span className="font-semibold text-yellow-800">{count}</span>
                </div>
              ))}
            </div>
            
            <p className="text-yellow-700 text-sm mt-3">
              💡 سيتم ترحيل هذه البيانات إلى قاعدة البيانات المحلية (SQLite) 
              وسيتم حذفها من LocalStorage بعد الانتهاء
            </p>
          </div>
        </div>
      )}

      {/* حالة الترحيل */}
      {migrationStatus.isMigrating && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">حالة الترحيل</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-800">{migrationStatus.status}</span>
              <span className="text-blue-600">{migrationStatus.progress}%</span>
            </div>
            
            <div className="w-full bg-blue-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${migrationStatus.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* رسائل الخطأ */}
      {migrationStatus.error && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-semibold mb-2">خطأ في الترحيل</h4>
            <p className="text-red-700">{migrationStatus.error}</p>
          </div>
        </div>
      )}

      {/* أزرار التحكم */}
      <div className="text-center">
        {!localDataExists ? (
          <div className="text-green-600">
            ✅ لا توجد بيانات للترحيل - قاعدة البيانات جاهزة للاستخدام
          </div>
        ) : (
          <div>
            {!migrationStatus.isMigrating && migrationStatus.status !== 'completed' ? (
              <button
                onClick={startMigration}
                disabled={!databaseStatus.connected}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  databaseStatus.connected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                🚀 بدء ترحيل البيانات
              </button>
            ) : migrationStatus.status === 'completed' ? (
              <div className="text-green-600 font-semibold">
                ✅ تم ترحيل البيانات بنجاح
              </div>
            ) : (
              <button
                onClick={() => migrationManager.stopMigration()}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                ⏹️ إيقاف الترحيل
              </button>
            )}
          </div>
        )}
      </div>

      {/* معلومات إضافية */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">معلومات حول الترحيل:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• سيتم إنشاء قاعدة بيانات SQLite تلقائياً</li>
          <li>• البيانات ستُحفظ في مجلد بيانات التطبيق</li>
          <li>• سيُحفظ الترحيل من LocalStorage بعد الانتهاء</li>
          <li>• يمكن الترحيل عدة مرات حسب الحاجة</li>
        </ul>
      </div>
    </div>
  );
};

export default MigrationTool;
