import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const TreasuryReport = () => {
  const { cashReceipts, cashDisbursements } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    totalPayments: 0,
    balance: 0,
    totalTransactions: 0,
  });

  useEffect(() => {
    generateReport();
  }, [cashReceipts, cashDisbursements, startDate, endDate, transactionType]);

  const generateReport = () => {
    // جمع جميع حركات الخزينة من الإيصالات والصرف
    let allTransactions = [];

    // تحويل الإيصالات إلى معاملات
    const receipts = (cashReceipts || []).map(receipt => ({
      id: `receipt-${receipt.id}`,
      date: receipt.date,
      amount: parseFloat(receipt.amount) || 0,
      description: receipt.description || 'إيصال استلام نقدي',
      reference: receipt.reference || `إيصال ${receipt.id}`,
      type: 'receipt',
      typeLabel: 'مقبوض',
      originalData: receipt
    }));

    // تحويل الصرف إلى معاملات
    const payments = (cashDisbursements || []).map(disbursement => ({
      id: `disbursement-${disbursement.id}`,
      date: disbursement.date,
      amount: parseFloat(disbursement.amount) || 0,
      description: disbursement.description || 'إيصال صرف نقدي',
      reference: disbursement.reference || `صرف ${disbursement.id}`,
      type: 'payment',
      typeLabel: 'مدفوع',
      originalData: disbursement
    }));

    allTransactions = [...receipts, ...payments];

    // فلترة حسب التاريخ من
    if (startDate) {
      allTransactions = allTransactions.filter((trans) => 
        new Date(trans.date) >= new Date(startDate)
      );
    }

    // فلترة حسب التاريخ إلى
    if (endDate) {
      allTransactions = allTransactions.filter((trans) => 
        new Date(trans.date) <= new Date(endDate)
      );
    }

    // فلترة حسب نوع المعاملة
    if (transactionType !== 'all') {
      allTransactions = allTransactions.filter((trans) => trans.type === transactionType);
    }

    // حساب الإحصائيات
    const totalReceipts = allTransactions
      .filter((trans) => trans.type === 'receipt')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const totalPayments = allTransactions
      .filter((trans) => trans.type === 'payment')
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);

    const balance = totalReceipts - totalPayments;
    const totalTransactions = allTransactions.length;

    setReportData(allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setStats({ totalReceipts, totalPayments, balance, totalTransactions });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['التاريخ', 'النوع', 'المبلغ', 'البيان', 'المرجع'];
    const csvData = reportData.map((trans) => [
      trans.date,
      trans.type === 'receipt' ? 'مقبوض' : 'مدفوع',
      trans.amount?.toFixed(2) || '0.00',
      trans.description || '-',
      trans.reference || '-',
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
    link.download = `treasury_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير حركة الخزينة"
        subtitle="عرض جميع المقبوضات والمدفوعات النقدية"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-3">
          <div className="text-center">
            <div className="text-emerald-100 text-xs mb-1">عدد الحركات</div>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white p-3">
          <div className="text-center">
            <div className="text-emerald-100 text-xs mb-1">المقبوضات</div>
            <div className="text-2xl font-bold">{stats.totalReceipts.toFixed(2)} ج.م</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-rose-400 to-rose-500 text-white p-3">
          <div className="text-center">
            <div className="text-rose-100 text-xs mb-1">المدفوعات</div>
            <div className="text-2xl font-bold">{stats.totalPayments.toFixed(2)} ج.م</div>
          </div>
        </Card>
        <Card className={`bg-gradient-to-br ${
          stats.balance >= 0 ? 'from-blue-400 to-blue-500' : 'from-orange-400 to-orange-500'
        } text-white p-3`}>
          <div className="text-center">
            <div className="text-blue-100 text-xs mb-1">الرصيد الحالي</div>
            <div className="text-2xl font-bold">{stats.balance.toFixed(2)} ج.م</div>
          </div>
        </Card>
        <Card className={`bg-gradient-to-br ${
          stats.balance >= 0 ? 'from-green-400 to-green-500' : 'from-red-400 to-red-500'
        } text-white p-3`}>
          <div className="text-center">
            <div className="text-green-100 text-xs mb-1">حالة الخزينة</div>
            <div className="text-sm font-bold">{stats.balance >= 0 ? 'إيجابي' : 'سلبي'}</div>
          </div>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card className="mt-4 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الفلاتر</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع الحركة
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">جميع الحركات</option>
              <option value="receipt">مقبوضات</option>
              <option value="payment">مدفوعات</option>
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
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البيان
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المرجع
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((trans) => (
                <tr key={trans.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {new Date(trans.date).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {trans.type === 'receipt' ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        مقبوض
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        مدفوع
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                    trans.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {(trans.amount || 0).toFixed(2)} ج.م
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {trans.description || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {trans.reference || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportData.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حركات خزينة</h3>
              <p className="text-gray-500">
                لم يتم تسجيل أي حركات في الخزينة خلال الفترة المحددة
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TreasuryReport;