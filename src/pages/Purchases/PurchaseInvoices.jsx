// ======================================
// Purchase Invoices List - سجل فواتير المشتريات (محسّن ومفصل)
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { FaList, FaSearch, FaPrint, FaEye, FaCalendarAlt, FaDollarSign, FaBoxes, FaFilter, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const PurchaseInvoices = () => {
  const { purchaseInvoices, suppliers, products, warehouses } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // فحص الصلاحيات
  const canViewInvoice = hasPermission('view_purchase_invoices');
  const canPrintInvoice = hasPermission('print_invoices');

  // حالات البحث والتصفية
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // معلومات إحصائية
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    cashInvoices: 0,
    deferredInvoices: 0,
    totalProducts: 0
  });

  // حساب الإحصائيات
  useEffect(() => {
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const cashInvoices = filteredInvoices.filter(inv => inv.paymentType === 'cash').length;
    const deferredInvoices = filteredInvoices.filter(inv => inv.paymentType === 'deferred').length;
    const totalProducts = filteredInvoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);

    setStats({
      totalInvoices: filteredInvoices.length,
      totalAmount,
      cashInvoices,
      deferredInvoices,
      totalProducts
    });
  }, [filteredInvoices]);

  // تصفية الفواتير المتقدمة
  const filteredInvoices = purchaseInvoices.filter(invoice => {
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    const supplierName = supplier ? supplier.name : '';
    const supplierPhone = supplier ? supplier.phone : '';
    
    // البحث في المورد ورقم الفاتورة
    const matchesSearch = supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplierPhone.includes(searchQuery) ||
                          invoice.id.toString().includes(searchQuery) ||
                          (invoice.notes && invoice.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // تصفية حسب التاريخ
    const invoiceDate = new Date(invoice.date);
    const now = new Date();
    let matchesDate = true;
    
    if (dateFilter !== 'all') {
      switch (dateFilter) {
        case 'today':
          matchesDate = invoiceDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesDate = invoiceDate >= monthAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          matchesDate = invoiceDate >= yearAgo;
          break;
      }
    }
    
    // تصفية حسب نوع الدفع
    const matchesPaymentType = paymentTypeFilter === 'all' || invoice.paymentType === paymentTypeFilter;
    
    // تصفية حسب الحالة
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesDate && matchesPaymentType && matchesStatus;
  });

  // دالة الطباعة
  const handlePrint = (invoice) => {
    if (!canPrintInvoice) {
      showError('ليس لديك صلاحية لطباعة الفواتير');
      return;
    }
    
    try {
      const invoiceData = {
        formData: invoice,
        items: invoice.items || [],
        total: invoice.total || 0,
        suppliers,
        products,
        warehouses
      };
      printInvoiceDirectly(invoiceData, 'purchase');
      showSuccess('تم إرسال الفاتورة للطباعة');
    } catch (error) {
      showError('حدث خطأ في طباعة الفاتورة');
    }
  };

  // دالة تصدير البيانات
  const handleExport = () => {
    setIsLoading(true);
    try {
      const csvContent = [
        ['رقم الفاتورة', 'المورد', 'التاريخ', 'نوع الدفع', 'المجموع', 'عدد المنتجات', 'الحالة'].join(','),
        ...filteredInvoices.map(invoice => {
          const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
          return [
            invoice.id,
            supplier?.name || '',
            new Date(invoice.date).toLocaleDateString('ar-EG'),
            invoice.paymentType,
            invoice.total,
            invoice.items?.length || 0,
            invoice.status
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `فواتير_المشتريات_${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.csv`;
      link.click();
      
      showSuccess('تم تصدير البيانات بنجاح');
    } catch (error) {
      showError('حدث خطأ في تصدير البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  // فحص صلاحية الوصول
  if (!canViewInvoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لعرض فواتير المشتريات</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  const paymentTypes = {
    'cash': 'نقدي',
    'deferred': 'آجل',
    'partial': 'جزئي'
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FaList className="text-3xl" />
                سجل فواتير المشتريات
              </h1>
              <p className="text-blue-100 mt-2">عرض وإدارة جميع فواتير المشتريات</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats.totalInvoices}</div>
              <div className="text-blue-100">إجمالي الفواتير</div>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FaList className="text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي الفواتير</p>
                  <p className="text-xl font-bold text-blue-600">{stats.totalInvoices}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <FaDollarSign className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <FaBoxes className="text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">نقدي / آجل</p>
                  <p className="text-lg font-bold text-purple-600">{stats.cashInvoices} / {stats.deferredInvoices}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* البحث والتصفية */}
        <div className="p-6 border-b bg-white">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ابحث برقم الفاتورة أو اسم المورد..."
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل التواريخ</option>
                <option value="today">اليوم</option>
                <option value="week">الأسبوع الماضي</option>
                <option value="month">الشهر الماضي</option>
                <option value="year">السنة الماضية</option>
              </select>
            </div>
            <div>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل أنواع الدفع</option>
                <option value="cash">نقدي</option>
                <option value="deferred">آجل</option>
                <option value="partial">جزئي</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل الحالات</option>
                <option value="completed">مكتملة</option>
                <option value="pending">معلقة</option>
                <option value="cancelled">ملغية</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              عرض {filteredInvoices.length} من {purchaseInvoices.length} فاتورة
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : null}
                تصدير CSV
              </button>
            </div>
          </div>
        </div>

        {/* جدول الفواتير */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700">المورد</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">التاريخ</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">نوع الدفع</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">المجموع</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">المنتجات</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    <FaList className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>لا توجد فواتير</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
                  return (
                    <tr key={invoice.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-600">
                        <div className="text-lg">#{invoice.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{supplier?.name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {supplier?.phone && <span>📞 {supplier.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="font-semibold text-gray-700">
                          {new Date(invoice.date).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-2 rounded-full text-xs font-semibold ${
                          invoice.paymentType === 'cash' ? 'bg-green-100 text-green-700' :
                          invoice.paymentType === 'deferred' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {paymentTypes[invoice.paymentType] || invoice.paymentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(invoice.total || 0)}
                        </div>
                        {invoice.discountAmount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            خصم: {formatCurrency(invoice.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="space-y-1">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                            {invoice.items?.length || 0} منتج
                          </span>
                          <div className="text-xs text-gray-500">
                            <div>أساسية: {invoice.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</div>
                            <div>فرعية: {invoice.items?.reduce((sum, item) => sum + (item.subQuantity || 0), 0) || 0}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-2 rounded-full text-xs font-bold ${
                          invoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status === 'completed' ? '✅ مكتملة' :
                           invoice.status === 'pending' ? '⏳ معلقة' :
                           invoice.status === 'cancelled' ? '❌ ملغية' : invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {canPrintInvoice && (
                            <button
                              onClick={() => handlePrint(invoice)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                            >
                              <FaPrint className="text-xs" />
                              طباعة
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-600">
          تم إنشاء هذا السجل في {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
        </div>
      </div>
    </div>
  );
};

export default PurchaseInvoices;
