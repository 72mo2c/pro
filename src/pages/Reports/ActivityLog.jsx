// ======================================
// Activity Log - تقرير الأنشطة اليومية
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaHistory, 
  FaFilter, 
  FaBoxOpen, 
  FaFileInvoice, 
  FaUserTie, 
  FaTruck,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaClock,
  FaCalendarAlt,
  FaTrash,
  FaArchive
} from 'react-icons/fa';

const ActivityLog = () => {
  const { getDailyActivities, clearDailyActivities, archiveDailyActivities } = useData();
  const { showSuccess, showWarning } = useNotification();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const activities = getDailyActivities();
  
  // تصنيف الأنشطة حسب النوع
  const activityTypes = {
    'product_add': { label: 'إضافة منتج', icon: <FaBoxOpen />, color: 'blue' },
    'product_edit': { label: 'تعديل منتج', icon: <FaBoxOpen />, color: 'yellow' },
    'product_delete': { label: 'حذف منتج', icon: <FaBoxOpen />, color: 'red' },
    'product_restore': { label: 'استعادة منتج', icon: <FaBoxOpen />, color: 'green' },
    'invoice_sales_add': { label: 'فاتورة مبيعات جديدة', icon: <FaFileInvoice />, color: 'green' },
    'invoice_purchase_add': { label: 'فاتورة مشتريات جديدة', icon: <FaFileInvoice />, color: 'orange' },
    'invoice_purchase_edit': { label: 'تعديل فاتورة مشتريات', icon: <FaFileInvoice />, color: 'yellow' },
    'invoice_delete': { label: 'حذف فاتورة', icon: <FaFileInvoice />, color: 'red' },
    'invoice_restore': { label: 'استعادة فاتورة', icon: <FaFileInvoice />, color: 'green' },
    'customer_add': { label: 'إضافة عميل', icon: <FaUserTie />, color: 'green' },
    'customer_edit': { label: 'تعديل عميل', icon: <FaUserTie />, color: 'yellow' },
    'customer_delete': { label: 'حذف عميل', icon: <FaUserTie />, color: 'red' },
    'customer_restore': { label: 'استعادة عميل', icon: <FaUserTie />, color: 'green' },
    'supplier_add': { label: 'إضافة مورد', icon: <FaTruck />, color: 'green' },
    'supplier_edit': { label: 'تعديل مورد', icon: <FaTruck />, color: 'yellow' },
    'supplier_delete': { label: 'حذف مورد', icon: <FaTruck />, color: 'red' },
    'warehouse_add': { label: 'إضافة مخزن', icon: <FaBoxOpen />, color: 'green' },
    'warehouse_edit': { label: 'تعديل مخزن', icon: <FaBoxOpen />, color: 'yellow' },
    'warehouse_delete': { label: 'حذف مخزن', icon: <FaBoxOpen />, color: 'red' },
    'warehouse_restore': { label: 'استعادة مخزن', icon: <FaBoxOpen />, color: 'green' },
    'category_add': { label: 'إضافة فئة', icon: <FaBoxOpen />, color: 'green' },
    'category_edit': { label: 'تعديل فئة', icon: <FaBoxOpen />, color: 'yellow' },
    'category_delete': { label: 'حذف فئة', icon: <FaBoxOpen />, color: 'red' },
    'category_restore': { label: 'استعادة فئة', icon: <FaBoxOpen />, color: 'green' },
    'supplier_restore': { label: 'استعادة مورد', icon: <FaTruck />, color: 'green' },
    'account_add': { label: 'إضافة حساب', icon: <FaFileInvoice />, color: 'green' },
    'account_edit': { label: 'تعديل حساب', icon: <FaFileInvoice />, color: 'yellow' },
    'account_delete': { label: 'حذف حساب', icon: <FaFileInvoice />, color: 'red' },
    'account_restore': { label: 'استعادة حساب', icon: <FaFileInvoice />, color: 'green' },
    'cash_receipt': { label: 'إيصال استلام نقدي', icon: <FaMoneyBillWave />, color: 'green' },
    'cash_receipt_delete': { label: 'حذف إيصال استلام', icon: <FaMoneyBillWave />, color: 'red' },
    'cash_disbursement': { label: 'إيصال صرف نقدي', icon: <FaMoneyBillWave />, color: 'red' },
    'cash_disbursement_delete': { label: 'حذف إيصال صرف', icon: <FaMoneyBillWave />, color: 'red' },
    'transfer': { label: 'تحويل بين المخازن', icon: <FaExchangeAlt />, color: 'purple' },
    'return_sales_add': { label: 'إضافة مرتجع مبيعات', icon: <FaFileInvoice />, color: 'orange' },
    'return_sales_delete': { label: 'حذف مرتجع مبيعات', icon: <FaFileInvoice />, color: 'red' },
    'return_sales_restore': { label: 'استعادة مرتجع مبيعات', icon: <FaFileInvoice />, color: 'green' },
    'return_purchase_add': { label: 'إضافة مرتجع مشتريات', icon: <FaFileInvoice />, color: 'blue' },
    'return_purchase_delete': { label: 'حذف مرتجع مشتريات', icon: <FaFileInvoice />, color: 'red' },
    'return_purchase_restore': { label: 'استعادة مرتجع مشتريات', icon: <FaFileInvoice />, color: 'green' },
  };
  
  // فلترة الأنشطة
  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    // فلترة حسب النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }
    
    // فلترة حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.details?.toLowerCase().includes(query) ||
        activityTypes[a.type]?.label.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [activities, filterType, searchQuery]);
  
  // إحصائيات سريعة
  const stats = useMemo(() => {
    const counts = {};
    activities.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [activities]);
  
  // أرشفة الأنشطة
  const handleArchive = () => {
    if (activities.length === 0) {
      showWarning('لا توجد أنشطة للأرشفة');
      return;
    }
    
    if (window.confirm(`هل تريد أرشفة ${activities.length} نشاط؟`)) {
      archiveDailyActivities();
      showSuccess('تم أرشفة الأنشطة بنجاح');
    }
  };
  
  // مسح الأنشطة
  const handleClear = () => {
    if (activities.length === 0) {
      showWarning('لا توجد أنشطة للمسح');
      return;
    }
    
    if (window.confirm(`هل تريد مسح ${activities.length} نشاط؟ سيتم فقدان البيانات بشكل دائم.`)) {
      clearDailyActivities();
      showWarning('تم مسح الأنشطة');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FaHistory className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">التقارير العامة</h1>
                <p className="text-xs text-gray-600">أنشطة الجلسة الحالية</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleArchive}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                title="أرشفة الأنشطة"
              >
                <FaArchive /> أرشفة
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                title="مسح الأنشطة"
              >
                <FaTrash /> مسح
              </button>
            </div>
          </div>
          
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-4">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
              <div className="text-xs text-gray-600">إجمالي الأنشطة</div>
            </div>
            {Object.entries(stats).slice(0, 5).map(([type, count]) => (
              <div key={type} className={`bg-${activityTypes[type]?.color}-50 p-2 rounded text-center`}>
                <div className={`text-2xl font-bold text-${activityTypes[type]?.color}-600`}>{count}</div>
                <div className="text-xs text-gray-600">{activityTypes[type]?.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* الفلاتر */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <FaFilter className="inline ml-1" /> فلترة حسب النوع
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الأنشطة</option>
                {Object.entries(activityTypes).map(([type, { label }]) => (
                  <option key={type} value={type}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                بحث في الأنشطة
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن نشاط..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-600">
            عرض {filteredActivities.length} من {activities.length} نشاط
          </div>
        </div>
        
        {/* جدول الأنشطة */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <FaHistory className="text-gray-300 text-5xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد أنشطة</h3>
              <p className="text-sm text-gray-500">ستظهر جميع العمليات التي تقوم بها هنا</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">النوع</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">التفاصيل</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">التاريخ</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredActivities.map((activity) => {
                    const typeInfo = activityTypes[activity.type] || { label: activity.type, icon: <FaHistory />, color: 'gray' };
                    return (
                      <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2 justify-center">
                            <div className={`bg-${typeInfo.color}-100 p-1.5 rounded-lg`}>
                              <div className={`text-${typeInfo.color}-600`}>{typeInfo.icon}</div>
                            </div>
                            <span className="text-xs font-semibold">{typeInfo.label}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="text-sm font-semibold text-gray-800">{activity.details}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                            <FaCalendarAlt className="text-xs" />
                            {activity.date}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                            <FaClock className="text-xs" />
                            {activity.time}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
