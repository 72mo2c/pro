import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const SalesByCustomer = () => {
  const { salesInvoices, customers } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });

  useEffect(() => {
    generateReport();
  }, [salesInvoices, customers, startDate, endDate]);

  const generateReport = () => {
    const customerSales = {};

    let filteredInvoices = salesInvoices || [];

    if (startDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredInvoices = filteredInvoices.filter(
        (invoice) => new Date(invoice.date) <= new Date(endDate)
      );
    }

    filteredInvoices.forEach((invoice) => {
      const customerId = invoice.customerId || 'unknown';
      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          customerId,
          invoiceCount: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalRemaining: 0,
        };
      }

      customerSales[customerId].invoiceCount += 1;
      customerSales[customerId].totalAmount += invoice.total || 0;
      customerSales[customerId].totalPaid += invoice.paid || 0;
      customerSales[customerId].totalRemaining +=
        (invoice.total || 0) - (invoice.paid || 0);
    });

    const data = Object.values(customerSales).map((item) => {
      const customer = customers?.find((c) => c.id === item.customerId);
      return {
        ...item,
        customerName: customer?.name || 'عميل غير مسجل',
      };
    });

    data.sort((a, b) => b.totalAmount - a.totalAmount);
    
    // حساب الإحصائيات
    const totalCustomers = data.length;
    const totalInvoices = data.reduce((sum, item) => sum + item.invoiceCount, 0);
    const totalAmount = data.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalPaid = data.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalRemaining = totalAmount - totalPaid;
    
    setReportData(data);
    setStats({ totalCustomers, totalInvoices, totalAmount, totalPaid, totalRemaining });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['العميل', 'عدد الفواتير', 'إجمالي المبيعات', 'المدفوع', 'المتبقي'];
    const csvData = reportData.map((item) => [
      item.customerName,
      item.invoiceCount,
      item.totalAmount.toFixed(2),
      item.totalPaid.toFixed(2),
      item.totalRemaining.toFixed(2),
    ]);

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    // إضافة BOM لدعم الحروف العربية في Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_by_customer_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">


      <PageHeader
        title="تقرير المبيعات حسب العميل"
        subtitle="تحليل مبيعات كل عميل والمبالغ المحصلة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        actions={[
          {
            label: 'طباعة',
            onClick: printReport,
            variant: 'secondary',
          },
          {
            label: 'تصدير Excel',
            onClick: exportToExcel,
            variant: 'primary',
          },
        ]}
      />

      {/* الإحصائيات المدمجة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4">
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg border border-blue-300 hover:shadow-xl transition-all duration-300 hover:border-blue-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">عدد العملاء</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalCustomers}</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg border border-emerald-300 hover:shadow-xl transition-all duration-300 hover:border-emerald-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">عدد الفواتير</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalInvoices}</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg border border-purple-300 hover:shadow-xl transition-all duration-300 hover:border-purple-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">إجمالي المبيعات</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalAmount.toFixed(0)} ج.م</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg border border-indigo-300 hover:shadow-xl transition-all duration-300 hover:border-indigo-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">إجمالي المدفوع</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalPaid.toFixed(0)} ج.م</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg border border-rose-300 hover:shadow-xl transition-all duration-300 hover:border-rose-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">إجمالي المتبقي</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalRemaining.toFixed(0)} ج.م</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors duration-200"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      </Card>

      {/* جدول التقرير */}
      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-100 via-blue-50 to-slate-100">
            <tr>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                العميل
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                عدد الفواتير
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                إجمالي المبيعات
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                المدفوع
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200">
                المتبقي
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 text-xs transition-colors duration-200">
                <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-medium">
                  {item.customerName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-semibold">
                  {item.invoiceCount}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-bold text-gray-900">
                  {item.totalAmount.toFixed(2)} ج.م
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-semibold text-emerald-700">
                  {item.totalPaid.toFixed(2)} ج.م
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-semibold text-rose-700">
                  {item.totalRemaining.toFixed(2)} ج.م
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium mb-1">لا توجد بيانات لعرضها</p>
              <p className="text-xs text-gray-400">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SalesByCustomer;