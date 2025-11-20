import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const CashFlowReport = () => {
  const { cashReceipts, cashDisbursements, salesInvoices, purchaseInvoices } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    salesCash: 0,
    purchasesCash: 0,
    otherReceipts: 0,
    otherPayments: 0,
    netCashFlow: 0,
  });

  useEffect(() => {
    generateReport();
  }, [cashReceipts, cashDisbursements, salesInvoices, purchaseInvoices, startDate, endDate]);

  const generateReport = () => {
    let filteredSales = salesInvoices || [];
    let filteredPurchases = purchaseInvoices || [];
    
    // تحويل المقبوضات والمصروفات إلى تنسيق موحد
    const receipts = (cashReceipts || []).map(receipt => ({
      id: `receipt-${receipt.id}`,
      type: 'receipt',
      amount: parseFloat(receipt.amount) || 0,
      date: receipt.date,
      description: receipt.description
    }));
    
    const payments = (cashDisbursements || []).map(disbursement => ({
      id: `disbursement-${disbursement.id}`,
      type: 'payment',
      amount: parseFloat(disbursement.amount) || 0,
      date: disbursement.date,
      description: disbursement.description
    }));
    
    let filteredTransactions = [...receipts, ...payments];

    if (startDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
      filteredTransactions = filteredTransactions.filter(
        (trans) => new Date(trans.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
      filteredTransactions = filteredTransactions.filter(
        (trans) => new Date(trans.date) <= new Date(endDate)
      );
    }

    // حساب عدد المعاملات بعد الفلترة
    const totalTransactions = filteredSales.length + filteredPurchases.length + filteredTransactions.length;

    const salesCash = filteredSales.reduce((sum, inv) => sum + (inv.paid || 0), 0);
    const purchasesCash = filteredPurchases.reduce((sum, inv) => sum + (inv.paid || 0), 0);

    const otherReceipts = filteredTransactions
      .filter((trans) => trans.type === 'receipt')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const otherPayments = filteredTransactions
      .filter((trans) => trans.type === 'payment')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const totalInflow = salesCash + otherReceipts;
    const totalOutflow = purchasesCash + otherPayments;
    const netCashFlow = totalInflow - totalOutflow;

    setReportData({
      salesCash,
      purchasesCash,
      otherReceipts,
      otherPayments,
      totalInflow,
      totalOutflow,
      netCashFlow,
      totalTransactions,
    });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['البيان', 'المبلغ'];
    const csvData = [
      ['التدفقات الداخلة', ''],
      ['المبيعات النقدية', reportData.salesCash.toFixed(2)],
      ['مقبوضات أخرى', reportData.otherReceipts.toFixed(2)],
      ['إجمالي التدفقات الداخلة', reportData.totalInflow.toFixed(2)],
      ['', ''],
      ['التدفقات الخارجة', ''],
      ['المشتريات النقدية', reportData.purchasesCash.toFixed(2)],
      ['مدفوعات أخرى', reportData.otherPayments.toFixed(2)],
      ['إجمالي التدفقات الخارجة', reportData.totalOutflow.toFixed(2)],
      ['', ''],
      ['صافي التدفق النقدي', reportData.netCashFlow.toFixed(2)],
    ];

    let csv = headers.join(',') + '\n';
    csvData.forEach((row) => {
      csv += row.join(',') + '\n';
    });

    // إضافة BOM لدعم الحروف العربية في Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cash_flow_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير التدفقات النقدية"
        subtitle="تحليل التدفقات النقدية الداخلة والخارجة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">عدد المعاملات</p>
              <p className="text-2xl font-bold">{reportData.totalTransactions || 0}</p>
            </div>
            <div className="text-emerald-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">التدفقات الداخلة</p>
              <p className="text-lg font-bold">{(reportData.totalInflow || 0).toFixed(0)} ج.م</p>
            </div>
            <div className="text-amber-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">التدفقات الخارجة</p>
              <p className="text-lg font-bold">{(reportData.totalOutflow || 0).toFixed(0)} ج.م</p>
            </div>
            <div className="text-rose-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${(reportData.netCashFlow || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-opacity-90 text-sm font-medium">صافي التدفق</p>
              <p className="text-lg font-bold">{(reportData.netCashFlow || 0).toFixed(0)} ج.م</p>
            </div>
            <div className={`${(reportData.netCashFlow || 0) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {(reportData.netCashFlow || 0) >= 0 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">حالة التدفق</p>
              <p className="text-sm font-bold">{(reportData.netCashFlow || 0) >= 0 ? 'إيجابي' : 'سلبي'}</p>
            </div>
            <div className="text-indigo-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Card className="mt-6">
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 ml-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            خيارات الفلترة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                من تاريخ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-xl font-bold mb-4">التدفقات الداخلة</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-green-400">
              <span className="text-sm opacity-90">المبيعات النقدية</span>
              <span className="font-bold">{reportData.salesCash?.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-green-400">
              <span className="text-sm opacity-90">مقبوضات أخرى</span>
              <span className="font-bold">{reportData.otherReceipts?.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">الإجمالي</span>
              <span className="text-2xl font-bold">{reportData.totalInflow?.toFixed(2)} ج.م</span>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <h3 className="text-xl font-bold mb-4">التدفقات الخارجة</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-red-400">
              <span className="text-sm opacity-90">المشتريات النقدية</span>
              <span className="font-bold">{reportData.purchasesCash?.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-red-400">
              <span className="text-sm opacity-90">مدفوعات أخرى</span>
              <span className="font-bold">{reportData.otherPayments?.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold">الإجمالي</span>
              <span className="text-2xl font-bold">{reportData.totalOutflow?.toFixed(2)} ج.م</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className={`mt-6 bg-gradient-to-r ${
        reportData.netCashFlow >= 0
          ? 'from-blue-500 to-blue-600'
          : 'from-orange-500 to-orange-600'
      } text-white`}>
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold mb-4">صافي التدفق النقدي</h3>
          <p className="text-5xl font-bold">{reportData.netCashFlow?.toFixed(2)} ج.م</p>
          <p className="mt-4 text-sm opacity-90">
            {reportData.netCashFlow >= 0
              ? 'تدفق نقدي إيجابي'
              : 'تدفق نقدي سلبي'}
          </p>
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="text-lg font-bold mb-4">ملخص التدفقات النقدية</h3>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">التدفقات الداخلة</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>المبيعات النقدية:</div>
              <div className="text-right font-medium">{reportData.salesCash?.toFixed(2)} ج.م</div>
              <div>مقبوضات أخرى:</div>
              <div className="text-right font-medium">{reportData.otherReceipts?.toFixed(2)} ج.م</div>
              <div className="font-bold">الإجمالي:</div>
              <div className="text-right font-bold text-green-700">{reportData.totalInflow?.toFixed(2)} ج.م</div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">التدفقات الخارجة</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>المشتريات النقدية:</div>
              <div className="text-right font-medium">{reportData.purchasesCash?.toFixed(2)} ج.م</div>
              <div>مدفوعات أخرى:</div>
              <div className="text-right font-medium">{reportData.otherPayments?.toFixed(2)} ج.م</div>
              <div className="font-bold">الإجمالي:</div>
              <div className="text-right font-bold text-red-700">{reportData.totalOutflow?.toFixed(2)} ج.م</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-bold text-lg">صافي التدفق النقدي:</div>
              <div className={`text-right font-bold text-lg ${
                reportData.netCashFlow >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {reportData.netCashFlow?.toFixed(2)} ج.م
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CashFlowReport;