// ======================================
// Migration Management Page - صفحة إدارة الترحيل
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DatabaseDataContext';
import MigrationTool from '../components/MigrationTool';

const MigrationManagement = () => {
  const { 
    databaseReady, 
    databaseStatus, 
    migrationStatus, 
    startMigration,
    warehouses,
    products,
    customers,
    suppliers 
  } = useData();

  const [showMigrationTool, setShowMigrationTool] = useState(false);
  const [migrationHistory, setMigrationHistory] = useState([]);

  // فحص ما إذا كانت هناك حاجة لترحيل
  const [needsMigration, setNeedsMigration] = useState(false);

  useEffect(() => {
    // فحص وجود بيانات في LocalStorage
    const checkLocalData = () => {
      const keys = [
        'bero_warehouses', 'bero_products', 'bero_categories', 
        'bero_customers', 'bero_suppliers', 'bero_sales_invoices', 
        'bero_purchase_invoices'
      ];
      
      const hasData = keys.some(key => {
        try {
          const data = localStorage.getItem(key);
          return data && JSON.parse(data).length > 0;
        } catch {
          return false;
        }
      });
      
      setNeedsMigration(hasData);
    };

    checkLocalData();
  }, []);

  // إحصائيات البيانات
  const getDataStats = () => {
    return {
      warehouses: warehouses?.length || 0,
      products: products?.length || 0,
      customers: customers?.length || 0,
      suppliers: suppliers?.length || 0,
    };
  };

  const stats = getDataStats();

  // معلومات حالة قاعدة البيانات
  const getDatabaseInfo = () => {
    if (!databaseReady) {
      return {
        status: 'not_ready',
        icon: '⚠️',
        message: 'قاعدة البيانات غير جاهزة',
        color: 'text-yellow-600'
      };
    }

    if (databaseStatus.connected) {
      return {
        status: 'connected',
        icon: '✅',
        message: 'قاعدة البيانات متصلة وجاهزة',
        color: 'text-green-600'
      };
    }

    return {
      status: 'error',
      icon: '❌',
      message: databaseStatus.message,
      color: 'text-red-600'
    };
  };

  const dbInfo = getDatabaseInfo();

  const handleMigrationComplete = (result) => {
    setShowMigrationTool(false);
    setNeedsMigration(false);
    
    // تحديث الإحصائيات
    console.log('تم إكمال الترحيل:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔄 إدارة ترحيل البيانات
          </h1>
          <p className="text-lg text-gray-600">
            ترحيل البيانات من LocalStorage إلى قاعدة البيانات المحلية
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Database Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">حالة قاعدة البيانات</h3>
                <p className={`text-sm ${dbInfo.color}`}>
                  {dbInfo.message}
                </p>
              </div>
              <div className="text-2xl">{dbInfo.icon}</div>
            </div>
          </div>

          {/* Migration Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">حالة الترحيل</h3>
                <p className={`text-sm ${
                  migrationStatus.isMigrating ? 'text-blue-600' : 
                  migrationStatus.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {migrationStatus.isMigrating ? 'جاري الترحيل...' :
                   migrationStatus.status === 'completed' ? 'تم الترحيل' : 'جاهز للترحيل'}
                </p>
              </div>
              <div className="text-2xl">
                {migrationStatus.isMigrating ? '⏳' : 
                 migrationStatus.status === 'completed' ? '✅' : '📋'}
              </div>
            </div>
            
            {migrationStatus.isMigrating && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${migrationStatus.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {migrationStatus.progress}% مكتمل
                </p>
              </div>
            )}
          </div>

          {/* Data Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">البيانات الحالية</h3>
                <p className="text-sm text-gray-600">
                  {Object.values(stats).reduce((a, b) => a + b, 0)} عنصر
                </p>
              </div>
              <div className="text-2xl">📊</div>
            </div>
            
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>المخازن:</span>
                <span>{stats.warehouses}</span>
              </div>
              <div className="flex justify-between">
                <span>المنتجات:</span>
                <span>{stats.products}</span>
              </div>
              <div className="flex justify-between">
                <span>العملاء:</span>
                <span>{stats.customers}</span>
              </div>
              <div className="flex justify-between">
                <span>الموردين:</span>
                <span>{stats.suppliers}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Migration Action */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          {!showMigrationTool ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {needsMigration ? '🚀 بدء ترحيل البيانات' : '✅ النظام جاهز'}
              </h2>
              
              {needsMigration ? (
                <div>
                  <p className="text-gray-600 mb-6">
                    تم العثور على بيانات في LocalStorage. يُنصح بترحيلها إلى قاعدة البيانات المحلية 
                    للحصول على أداء أفضل وثبات أكبر.
                  </p>
                  <button
                    onClick={() => setShowMigrationTool(true)}
                    disabled={!databaseReady}
                    className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                      databaseReady
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  >
                    🔄 بدء الترحيل
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-green-600 mb-6">
                    النظام يستخدم قاعدة البيانات المحلية ولا توجد حاجة لترحيل البيانات.
                  </p>
                  <button
                    onClick={() => setShowMigrationTool(true)}
                    className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    📋 عرض أداة الترحيل
                  </button>
                </div>
              )}
            </div>
          ) : (
            <MigrationTool 
              onMigrationComplete={handleMigrationComplete}
            />
          )}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Benefits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ✨ مزايا قاعدة البيانات المحلية
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                أداء أسرع في جلب وتحديث البيانات
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                ثبات أكبر للبيانات وعدم فقدانها
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                إمكانية استعلامات معقدة للبيانات
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                نسخ احتياطية تلقائية
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                تشفير وحماية أفضل للبيانات
              </li>
            </ul>
          </div>

          {/* Migration Process */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              🔄 خطوات عملية الترحيل
            </h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                تهيئة قاعدة بيانات SQLite
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                تصدير البيانات من LocalStorage
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                ترحيل البيانات إلى قاعدة البيانات
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
                التحقق من صحة البيانات
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">5</span>
                مسح البيانات القديمة من LocalStorage
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            💡 يمكنك تشغيل عملية الترحيل في أي وقت من هذه الصفحة. 
            لا يؤثر الترحيل على أداء التطبيق.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MigrationManagement;
