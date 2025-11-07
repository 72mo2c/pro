// ======================================
// Manage Purchase Invoices - إدارة فواتير المشتريات (محسّنة)
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { FaFileInvoice, FaEdit, FaTrash, FaPrint, FaSearch, FaFilter, FaUndo, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';

const ManagePurchaseInvoices = () => {
  const { purchaseInvoices, suppliers, products, warehouses, deletePurchaseInvoice, addPurchaseReturn, purchaseReturns } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة باستخدام إعدادات النظام
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
  const canReturnInvoice = hasPermission('return_purchase');
  const canPrintInvoice = hasPermission('print_invoices');
  const canDeleteInvoice = hasPermission('delete_purchase_invoice');
  const canManagePurchase = hasPermission('manage_purchases');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState(null);

  // تصفية الفواتير
  const filteredInvoices = purchaseInvoices.filter(invoice => {
    const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
    const supplierName = supplier ? supplier.name : '';
    const matchesSearch = supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.id.toString().includes(searchQuery);
    const matchesFilter = paymentTypeFilter === 'all' || invoice.paymentType === paymentTypeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleReturn = (invoice) => {
    if (!canReturnInvoice) {
      showError('ليس لديك صلاحية لإرجاع فواتير المشتريات');
      return;
    }
    setReturnInvoice(invoice);
    setShowReturnModal(true);
  };

  const handleView = (invoice) => {
    if (!canViewInvoice) {
      showError('ليس لديك صلاحية لعرض فواتير المشتريات');
      return;
    }
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

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

  const handleDelete = (invoice) => {
    if (!canDeleteInvoice) {
      showError('ليس لديك صلاحية لحذف فواتير المشتريات');
      return;
    }
    
    if (window.confirm(`هل أنت متأكد من حذف الفاتورة #${invoice.id}؟\nسيتم إعادة الكميات إلى المخزون.`)) {
      try {
        deletePurchaseInvoice(invoice.id);
        showSuccess('تم حذف الفاتورة بنجاح وإعادة الكميات للمخزون');
      } catch (error) {
        showError(error.message || 'حدث خطأ في حذف الفاتورة');
      }
    }
  };

  // دوال معالجة الإرجاع
  const handlePurchaseReturn = (returnData) => {
    try {
      addPurchaseReturn(returnData);
      showSuccess('تم إرجاع المنتجات بنجاح');
      setShowReturnModal(false);
      setReturnInvoice(null);
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية الإرجاع');
    }
  };

  const closeReturnModal = () => {
    setShowReturnModal(false);
    setReturnInvoice(null);
  };

  const paymentTypes = {
    'cash': 'نقدي',
    'deferred': 'آجل',
    'partial': 'جزئي'
  };

  // فحص صلاحية الوصول
  if (!canManagePurchase && !canViewInvoice) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لعرض أو إدارة فواتير المشتريات</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">إدارة فواتير المشتريات</h2>

      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* البحث */}
          <div className="col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ابحث برقم الفاتورة أو اسم المورد..."
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* التصفية حسب نوع الدفع */}
          <div>
            <div className="relative">
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">كل الأنواع</option>
                <option value="cash">نقدي</option>
                <option value="deferred">آجل</option>
                <option value="partial">جزئي</option>
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          عرض {filteredInvoices.length} من {purchaseInvoices.length} فاتورة
        </div>
      </div>

      {/* جدول الفواتير */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">رقم الفاتورة</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">المورد</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">التاريخ</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">نوع الدفع</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">المجموع الكلي</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">المدفوع / المتبقي</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">المنتجات</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">الحالة</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-3 py-8 text-center text-gray-500">
                    <FaFileInvoice className="mx-auto mb-2 text-3xl text-gray-300" />
                    <p>لا توجد فواتير</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));
                  return (
                    <tr key={invoice.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-3 font-semibold text-blue-600">
                        <div className="text-lg">#{invoice.id}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-gray-800">{supplier?.name || 'غير محدد'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {supplier?.phone && <span>📞 {supplier.phone}</span>}
                          {supplier?.email && <span className="mr-2">✉️ {supplier.email}</span>}
                        </div>
                        {/* عرض رصيد المورد */}
                        {invoice.paymentType === 'deferred' && (
                          <div className="text-xs text-orange-600 mt-1">
                            الرصيد الحالي: {formatCurrency(invoice.remaining || 0)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="font-semibold text-gray-700">
                          {new Date(invoice.date).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(invoice.date).toLocaleDateString('ar-EG', { weekday: 'long' })}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-3 py-2 rounded-full text-xs font-semibold shadow-sm ${
                          invoice.paymentType === 'cash' ? 'bg-green-100 text-green-700 border border-green-200' :
                          invoice.paymentType === 'deferred' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {paymentTypes[invoice.paymentType] || invoice.paymentType}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="font-bold text-lg text-green-600">
                          {formatCurrency(invoice.total || 0)}
                        </div>
                        {invoice.discountAmount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            خصم: {formatCurrency(invoice.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">مدفوع:</span>
                            <span className="font-semibold text-green-600 ml-1">
                              {formatCurrency(invoice.paid || 0)}
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">متبقي:</span>
                            <span className="font-semibold text-orange-600 ml-1">
                              {formatCurrency(invoice.remaining || 0)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
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
                      <td className="px-3 py-3 text-center">
                        <span className={`px-3 py-2 rounded-full text-xs font-bold shadow-sm ${
                          invoice.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          invoice.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {invoice.status === 'completed' ? '✅ مكتملة' :
                           invoice.status === 'pending' ? '⏳ معلقة' :
                           invoice.status === 'cancelled' ? '❌ ملغية' : invoice.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {canViewInvoice && (
                            <button
                              onClick={() => handleView(invoice)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs"
                              title="عرض التفاصيل"
                            >
                              <FaFileInvoice className="mx-auto" />
                              <span className="text-xs mt-1">عرض</span>
                            </button>
                          )}
                          <div className="flex justify-center gap-1">
                            {canReturnInvoice && (
                              <button
                                onClick={() => handleReturn(invoice)}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                title="إرجاع"
                              >
                                <FaUndo className="text-sm" />
                              </button>
                            )}
                            {canPrintInvoice && (
                              <button
                                onClick={() => handlePrint(invoice)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="طباعة"
                              >
                                <FaPrint className="text-sm" />
                              </button>
                            )}
                          </div>
                          {canDeleteInvoice && (
                            <button
                              onClick={() => handleDelete(invoice)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="حذف"
                            >
                              <FaTrash className="text-sm mx-auto" />
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
      </div>

      {/* Modal عرض تفاصيل الفاتورة */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">تفاصيل فاتورة المشتريات #{selectedInvoice.id}</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* معلومات الفاتورة */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">المورد</p>
                  <p className="font-semibold text-sm">
                    {suppliers.find(s => s.id === parseInt(selectedInvoice.supplierId))?.name || 'غير محدد'}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">التاريخ</p>
                  <p className="font-semibold text-sm">
                    {new Date(selectedInvoice.date).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">نوع الدفع</p>
                  <p className="font-semibold text-sm">
                    {paymentTypes[selectedInvoice.paymentType] || selectedInvoice.paymentType}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">المجموع الكلي</p>
                  <p className="font-bold text-lg text-purple-600">
                    {formatCurrency(selectedInvoice.total || 0)}
                  </p>
                </div>
              </div>

              {/* ملخص المالية */}
              <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">ملخص المالية</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">المجموع الفرعي</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {formatCurrency(selectedInvoice.subtotal || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">الخصم</p>
                      <p className="text-sm font-semibold text-red-600">
                        {formatCurrency(selectedInvoice.discountAmount || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">المدفوع</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(selectedInvoice.paid || 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">المتبقي</p>
                      <p className="text-sm font-semibold text-orange-600">
                        {formatCurrency(selectedInvoice.remaining || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول المنتجات المحسّن */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-800 mb-3">المنتجات ({selectedInvoice.items?.length || 0})</h4>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">#</th>
                        <th className="px-3 py-3 text-right text-xs font-bold text-gray-700">المنتج</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">الكمية الأساسية</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">الكمية الفرعية</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">السعر الأساسي</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">السعر الفرعي</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">خصم العنصر</th>
                        <th className="px-3 py-3 text-center text-xs font-bold text-gray-700">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(selectedInvoice.items || []).map((item, index) => {
                        const product = products.find(p => p.id === parseInt(item.productId));
                        const warehouse = warehouses.find(w => w.id === product?.warehouseId);
                        
                        // محاولة الحصول على اسم المنتج من مصادر متعددة
                        const productName = product?.name || item.productName || 'غير محدد';
                        const productCategory = product?.category || '-';
                        const productCode = product?.code || item.productCode || '-';
                        
                        // حساب إجمالي العنصر
                        const itemTotalWithoutDiscount = (item.quantity || 0) * (item.price || 0) + 
                                                       (item.subQuantity || 0) * (item.subPrice || 0);
                        const itemTotal = Math.max(0, itemTotalWithoutDiscount - (item.discount || 0));
                        const itemDiscount = item.discount || 0;
                        
                        return (
                          <tr key={index} className="hover:bg-blue-50 transition-colors">
                            <td className="px-3 py-3 font-semibold text-blue-600">{index + 1}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-col">
                                <div className="font-semibold text-gray-800">{productName}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  <span className="bg-gray-100 px-2 py-1 rounded">{productCategory}</span>
                                  {productCode !== '-' && (
                                    <span className="bg-blue-100 px-2 py-1 rounded mr-1">كود: {productCode}</span>
                                  )}
                                  {warehouse && (
                                    <span className="bg-green-100 px-2 py-1 rounded mr-1">{warehouse.name}</span>
                                  )}
                                </div>
                                {/* عرض المخزون الفعلي */}
                                {product && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    <span className="bg-yellow-100 px-2 py-1 rounded">
                                      متوفر: أساسية {product.mainQuantity || 0} | فرعية {product.subQuantity || 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                                {item.quantity || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">
                                {item.subQuantity || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="text-green-600 font-semibold">
                                {formatCurrency(item.price || 0)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="text-green-500 text-sm">
                                {item.subPrice > 0 ? formatCurrency(item.subPrice || 0) : '-'}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                {itemDiscount > 0 ? `-${formatCurrency(itemDiscount)}` : '-'}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="font-bold text-lg text-blue-600">
                                {formatCurrency(itemTotal)}
                              </div>
                              {itemDiscount > 0 && (
                                <div className="text-xs text-gray-500">
                                  قبل الخصم: {formatCurrency(itemTotalWithoutDiscount)}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ملاحظات إضافية */}
              {selectedInvoice.notes && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">ملاحظات</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* معلومات إضافية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">معلومات إضافية</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">عدد المنتجات:</span>
                      <span className="font-semibold">{selectedInvoice.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الكمية الأساسية:</span>
                      <span className="font-semibold">
                        {selectedInvoice.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الكمية الفرعية:</span>
                      <span className="font-semibold">
                        {selectedInvoice.items?.reduce((sum, item) => sum + (item.subQuantity || 0), 0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الخصومات:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(selectedInvoice.items?.reduce((sum, item) => sum + (item.discount || 0), 0) || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">معلومات الدفع</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">نوع الدفع:</span>
                      <span className="font-semibold">
                        {paymentTypes[selectedInvoice.paymentType] || selectedInvoice.paymentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الوقت:</span>
                      <span className="font-semibold">
                        {new Date(selectedInvoice.date).toLocaleTimeString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الحالة:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        selectedInvoice.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedInvoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedInvoice.status === 'completed' ? 'مكتملة' :
                         selectedInvoice.status === 'pending' ? 'معلقة' : selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 border-t flex justify-end gap-2">
              {canPrintInvoice && (
                <button
                  onClick={() => {
                    handlePrint(selectedInvoice);
                    setShowViewModal(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FaPrint /> طباعة
                </button>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإرجاع المنبثقة */}
      {showReturnModal && returnInvoice && (
        <PurchaseReturnModal
          invoice={returnInvoice}
          products={products}
          suppliers={suppliers}
          purchaseReturns={purchaseReturns}
          onSubmit={handlePurchaseReturn}
          onClose={closeReturnModal}
          formatCurrency={formatCurrency}
          showError={showError}
        />
      )}
    </div>
  );
};

// مكون النافذة المنبثقة للإرجاع في المشتريات
const PurchaseReturnModal = ({ invoice, products, suppliers, purchaseReturns, onSubmit, onClose, formatCurrency, showError }) => {
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const supplier = suppliers.find(s => s.id === parseInt(invoice.supplierId));

  useEffect(() => {
    // حساب الكميات المرتجعة مسبقاً لكل منتج
    const itemsWithReturnInfo = invoice.items.map(item => {
      const previousReturns = purchaseReturns.filter(ret => 
        ret.invoiceId === invoice.id && ret.status !== 'cancelled'
      );
      
      let totalReturnedQty = 0;
      previousReturns.forEach(ret => {
        const retItem = ret.items.find(i => i.productId === item.productId);
        if (retItem) {
          totalReturnedQty += (retItem.quantity || 0) + (retItem.subQuantity || 0);
        }
      });
      
      const originalQty = parseInt(item.quantity) || 0;
      const availableQty = originalQty - totalReturnedQty;
      
      // الحصول على اسم المنتج من قائمة المنتجات
      const product = products.find(p => p.id === parseInt(item.productId));
      
      return {
        productId: item.productId,
        productName: product?.name || item.productName || 'غير محدد',
        originalQuantity: originalQty,
        originalPrice: item.price || 0,
        returnedQty: totalReturnedQty,
        availableQty: availableQty,
        returnQuantity: 0,
        returnSubQuantity: 0,
        selected: false
      };
    });
    
    setReturnItems(itemsWithReturnInfo);
  }, [invoice, purchaseReturns, products]);

  const handleItemSelect = (index) => {
    const updated = [...returnItems];
    updated[index].selected = !updated[index].selected;
    
    // إذا تم إلغاء التحديد، إعادة تعيين الكميات
    if (!updated[index].selected) {
      updated[index].returnQuantity = 0;
      updated[index].returnSubQuantity = 0;
    }
    
    setReturnItems(updated);
  };

  const handleQuantityChange = (index, value) => {
    const updated = [...returnItems];
    const item = updated[index];
    
    updated[index].returnQuantity = Math.max(0, parseInt(value) || 0);
    
    // التحقق من عدم تجاوز الكمية المتاحة
    if (updated[index].returnQuantity > item.availableQty) {
      updated[index].returnQuantity = 0;
    }
    
    setReturnItems(updated);
  };

  const calculateTotalReturn = () => {
    return returnItems.reduce((total, item) => {
      if (item.selected) {
        const mainAmount = item.returnQuantity * item.originalPrice;
        return total + mainAmount;
      }
      return total;
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق من وجود منتجات محددة
    const selectedItems = returnItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      showError('يرجى اختيار منتج واحد على الأقل للإرجاع');
      return;
    }

    // التحقق من الكميات
    const hasInvalidQuantity = selectedItems.some(item => 
      item.returnQuantity === 0
    );
    
    if (hasInvalidQuantity) {
      showError('يرجى إدخال كمية صحيحة للمنتجات المحددة');
      return;
    }

    // التحقق من سبب الإرجاع
    if (!reason.trim()) {
      showError('يرجى إدخال سبب الإرجاع');
      return;
    }

    try {
      // إعداد بيانات الإرجاع
      const returnData = {
        invoiceId: invoice.id,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.returnQuantity,
          subQuantity: 0
        })),
        reason,
        notes
      };

      onSubmit(returnData);
    } catch (error) {
      showError('حدث خطأ في عملية الإرجاع');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* رأس النافذة */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">إرجاع فاتورة مشتريات</h2>
            <p className="text-sm text-gray-600">فاتورة رقم #{invoice.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6">
          {/* معلومات الفاتورة الأصلية */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">معلومات الفاتورة الأصلية</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">المورد</p>
                <p className="font-semibold text-sm">{supplier?.name || 'غير محدد'}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">التاريخ</p>
                <p className="font-semibold text-sm">
                  {new Date(invoice.date).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">نوع الدفع</p>
                <p className="font-semibold text-sm">
                  {invoice.paymentType === 'cash' ? 'نقدي' : invoice.paymentType === 'deferred' ? 'آجل' : 'جزئي'}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">المجموع الكلي</p>
                <p className="font-bold text-lg text-purple-600">{formatCurrency(invoice.total || 0)}</p>
              </div>
            </div>
          </div>

          {/* نموذج الإرجاع */}
          <form onSubmit={handleSubmit}>
            {/* جدول المنتجات */}
            <div className="bg-white border rounded-lg mb-4">
              <div className="p-4 border-b">
                <h3 className="text-sm font-bold text-gray-800">المنتجات المراد إرجاعها</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 w-10">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            const updated = returnItems.map(item => ({
                              ...item,
                              selected: e.target.checked && item.availableQty > 0
                            }));
                            setReturnItems(updated);
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">المنتج</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">الكمية الأصلية</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المرتجع سابقاً</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المتاح للإرجاع</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">كمية الإرجاع</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700">المبلغ المرتجع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {returnItems.map((item, index) => {
                      const product = products.find(p => p.id === parseInt(item.productId));
                      const returnAmount = item.returnQuantity * item.originalPrice;
                      const isDisabled = item.availableQty === 0;
                      
                      return (
                        <tr key={index} className={`hover:bg-gray-50 ${isDisabled ? 'opacity-50' : ''}`}>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => handleItemSelect(index)}
                              disabled={isDisabled}
                              className="rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-gray-500">{product?.category || '-'}</div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.originalQuantity}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              {item.returnedQty}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.availableQty > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.availableQty}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {item.selected && (
                              <input
                                type="number"
                                value={item.returnQuantity}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                className="w-20 px-2 py-1 text-xs text-center border border-gray-300 rounded"
                                min="0"
                                max={item.availableQty}
                              />
                            )}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-red-600">
                            {item.selected ? returnAmount.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* سبب الإرجاع والملاحظات */}
            <div className="bg-white border rounded-lg mb-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سبب الإرجاع <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">اختر السبب...</option>
                    <option value="defective">منتج معيب</option>
                    <option value="damaged">منتج تالف</option>
                    <option value="wrong_item">منتج خاطئ</option>
                    <option value="supplier_request">طلب المورد</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل ملاحظات إضافية..."
                  />
                </div>
              </div>
            </div>

            {/* ملخص الإرجاع */}
            <div className="bg-white border rounded-lg mb-4 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">عدد المنتجات المحددة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {returnItems.filter(i => i.selected).length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">إجمالي المبلغ المرتجع</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(calculateTotalReturn())}
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <FaUndo /> تنفيذ الإرجاع
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManagePurchaseInvoices;
