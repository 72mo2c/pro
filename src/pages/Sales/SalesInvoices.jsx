// ======================================
// Sales Invoices List - سجل فواتير المبيعات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import { FaList, FaSearch, FaPrint, FaCalendarAlt, FaFilter, FaTimes } from 'react-icons/fa';
import { printInvoiceDirectly } from '../../utils/printUtils';
import { formatCurrency } from '../../utils/currencyUtils';

const SalesInvoices = () => {
  const { salesInvoices, customers, products, warehouses } = useData();
  const { currency: currentCurrency } = useSystemSettings();
  const [searchQuery, setSearchQuery] = useState('');
  
  // حالات الفلاتر
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');

  // دالة مسح فلاتر التاريخ
  const clearDateFilters = () => {
    setDateFilterFrom('');
    setDateFilterTo('');
  };

  // دالة مسح جميع الفلاتر
  const clearAllFilters = () => {
    setSearchQuery('');
    setPaymentTypeFilter('all');
    clearDateFilters();
  };

  // دالة التصفية المدمجة
  const getFilteredInvoices = () => {
    return salesInvoices.filter(invoice => {
      // فلتر البحث
      const customer = customers.find(c => c.id === parseInt(invoice.customerId));
      const customerName = customer ? customer.name : '';
      const matchesSearch = !searchQuery || 
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toString().includes(searchQuery);

      // فلتر نوع الدفع
      const matchesPaymentType = paymentTypeFilter === 'all' || 
        invoice.paymentType === paymentTypeFilter;

      // فلتر التاريخ
      let matchesDate = true;
      if (dateFilterFrom || dateFilterTo) {
        const invoiceDate = new Date(invoice.date);
        if (dateFilterFrom) {
          const fromDate = new Date(dateFilterFrom);
          matchesDate = matchesDate && invoiceDate >= fromDate;
        }
        if (dateFilterTo) {
          const toDate = new Date(dateFilterTo);
          toDate.setHours(23, 59, 59, 999); // نهاية اليوم
          matchesDate = matchesDate && invoiceDate <= toDate;
        }
      }

      return matchesSearch && matchesPaymentType && matchesDate;
    });
  };

  // تحديد حالة الإرجاع للفاتورة
  const getReturnStatus = (invoice) => {
    const returns = JSON.parse(localStorage.getItem('salesReturns') || '[]');
    const invoiceReturns = returns.filter(ret => ret.invoiceId === invoice.id);
    
    if (invoiceReturns.length === 0) {
      return { status: 'none', text: '', color: '' };
    }
    
    const totalReturned = invoiceReturns.reduce((sum, ret) => sum + ret.items.reduce((itemSum, item) => itemSum + item.returnQuantity, 0), 0);
    const totalItems = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalReturned >= totalItems) {
      return { status: 'full', text: 'إرجاع كامل', color: 'red' };
    } else {
      return { status: 'partial', text: 'إرجاع جزئي', color: 'orange' };
    }
  };

  // جدول مخصص بـ padding أصغر
  const CompactTable = ({ columns, data }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b"
                >
                  {column.header}
                </th>
              ))}
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 text-xs text-gray-900">
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-xs text-gray-900">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => {
                          const invoiceData = {
                            formData: row,
                            items: row.items || [],
                            total: row.total || 0,
                            suppliers: [],
                            customers,
                            products,
                            warehouses,
                            paymentTypes: [
                              { value: 'cash', label: 'نقدي' },
                              { value: 'deferred', label: 'آجل' },
                              { value: 'partial', label: 'جزئي' }
                            ],
                            type: 'sales'
                          };
                          printInvoiceDirectly(invoiceData, 'sales');
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
                        title="طباعة فورية"
                      >
                        <FaPrint size={12} /> طباعة
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-sm text-gray-500">
                  لا توجد فواتير
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };
  const filteredInvoices = getFilteredInvoices();

  const columns = [
    {
      header: 'رقم الفاتورة',
      accessor: 'id',
      render: (row) => {
        const returnStatus = getReturnStatus(row);
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">#{row.id}</span>
            {returnStatus.status !== 'none' && (
              <span className={`px-2 py-1 rounded-full text-xs ${
                returnStatus.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {returnStatus.text}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'العميل',
      accessor: 'customerId',
      render: (row) => {
        const customer = customers.find(c => c.id === parseInt(row.customerId));
        return customer ? customer.name : '-';
      }
    },
    {
      header: 'التاريخ',
      accessor: 'date',
      render: (row) => new Date(row.date).toLocaleDateString('ar-EG')
    },
    {
      header: 'نوع الدفع',
      accessor: 'paymentType',
      render: (row) => {
        const types = {
          'cash': 'نقدي',
          'deferred': 'آجل',
          'partial': 'جزئي'
        };
        return types[row.paymentType] || row.paymentType;
      }
    },
    {
      header: 'المجموع',
      accessor: 'total',
      render: (row) => formatCurrency(row.total || 0, currentCurrency)
    },
    {
      header: 'عدد المنتجات',
      accessor: 'items',
      render: (row) => {
        const itemCount = row.items ? row.items.length : 0;
        return (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
            {itemCount} منتج
          </span>
        );
      }
    },
    {
      header: 'الحالة',
      accessor: 'status',
      render: (row) => (
        <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded text-xs">
          مكتملة
        </span>
      )
    }
  ];

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = dateFilterFrom || dateFilterTo || searchQuery || paymentTypeFilter !== 'all';

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">سجل فواتير المبيعات</h1>

      <Card icon={<FaList />}>
        {/* قسم الفلاتر */}
        <div className="mb-4 pb-4 border-b">
          <div className="grid grid-cols-12 gap-3 items-end">
            {/* البحث */}
            <div className="col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">البحث</label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ابحث باسم العميل أو رقم الفاتورة..."
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-sm" />
              </div>
            </div>

            {/* تاريخ من */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
              <input
                type="date"
                name="dateFrom"
                value={dateFilterFrom}
                onChange={(e) => setDateFilterFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* تاريخ إلى */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
              <input
                type="date"
                name="dateTo"
                value={dateFilterTo}
                onChange={(e) => setDateFilterTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* نوع الدفع */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدفع</label>
              <div className="relative">
                <select
                  name="paymentType"
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="cash">نقدي</option>
                  <option value="deferred">آجل</option>
                  <option value="partial">جزئي</option>
                </select>
                <FaFilter className="absolute left-3 top-2.5 text-gray-400 text-sm" />
              </div>
            </div>

            {/* إعدادات */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">إعدادات</label>
              <button
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className={`w-full px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2 ${
                  hasActiveFilters 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title="مسح جميع الفلاتر"
              >
                <FaTimes className="text-xs" />
                مسح الكل
              </button>
            </div>
          </div>
        </div>

        {/* جدول النتائج */}
        <CompactTable
          columns={columns}
          data={filteredInvoices}
        />

        {/* إحصائيات سريعة */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <FaFilter className="text-xs" />
                <span className="font-medium">نتائج البحث</span>
              </div>
              <div className="text-blue-600">
                تم العثور على <span className="font-bold">{filteredInvoices.length}</span> فاتورة
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesInvoices;