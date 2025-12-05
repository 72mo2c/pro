import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const ProfitLossReport = () => {
  const { salesInvoices, purchaseInvoices, products, inventory } = useData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    grossProfitMargin: 0,
    netProfit: 0,
    revenueTransactions: 0,
    costItems: 0,
    profitMargin: 0,
    efficiency: 0,
  });

  useEffect(() => {
    generateReport();
  }, [salesInvoices, purchaseInvoices, products, inventory, startDate, endDate]);

  const generateReport = () => {
    let filteredSales = salesInvoices || [];
    let filteredPurchases = purchaseInvoices || [];
    let filteredProducts = products || [];
    let filteredInventory = inventory || [];

    // حساب عدد المعاملات
    const revenueTransactions = filteredSales.length;

    if (startDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredSales = filteredSales.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
      filteredPurchases = filteredPurchases.filter(
        (inv) => new Date(inv.date) <= new Date(endDate)
      );
    }

    // تحسين حساب إجمالي الإيرادات مع مراعاة الخصومات والضرائب
    const totalRevenue = filteredSales.reduce((sum, inv) => {
      const invoiceTotal = inv.total || 0;
      const discount = inv.discount || 0;
      const tax = inv.tax || 0;
      return sum + Math.max(0, invoiceTotal - discount - tax);
    }, 0);

    // تحسين حساب تكلفة البضاعة المباعة مع خوارزمية متطورة
    let totalCost = 0;
    let costItems = 0;
    
    filteredSales.forEach((invoice) => {
      invoice.items?.forEach((item) => {
        costItems++;
        const quantity = item.quantity || 0;
        const productId = item.productId;
        
        // البحث عن المنتج في قاعدة البيانات
        const product = filteredProducts.find((p) => String(p.id) === String(productId));
        
        // استراتيجية حساب التكلفة المتعددة المستويات
        let itemCost = 0;
        
        if (product) {
          // المستوى الأول: استخدام سعر التكلفة المحدد
          const baseCost = product.costPrice || 0;
          
          // المستوى الثاني: البحث في المخزون الحالي
          const currentInventory = filteredInventory.find((inv) => String(inv.productId) === String(productId));
          if (currentInventory && currentInventory.cost) {
            // استخدام متوسط تكلفة المخزون الحالي
            const avgCost = parseFloat(currentInventory.cost) || 0;
            if (avgCost > 0) {
              itemCost = avgCost;
            } else {
              itemCost = baseCost;
            }
          } else {
            itemCost = baseCost;
          }
          
          // المستوى الثالث: البحث في المشتريات السابقة
          if (itemCost === 0) {
            const lastPurchase = filteredPurchases
              .filter(p => 
                p.items?.some(i => String(i.productId) === String(productId))
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
              
            if (lastPurchase) {
              const purchaseItem = lastPurchase.items?.find(i => String(i.productId) === String(productId));
              if (purchaseItem && purchaseItem.price) {
                itemCost = parseFloat(purchaseItem.price) || 0;
              }
            }
          }
        }
        
        totalCost += itemCost * quantity;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    // حسابات إضافية متقدمة
    const profitMargin = grossProfitMargin;
    const efficiency = costItems > 0 ? (grossProfit / costItems) : 0;
    
    // صافي الربح (يمكن إضافة المصاريف التشغيلية هنا لاحقاً)
    const netProfit = grossProfit;

    setReportData({
      totalRevenue,
      totalCost,
      grossProfit,
      grossProfitMargin,
      netProfit,
      revenueTransactions,
      costItems,
      profitMargin,
      efficiency,
    });
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['البيان', 'المبلغ'];
    const csvData = [
      ['إجمالي المبيعات', reportData.totalRevenue.toFixed(2)],
      ['تكلفة البضاعة', reportData.totalCost.toFixed(2)],
      ['مجمل الربح', reportData.grossProfit.toFixed(2)],
      ['هامش الربح الإجمالي', reportData.grossProfitMargin.toFixed(2) + '%'],
      ['صافي الربح', reportData.netProfit.toFixed(2)],
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
    link.download = `profit_loss_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الأرباح والخسائر"
        subtitle="تحليل الأرباح والخسائر خلال فترة زمنية محددة"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold">{(reportData.totalRevenue || 0).toFixed(0)} ج.م</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">تكلفة البضاعة</p>
              <p className="text-2xl font-bold">{(reportData.totalCost || 0).toFixed(0)} ج.م</p>
            </div>
            <div className="text-orange-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${(reportData.grossProfit || 0) >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-rose-600'} text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-opacity-90 text-sm font-medium">مجمل الربح</p>
              <p className="text-2xl font-bold">{(reportData.grossProfit || 0).toFixed(0)} ج.م</p>
            </div>
            <div className={`${(reportData.grossProfit || 0) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">هامش الربح</p>
              <p className="text-2xl font-bold">{(reportData.profitMargin || 0).toFixed(1)}%</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">عدد المعاملات</p>
              <p className="text-2xl font-bold">{reportData.revenueTransactions || 0}</p>
            </div>
            <div className="text-amber-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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



      <Card className="mt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <svg className="w-5 h-5 ml-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          قائمة الدخل المفصلة
        </h3>
        <div className="space-y-4">
          {/* الإيرادات */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full ml-3"></div>
              <h4 className="font-bold text-blue-800">الإيرادات</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>إجمالي المبيعات:</span>
                <span className="font-semibold">{reportData.totalRevenue?.toFixed(2) || '0.00'} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>عدد المعاملات:</span>
                <span className="font-semibold">{reportData.revenueTransactions || 0}</span>
              </div>
            </div>
          </div>

          {/* تكلفة البضاعة المباعة */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full ml-3"></div>
              <h4 className="font-bold text-orange-800">تكلفة البضاعة المباعة</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>تكلفة البضاعة:</span>
                <span className="font-semibold">({reportData.totalCost?.toFixed(2) || '0.00'}) ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>عدد الأصناف:</span>
                <span className="font-semibold">{reportData.costItems || 0}</span>
              </div>
            </div>
          </div>

          {/* مجمل الربح */}
          <div className={`bg-gradient-to-r p-4 rounded-lg border-2 ${
            (reportData.grossProfit || 0) >= 0 
              ? 'from-emerald-50 to-green-100 border-emerald-200'
              : 'from-red-50 to-rose-100 border-red-200'
          }`}>
            <div className="flex items-center mb-3">
              <div className={`w-3 h-3 rounded-full ml-3 ${
                (reportData.grossProfit || 0) >= 0 ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
              <h4 className={`font-bold ${
                (reportData.grossProfit || 0) >= 0 ? 'text-emerald-800' : 'text-red-800'
              }`}>مجمل الربح (الخسارة)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex justify-between">
                <span>المبلغ:</span>
                <span className={`font-bold text-lg ${
                  (reportData.grossProfit || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {reportData.grossProfit >= 0 ? '' : '('}{Math.abs(reportData.grossProfit || 0).toFixed(2)}{reportData.grossProfit >= 0 ? '' : ')'} ج.م
                </span>
              </div>
              <div className="flex justify-between">
                <span>هامش الربح:</span>
                <span className={`font-semibold ${
                  (reportData.grossProfit || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {(reportData.profitMargin || 0).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>كفاءة الربح:</span>
                <span className={`font-semibold ${
                  (reportData.efficiency || 0) >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {(reportData.efficiency || 0).toFixed(2)} ج.م/قطعة
                </span>
              </div>
            </div>
          </div>

          {/* صافي الربح النهائي */}
          <div className={`p-4 rounded-lg border-2 ${
            (reportData.netProfit || 0) >= 0 
              ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300'
              : 'bg-gradient-to-r from-red-100 to-rose-100 border-red-300'
          }`}>
            <div className="flex items-center mb-3">
              <div className={`w-4 h-4 rounded-full ml-3 ${
                (reportData.netProfit || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <h3 className={`font-bold text-xl ${
                (reportData.netProfit || 0) >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                صافي الربح (الخسارة) النهائي
              </h3>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${
                (reportData.netProfit || 0) >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                {reportData.netProfit >= 0 ? '' : '('}{Math.abs(reportData.netProfit || 0).toFixed(2)}{reportData.netProfit >= 0 ? '' : ')'} ج.م
              </p>
              <p className={`text-sm mt-2 ${
                (reportData.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(reportData.netProfit || 0) >= 0 ? 'ربح إيجابي' : 'خسارة'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <svg className="w-5 h-5 ml-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          ملاحظات تقنية مهمة
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🔍 خوارزمية حساب التكلفة:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>مستوى أول: سعر التكلفة المحدد في بيانات المنتج</li>
                <li>مستوى ثاني: متوسط تكلفة المخزون الحالي</li>
                <li>مستوى ثالث: آخر سعر شراء من سجل المشتريات</li>
                <li>تأخذ في الاعتبار الخصومات والضرائب</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">📊 مقاييس الأداء:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>هامش الربح: نسبة الربح من إجمالي المبيعات</li>
                <li>كفاءة الربح: متوسط الربح لكل قطعة مباعة</li>
                <li>دقة الحسابات: استخدام أحدث البيانات المتاحة</li>
                <li>التحديث الفوري: تلقائي عند تغيير الفترة الزمنية</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 نصيحة:</strong> للحصول على نتائج أكثر دقة، تأكد من تحديث أسعار تكلفة المنتجات وملف المخزون بانتظام.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfitLossReport;