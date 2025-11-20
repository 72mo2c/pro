// ======================================
// Activity Archive - أرشيف الأنشطة
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { 
  FaArchive, 
  FaCalendarAlt, 
  FaHistory,
  FaChevronDown,
  FaChevronUp,
  FaBoxOpen,
  FaFileInvoice,
  FaUserTie,
  FaTruck,
  FaMoneyBillWave,
  FaExchangeAlt
} from 'react-icons/fa';

const ActivityArchive = () => {
  const { getActivitiesArchive } = useData();
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const archive = getActivitiesArchive();
  
  // تصنيف الأنشطة حسب النوع
  const activityTypes = {
    'product_add': { label: 'إضافة منتج', icon: <FaBoxOpen />, color: 'blue' },
    'product_edit': { label: 'تعديل منتج', icon: <FaBoxOpen />, color: 'yellow' },
    'product_delete': { label: 'حذف منتج', icon: <FaBoxOpen />, color: 'red' },
    'invoice_sales_add': { label: 'فاتورة مبيعات', icon: <FaFileInvoice />, color: 'green' },
    'invoice_purchase_add': { label: 'فاتورة مشتريات', icon: <FaFileInvoice />, color: 'orange' },
    'invoice_delete': { label: 'حذف فاتورة', icon: <FaFileInvoice />, color: 'red' },
    'customer_add': { label: 'إضافة عميل', icon: <FaUserTie />, color: 'green' },
    'customer_edit': { label: 'تعديل عميل', icon: <FaUserTie />, color: 'yellow' },
    'customer_delete': { label: 'حذف عميل', icon: <FaUserTie />, color: 'red' },
    'supplier_add': { label: 'إضافة مورد', icon: <FaTruck />, color: 'green' },
    'supplier_edit': { label: 'تعديل مورد', icon: <FaTruck />, color: 'yellow' },
    'supplier_delete': { label: 'حذف مورد', icon: <FaTruck />, color: 'red' },
    'cash_receipt': { label: 'استلام نقدي', icon: <FaMoneyBillWave />, color: 'green' },
    'cash_disbursement': { label: 'صرف نقدي', icon: <FaMoneyBillWave />, color: 'red' },
    'transfer': { label: 'تحويل', icon: <FaExchangeAlt />, color: 'purple' },
    'return_sales': { label: 'مرتجع مبيعات', icon: <FaFileInvoice />, color: 'orange' },
    'return_purchase': { label: 'مرتجع مشتريات', icon: <FaFileInvoice />, color: 'blue' },
  };
  
  // فلترة الأرشيف حسب البحث
  const filteredArchive = useMemo(() => {
    if (!searchQuery) return archive;
    
    const query = searchQuery.toLowerCase();
    return archive.filter(a => 
      a.date.includes(query) ||
      a.activities.some(activity => 
        activity.details?.toLowerCase().includes(query) ||
        activityTypes[activity.type]?.label.toLowerCase().includes(query)
      )
    );
  }, [archive, searchQuery]);
  
  // توسيع/طي تاريخ معين
  const toggleDate = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };
  
  // إحصائيات الأرشيف
  const totalActivities = useMemo(() => {
    return archive.reduce((sum, a) => sum + a.totalActivities, 0);
  }, [archive]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FaArchive className="text-purple-600 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">أرشيف الأنشطة</h1>
                <p className="text-xs text-gray-600">السجلات السابقة للأنشطة</p>
              </div>
            </div>
          </div>
          
          {/* إحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-purple-50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-purple-600">{archive.length}</div>
              <div className="text-xs text-gray-600">أيام مسجلة</div>
            </div>
            <div className="bg-blue-50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-blue-600">{totalActivities}</div>
              <div className="text-xs text-gray-600">إجمالي الأنشطة</div>
            </div>
            <div className="bg-green-50 p-3 rounded text-center">
              <div className="text-2xl font-bold text-green-600">
                {archive.length > 0 ? Math.round(totalActivities / archive.length) : 0}
              </div>
              <div className="text-xs text-gray-600">متوسط/اليوم</div>
            </div>
          </div>
        </div>
        
        {/* بحث */}
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأرشيف..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          />
          <div className="mt-2 text-xs text-gray-600">
            عرض {filteredArchive.length} من {archive.length} يوم
          </div>
        </div>
        
        {/* قائمة الأرشيف */}
        <div className="space-y-3">
          {filteredArchive.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FaArchive className="text-gray-300 text-5xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا يوجد أرشيف</h3>
              <p className="text-sm text-gray-500">سيتم حفظ أنشطة كل يوم تلقائياً في الأرشيف</p>
            </div>
          ) : (
            filteredArchive.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt)).map((archiveEntry) => (
              <div key={archiveEntry.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* رأس التاريخ */}
                <button
                  onClick={() => toggleDate(archiveEntry.date)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaCalendarAlt className="text-purple-600" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{archiveEntry.date}</div>
                      <div className="text-xs text-gray-600">{archiveEntry.totalActivities} نشاط</div>
                    </div>
                  </div>
                  <div className="text-gray-600">
                    {expandedDate === archiveEntry.date ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </button>
                
                {/* تفاصيل الأنشطة */}
                {expandedDate === archiveEntry.date && (
                  <div className="border-t border-gray-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">النوع</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">التفاصيل</th>
                            <th className="px-3 py-2 text-center font-semibold text-gray-700">الوقت</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {archiveEntry.activities.map((activity) => {
                            const typeInfo = activityTypes[activity.type] || { label: activity.type, icon: <FaHistory />, color: 'gray' };
                            return (
                              <tr key={activity.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2 justify-center">
                                    <div className={`bg-${typeInfo.color}-100 p-1.5 rounded-lg`}>
                                      <div className={`text-${typeInfo.color}-600`}>{typeInfo.icon}</div>
                                    </div>
                                    <span className="text-xs font-semibold">{typeInfo.label}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center text-xs text-gray-700">{activity.details}</td>
                                <td className="px-3 py-2 text-center text-xs text-gray-600">{activity.time}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityArchive;
