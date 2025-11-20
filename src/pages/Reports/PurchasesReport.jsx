import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const PurchasesReport = () => {
  const { purchaseInvoices, suppliers } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });

  useEffect(() => {
    generateReport();
  }, [purchaseInvoices, suppliers, startDate, endDate, selectedSupplier]);

  const generateReport = () => {
    let data = purchaseInvoices || [];

    // فلترة حسب التاريخ من
    if (startDate) {
      data = data.filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        const filterDate = new Date(startDate);
        return invoiceDate >= filterDate;
      });
    }

    // فلترة حسب التاريخ إلى
    if (endDate) {
      data = data.filter((invoice) => {
        const invoiceDate = new Date(invoice.date);
        const filterDate = new Date(endDate);
        return invoiceDate <= filterDate;
      });
    }

    // فلترة حسب المورد
    if (selectedSupplier !== 'all') {
      data = data.filter((invoice) => 
        String(invoice.supplierId) === String(selectedSupplier)
      );
    }

    const totalInvoices = data.length;
    const totalAmount = data.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = data.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const totalRemaining = totalAmount - totalPaid;

    setReportData(data);
    setStats({ totalInvoices, totalAmount, totalPaid, totalRemaining });
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find((s) => String(s.id) === String(supplierId));
    return supplier?.name || 'مورد غير مسجل';
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['رقم الفاتورة', 'التاريخ', 'المورد', 'الإجمالي', 'المدفوع', 'المتبقي', 'الحالة'];
    const csvData = reportData.map((invoice) => [
      invoice.id,
      invoice.date,
      getSupplierName(invoice.supplierId),
      invoice.total?.toFixed(2) || '0.00',
      invoice.paid?.toFixed(2) || '0.00',
      (invoice.total - invoice.paid).toFixed(2),
      invoice.paid >= invoice.total ? 'مدفوع' : 'غير مدفوع',
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
    link.download = `purchases_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير المشتريات"
        subtitle="تقرير شامل لجميع المشتريات خلال فترة زمنية محددة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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
        <Card className="bg-gradient-to-br from-amber-400 to-amber-500 text-white p-3">
          <div className="text-center">
            <div className="text-amber-100 text-xs mb-1">عدد الفواتير</div>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-400 to-orange-500 text-white p-3">
          <div className="text-center">
            <div className="text-orange-100 text-xs mb-1">عدد الموردين</div>
            <div className="text-2xl font-bold">
              {selectedSupplier === 'all' 
                ? new Set(reportData.map(inv => inv.supplierId)).size || 0 
                : 1
              }
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-400 to-red-500 text-white p-3">
          <div className="text-center">
            <div className="text-red-100 text-xs mb-1">إجمالي المشتريات</div>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(2)} ج.م</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-3">
          <div className="text-center">
            <div className="text-emerald-100 text-xs mb-1">إجمالي المدفوع</div>
            <div className="text-2xl font-bold">{stats.totalPaid.toFixed(2)} ج.م</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-rose-400 to-rose-500 text-white p-3">
          <div className="text-center">
            <div className="text-rose-100 text-xs mb-1">إجمالي المتبقي</div>
            <div className="text-2xl font-bold">{stats.totalRemaining.toFixed(2)} ج.م</div>
          </div>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card className="mt-4 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الفلاتر</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المورد
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">جميع الموردين</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </Card>

      {/* جدول التقرير */}
      <Card className="mt-4 overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المورد
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجمالي
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدفوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المتبقي
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{invoice.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {getSupplierName(invoice.supplierId)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {(invoice.total || 0).toFixed(2)} ج.م
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-emerald-600 font-medium">
                    {(invoice.paid || 0).toFixed(2)} ج.م
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-rose-600 font-medium">
                    {((invoice.total || 0) - (invoice.paid || 0)).toFixed(2)} ج.م
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {(invoice.paid || 0) >= (invoice.total || 0) ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        مدفوع
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        غير مدفوع
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportData.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات</h3>
              <p className="text-gray-500">
                لا توجد فواتير مشتريات تطابق المعايير المحددة
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PurchasesReport;