import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const ProductMovementReport = () => {
  const { products, salesInvoices, purchaseInvoices, warehouses } = useData();
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState([]);

  // دالة الحصول على اسم المخزن (من Inventory.jsx)
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : '-';
  };

  // دالة للحصول على المخزن من المنتج (طريقة صحيحة)
  const getProductWarehouseName = (productId) => {
    const product = products.find(p => parseInt(p.id) === parseInt(productId));
    return product ? getWarehouseName(product.warehouseId) : '-';
  };

  useEffect(() => {
    console.log('🔄 تحديث التقرير مع الفلاتر الجديدة...');
    console.log('فلتر الصنف:', selectedProduct);
    console.log('فلتر المخزن:', selectedWarehouse);
    console.log('من تاريخ:', startDate);
    console.log('إلى تاريخ:', endDate);
    generateReport();
  }, [salesInvoices, purchaseInvoices, products, warehouses, selectedProduct, selectedWarehouse, startDate, endDate]);

  const generateReport = () => {
    let data = [];

    // معالجة فواتير المبيعات (خروج)
    salesInvoices?.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (startDate && invoiceDate < new Date(startDate)) return;
      if (endDate && invoiceDate > new Date(endDate)) return;

      invoice.items?.forEach((item) => {
        // إصلاح فلترة الصنف - تحويل النوعين لمقارنة صحيحة
        if (selectedProduct !== 'all' && parseInt(item.productId) !== parseInt(selectedProduct)) return;
        
        // الحصول على المنتج ثم مخزنه
        const product = products.find((p) => parseInt(p.id) === parseInt(item.productId));
        if (!product) return; // إذا لم يتم العثور على المنتج
        
        // فلترة المخزن بناءً على مخزن المنتج
        const productWarehouseId = parseInt(product.warehouseId);
        if (selectedWarehouse !== 'all' && productWarehouseId !== parseInt(selectedWarehouse)) return;
        
        // استخدام اسم المخزن من المنتج
        const warehouseName = getProductWarehouseName(parseInt(item.productId));

        data.push({
          date: invoice.date,
          productName: product?.name || 'غير معروف',
          type: 'خروج',
          quantity: -item.quantity,
          warehouse: warehouseName,
          reference: `فاتورة مبيعات #${invoice.id}`,
          notes: invoice.notes || '-',
        });
      });
    });

    // معالجة فواتير المشتريات (دخول)
    purchaseInvoices?.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date);
      if (startDate && invoiceDate < new Date(startDate)) return;
      if (endDate && invoiceDate > new Date(endDate)) return;

      invoice.items?.forEach((item) => {
        // إصلاح فلترة الصنف - تحويل النوعين لمقارنة صحيحة
        if (selectedProduct !== 'all' && parseInt(item.productId) !== parseInt(selectedProduct)) return;
        
        // الحصول على المنتج ثم مخزنه
        const product = products.find((p) => parseInt(p.id) === parseInt(item.productId));
        if (!product) return; // إذا لم يتم العثور على المنتج
        
        // فلترة المخزن بناءً على مخزن المنتج
        const productWarehouseId = parseInt(product.warehouseId);
        if (selectedWarehouse !== 'all' && productWarehouseId !== parseInt(selectedWarehouse)) return;
        
        // استخدام اسم المخزن من المنتج
        const warehouseName = getProductWarehouseName(parseInt(item.productId));

        data.push({
          date: invoice.date,
          productName: product?.name || 'غير معروف',
          type: 'دخول',
          quantity: item.quantity,
          warehouse: warehouseName,
          reference: `فاتورة مشتريات #${invoice.id}`,
          notes: invoice.notes || '-',
        });
      });
    });

    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // تسجيل للتأكد من صحة البيانات
    if (data.length > 0) {
      console.log('عينة من البيانات المحملة:', data.slice(0, 3));
      console.log('عدد إجمالي السجلات:', data.length);
      console.log('فلتر الصنف المحدد:', selectedProduct);
      console.log('فلتر المخزن المحدد:', selectedWarehouse);
      console.log('عينة من أسماء المخازن:', data.slice(0, 3).map(d => ({ product: d.productName, warehouse: d.warehouse })));
    } else {
      console.log('⚠️ لا توجد بيانات تطابق الفلاتر');
      console.log('فلتر الصنف:', selectedProduct, 'فلتر المخزن:', selectedWarehouse);
      console.log('عدد المنتجات:', products.length, 'عدد فواتير المبيعات:', salesInvoices?.length || 0, 'عدد فواتير المشتريات:', purchaseInvoices?.length || 0);
    }
    
    setReportData(data);
  };

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ['التاريخ', 'الصنف', 'النوع', 'الكمية', 'المخزن', 'المرجع', 'ملاحظات'];
    const csvData = reportData.map((item) => [
      item.date,
      item.productName,
      item.type,
      item.quantity,
      item.warehouse,
      item.reference,
      item.notes,
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
    link.download = `product_movement_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير حركة الأصناف"
        subtitle="تتبع حركة دخول وخروج الأصناف خلال فترة محددة"
        icon={
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        }
        actions={[
          {
            label: 'طباعة',
            onClick: printReport,
            variant: 'secondary',
            size: 'sm'
          },
          {
            label: 'تصدير Excel',
            onClick: exportToExcel,
            variant: 'primary',
            size: 'sm'
          },
        ]}
      />

      <Card className="mt-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              الصنف
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأصناف</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              المخزن
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع المخازن</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1 min-w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2">
          <h3 className="text-white font-medium text-sm">تفاصيل حركة الأصناف</h3>
          <p className="text-blue-100 text-xs">إجمالي السجلات: {reportData.length}</p>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الصنف
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                النوع
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزن
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المرجع
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ملاحظات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                  {new Date(item.date).toLocaleDateString('ar-EG')}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                  {item.productName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {item.type === 'دخول' ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      دخول
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      خروج
                    </span>
                  )}
                </td>
                <td className={`px-3 py-2 whitespace-nowrap text-xs font-medium ${
                  item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(item.quantity)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {item.warehouse}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                  {item.reference}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 max-w-32 truncate">
                  {item.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
            <p className="mt-1 text-sm text-gray-500">لا توجد حركات للمنتجات تطابق المعايير المحددة</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductMovementReport;