import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const LowStockReport = () => {
  const { products, warehouses } = useData();
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    generateReport();
  }, [products, selectedWarehouse]);

  const generateReport = () => {
    let data = [];

    products.forEach((product) => {
      // قراءة البيانات الصحيحة من النظام الجديد
      const mainQuantity = product.mainQuantity || 0;
      const subQuantity = product.subQuantity || 0;
      const unitsInMain = product.unitsInMain || 0;
      const minStock = product.minStock || 0;
      
      // حساب إجمالي الكمية بالوحدات الفرعية
      const totalSubQuantity = mainQuantity * unitsInMain + subQuantity;

      if (selectedWarehouse === 'all') {
        // فحص المخزون الإجمالي
        if (totalSubQuantity <= minStock) {
          data.push({
            ...product,
            currentStock: totalSubQuantity,
            warehouse: 'المخزن الرئيسي',
            deficit: minStock - totalSubQuantity,
            mainQuantity: mainQuantity,
            subQuantity: subQuantity,
            unitsInMain: unitsInMain,
          });
        }
      } else {
        // مخزن محدد (مع دعم مخازن متعددة في المستقبل)
        const warehouse = warehouses.find((w) => w.id === selectedWarehouse);
        if (totalSubQuantity <= minStock) {
          data.push({
            ...product,
            currentStock: totalSubQuantity,
            warehouse: warehouse?.name || 'مخزن غير محدد',
            deficit: minStock - totalSubQuantity,
            mainQuantity: mainQuantity,
            subQuantity: subQuantity,
            unitsInMain: unitsInMain,
          });
        }
      }
    });

    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['الباركود', 'اسم الصنف', 'المخزن', 'الكمية الأساسية', 'الكمية الفرعية', 'إجمالي الكمية', 'حد الطلب', 'النقص'];
    const csvData = reportData.map((item) => [
      item.barcode || '-',
      item.name,
      item.warehouse,
      item.mainQuantity || 0,
      item.subQuantity || 0,
      item.currentStock || 0,
      item.minStock || 0,
      item.deficit,
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
    link.download = `low_stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الأصناف الأقل من حد الطلب"
        subtitle="عرض الأصناف التي وصلت لحد الطلب أو أقل"
        icon={
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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

      {/* فلتر المخزن المدمج */}
      <Card className="mt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <label className="text-xs font-medium text-gray-700">المخزن:</label>
          </div>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="flex-1 max-w-xs px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">جميع المخازن</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
              {reportData.length} صنف
            </span>
          </div>
        </div>
      </Card>

      {/* جدول المخزون المنخفض المدمج */}
      <Card className="mt-4 overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <tr>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  الباركود
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  اسم الصنف
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  المخزن
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  الكمية الموجودة
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  حد الطلب
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  النقص
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((item, idx) => (
                <tr key={idx} className="hover:bg-orange-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">
                    {item.barcode || '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 text-sm">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {item.warehouse}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-blue-600">
                        {item.currentStock || 0}
                      </span>
                      {item.mainQuantity > 0 || item.subQuantity > 0 ? (
                        <span className="text-xs text-gray-500">
                          {item.mainQuantity || 0} أساسي + {item.subQuantity || 0} فرعي
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    {item.minStock || 0}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {item.deficit}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {(item.currentStock || 0) === 0 ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white flex items-center gap-1 w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        نفدت الكمية
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 flex items-center gap-1 w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        منخفض
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {reportData.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-lg">ممتاز! لا توجد أصناف أقل من حد الطلب</p>
            <p className="text-gray-500 text-sm mt-2">جميع المنتجات متوفرة بكمية كافية</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LowStockReport;