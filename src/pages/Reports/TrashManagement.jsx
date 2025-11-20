// ======================================
// Trash Management - إدارة سلة المهملات
// ======================================

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaTrash, 
  FaUndo, 
  FaTrashRestore, 
  FaFileInvoice, 
  FaUserTie, 
  FaBoxOpen, 
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaMoneyBillWave,
  FaWarehouse,
  FaTags,
  FaTruck,
  FaBook,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const TrashManagement = () => {
  const { 
    deletedItems, 
    restoreDeletedItem, 
    permanentlyDeleteItem, 
    clearTrashByType,
    clearAllTrash 
  } = useData();
  
  const { showSuccess, showError, showWarning, showConfirm } = useNotification();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('compact'); // compact or detailed

  // تصنيف المحذوفات حسب النوع
  const categorizedItems = useMemo(() => {
    return {
      all: deletedItems || [],
      invoice: deletedItems?.filter(item => item.type === 'invoice') || [],
      customer: deletedItems?.filter(item => item.type === 'customer') || [],
      product: deletedItems?.filter(item => item.type === 'product') || [],
      warehouse: deletedItems?.filter(item => item.type === 'warehouse') || [],
      category: deletedItems?.filter(item => item.type === 'category') || [],
      supplier: deletedItems?.filter(item => item.type === 'supplier') || [],
      account: deletedItems?.filter(item => item.type === 'account') || [],
      purchase_return: deletedItems?.filter(item => item.type === 'purchase_return') || [],
      sales_return: deletedItems?.filter(item => item.type === 'sales_return') || [],
      cash_receipt: deletedItems?.filter(item => item.type === 'cash_receipt') || [],
      cash_disbursement: deletedItems?.filter(item => item.type === 'cash_disbursement') || []
    };
  }, [deletedItems]);

  // التبويبات مع العدادات
  const tabs = [
    { id: 'all', label: 'الكل', icon: <FaTrashRestore />, count: categorizedItems.all.length, color: 'gray' },
    { id: 'invoice', label: 'الفواتير', icon: <FaFileInvoice />, count: categorizedItems.invoice.length, color: 'blue' },
    { id: 'product', label: 'المنتجات', icon: <FaBoxOpen />, count: categorizedItems.product.length, color: 'purple' },
    { id: 'customer', label: 'العملاء', icon: <FaUserTie />, count: categorizedItems.customer.length, color: 'green' },
    { id: 'supplier', label: 'الموردين', icon: <FaTruck />, count: categorizedItems.supplier.length, color: 'orange' },
    { id: 'warehouse', label: 'المخازن', icon: <FaWarehouse />, count: categorizedItems.warehouse.length, color: 'indigo' },
    { id: 'category', label: 'الفئات', icon: <FaTags />, count: categorizedItems.category.length, color: 'pink' },
    { id: 'account', label: 'الحسابات', icon: <FaBook />, count: categorizedItems.account.length, color: 'teal' },
    { id: 'purchase_return', label: 'مرتجعات مشتريات', icon: <FaFileInvoice />, count: categorizedItems.purchase_return.length, color: 'yellow' },
    { id: 'sales_return', label: 'مرتجعات مبيعات', icon: <FaFileInvoice />, count: categorizedItems.sales_return.length, color: 'cyan' },
    { id: 'cash_receipt', label: 'إيصالات استلام', icon: <FaMoneyBillWave />, count: categorizedItems.cash_receipt.length, color: 'emerald' },
    { id: 'cash_disbursement', label: 'إيصالات صرف', icon: <FaMoneyBillWave />, count: categorizedItems.cash_disbursement.length, color: 'red' }
  ];

  // الحصول على البيانات المعروضة حسب التبويبة
  const currentData = useMemo(() => {
    return categorizedItems[activeTab] || [];
  }, [activeTab, categorizedItems]);

  // تصفية البيانات حسب البحث
  const filteredData = useMemo(() => {
    if (!searchQuery) return currentData;
    
    return currentData.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const data = item.data;
      
      // البحث في الحقول الشائعة
      return (
        data.name?.toLowerCase().includes(searchLower) ||
        data.id?.toString().includes(searchLower) ||
        data.phone?.includes(searchLower) ||
        data.barcode?.includes(searchLower) ||
        data.code?.includes(searchLower)
      );
    });
  }, [currentData, searchQuery]);

  // تنسيق التاريخ والوقت بشكل مختصر
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // استعادة عنصر
  const handleRestore = (item) => {
    showConfirm(
      'تأكيد الاستعادة',
      `هل تريد استعادة ${getItemName(item)}؟`,
      () => {
        try {
          restoreDeletedItem(item.id);
          showSuccess('تم استعادة العنصر بنجاح');
        } catch (error) {
          showError(error.message || 'حدث خطأ في استعادة العنصر');
        }
      }
    );
  };

  // حذف نهائي
  const handlePermanentDelete = (item) => {
    showConfirm(
      'تحذير: حذف نهائي',
      `هل أنت متأكد من الحذف النهائي لـ ${getItemName(item)}؟ لن تتمكن من استعادته مرة أخرى.`,
      () => {
        try {
          permanentlyDeleteItem(item.id);
          showWarning('تم الحذف النهائي');
        } catch (error) {
          showError('حدث خطأ في الحذف النهائي');
        }
      },
      { type: 'danger', confirmText: 'حذف نهائي', cancelText: 'إلغاء' }
    );
  };

  // تفريغ المهملات حسب النوع
  const handleClearTrash = () => {
    const tabInfo = tabs.find(t => t.id === activeTab);
    showConfirm(
      'تفريغ المهملات',
      `هل أنت متأكد من تفريغ جميع ${tabInfo.label}؟ هذا الإجراء لا يمكن التراجع عنه.`,
      () => {
        try {
          clearTrashByType(activeTab);
          showWarning('تم تفريغ المهملات بنجاح');
        } catch (error) {
          showError('حدث خطأ في تفريغ المهملات');
        }
      },
      { type: 'danger' }
    );
  };

  // تفريغ جميع المهملات
  const handleClearAllTrash = () => {
    showConfirm(
      'تفريغ جميع المهملات',
      'هل أنت متأكد من تفريغ جميع المهملات؟ هذا الإجراء لا يمكن التراجع عنه.',
      () => {
        try {
          clearAllTrash();
          showWarning('تم تفريغ جميع المهملات بنجاح');
        } catch (error) {
          showError('حدث خطأ في تفريغ المهملات');
        }
      },
      { type: 'danger' }
    );
  };

  // الحصول على اسم العنصر
  const getItemName = (item) => {
    const data = item.data;
    switch (item.type) {
      case 'invoice':
        return `فاتورة #${data.id}`;
      case 'product':
      case 'customer':
      case 'supplier':
      case 'warehouse':
      case 'category':
        return data.name || 'غير محدد';
      case 'account':
        return `${data.code} - ${data.name}`;
      case 'purchase_return':
      case 'sales_return':
        return `مرتجع #${data.id}`;
      case 'cash_receipt':
      case 'cash_disbursement':
        return `إيصال #${data.id}`;
      default:
        return 'عنصر';
    }
  };

  // الحصول على أيقونة العنصر
  const getItemIcon = (type) => {
    const iconMap = {
      invoice: <FaFileInvoice className="text-blue-600" />,
      product: <FaBoxOpen className="text-purple-600" />,
      customer: <FaUserTie className="text-green-600" />,
      supplier: <FaTruck className="text-orange-600" />,
      warehouse: <FaWarehouse className="text-indigo-600" />,
      category: <FaTags className="text-pink-600" />,
      account: <FaBook className="text-teal-600" />,
      purchase_return: <FaFileInvoice className="text-yellow-600" />,
      sales_return: <FaFileInvoice className="text-cyan-600" />,
      cash_receipt: <FaMoneyBillWave className="text-emerald-600" />,
      cash_disbursement: <FaMoneyBillWave className="text-red-600" />
    };
    return iconMap[type] || <FaTrash className="text-gray-600" />;
  };

  // الحصول على تفاصيل إضافية
  const getItemDetails = (item) => {
    const data = item.data;
    switch (item.type) {
      case 'invoice':
        return `${data.items?.length || 0} منتج - ${data.total?.toFixed(2) || 0} ج.م`;
      case 'product':
        return `${data.category || '-'} - كمية: ${data.mainQuantity || 0}`;
      case 'customer':
      case 'supplier':
        return `${data.phone || '-'} - رصيد: ${data.balance?.toFixed(2) || 0} ج.م`;
      case 'warehouse':
        return data.location || 'لا يوجد موقع';
      case 'category':
        return data.description || 'لا يوجد وصف';
      case 'account':
        return `نوع: ${data.accountType || '-'}`;
      case 'purchase_return':
      case 'sales_return':
        return `فاتورة #${data.invoiceId} - ${data.totalAmount?.toFixed(2) || 0} ج.م`;
      case 'cash_receipt':
      case 'cash_disbursement':
        return `${data.from || data.to || '-'} - ${data.amount?.toFixed(2) || 0} ج.م`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* الرأسية المدمجة */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <FaTrashRestore className="text-red-600 text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">سلة المهملات</h1>
                <p className="text-xs text-gray-600">{deletedItems?.length || 0} عنصر محذوف</p>
              </div>
            </div>
            
            {deletedItems?.length > 0 && (
              <button
                onClick={handleClearAllTrash}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <FaTrash className="text-xs" />
                تفريغ الكل
              </button>
            )}
          </div>
        </div>

        {/* التبويبات المدمجة */}
        <div className="bg-white rounded-lg shadow-md mb-4">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* شريط البحث والأدوات */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              {currentData.length > 0 && activeTab !== 'all' && (
                <button
                  onClick={handleClearTrash}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <FaTrash className="text-xs" />
                  تفريغ
                </button>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              عرض {filteredData.length} من {currentData.length}
            </div>
          </div>
        </div>

        {/* عرض العناصر */}
        <div className="bg-white rounded-lg shadow-md">
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                <FaCheckCircle className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">لا توجد عناصر</h3>
              <p className="text-gray-500 text-sm">سلة المهملات فارغة في هذا القسم</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredData.map(item => (
                <div key={item.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* الأيقونة */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {getItemIcon(item.type)}
                      </div>
                    </div>
                    
                    {/* المعلومات */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">
                          {getItemName(item)}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(item.deletedAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {getItemDetails(item)}
                      </p>
                    </div>
                    
                    {/* الأزرار */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleRestore(item)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                        title="استعادة"
                      >
                        <FaUndo className="text-xs" />
                        <span className="hidden sm:inline">استعادة</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                        title="حذف نهائي"
                      >
                        <FaTrash className="text-xs" />
                        <span className="hidden sm:inline">حذف</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrashManagement;
