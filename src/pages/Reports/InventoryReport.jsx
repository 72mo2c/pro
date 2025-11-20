import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';

const InventoryReport = () => {
  const { products, warehouses } = useData();
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalQuantity: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    generateReport();
  }, [products, selectedWarehouse, selectedCategory, searchTerm]);

  // دالة الحصول على سعر الشراء (كما في واجهة الجرد)
  const getPurchasePrice = (product) => {
    // النظام الجديد: الشرائح السعرية - سعر الشراء
    if (product.purchasePrices?.basicPrice) {
      return product.purchasePrices.basicPrice;
    }
    // النظام القديم: السعر الأساسي
    return product.mainPrice || 
           product.purchasePrice || 
           product.price || 
           product.cost || 
           product.unitPrice || 
           product.priceUnit || 
           product.purchase_price || 
           0;
  };

  // دالة الحصول على اسم المخزن من معرف المخزن
  const getWarehouseName = (warehouseId) => {
    const id = typeof warehouseId === 'string' ? parseInt(warehouseId) : warehouseId;
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse ? warehouse.name : 'مخزن غير محدد';
  };

  const generateReport = () => {
    let data = [];

    products.forEach((product) => {
      // قراءة البيانات الصحيحة من النظام الجديد
      const mainQuantity = product.mainQuantity || 0;
      const subQuantity = product.subQuantity || 0;
      const unitsInMain = product.unitsInMain || 1;
      
      // حساب إجمالي الكمية بالوحدات الفرعية
      const totalSubQuantity = mainQuantity * unitsInMain + subQuantity;
      
      // جلب سعر الشراء باستخدام نفس المنطق من واجهة الجرد
      const purchasePrice = getPurchasePrice(product);
      
      // جلب اسم المخزن من المنتج نفسه
      const warehouseName = getWarehouseName(product.warehouseId);
      
      // فلترة حسب المخزن المحدد
      if (selectedWarehouse !== 'all') {
        const productWarehouseId = parseInt(product.warehouseId);
        const selectedWarehouseId = parseInt(selectedWarehouse);
        if (productWarehouseId !== selectedWarehouseId) {
          return; // تخطي هذا المنتج
        }
      }

      // إضافة المنتج للبيانات
      data.push({
        ...product,
        currentStock: totalSubQuantity,
        warehouse: warehouseName,
        value: totalSubQuantity * purchasePrice,
        purchasePrice: purchasePrice, // تأكيد السعر
        mainQuantity: mainQuantity,
        subQuantity: subQuantity,
        unitsInMain: unitsInMain,
      });
    });

    // فلترة حسب الفئة
    if (selectedCategory !== 'all') {
      data = data.filter((item) => item.category === selectedCategory);
    }

    // فلترة حسب البحث
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barcode?.includes(searchTerm)
      );
    }

    // حساب الإحصائيات
    const totalProducts = data.length;
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalQuantity = data.reduce((sum, item) => sum + (item.currentStock || 0), 0);
    const lowStockItems = data.filter(
      (item) => (item.currentStock || 0) <= (item.minStock || 0)
    ).length;

    setReportData(data);
    setStats({ totalProducts, totalValue, totalQuantity, lowStockItems });
  };

  const categories = [...new Set(products.map((p) => p.category))].filter(Boolean);

  const printReport = () => {
    window.print();
  };

  const exportToExcel = () => {
    // تحويل البيانات إلى CSV
    const headers = ['الباركود', 'اسم الصنف', 'الفئة', 'المخزن', 'الكمية الأساسية', 'الكمية الفرعية', 'إجمالي الكمية', 'سعر الشراء', 'القيمة'];
    const csvData = reportData.map((item) => [
      item.barcode || '-',
      item.name,
      item.category || '-',
      item.warehouse,
      item.mainQuantity || 0,
      item.subQuantity || 0,
      item.currentStock || 0,
      (item.purchasePrice || 0).toFixed(2),
      (item.value || 0).toFixed(2),
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
    link.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <PageHeader
        title="تقرير الجرد"
        subtitle="عرض جميع الأصناف والكميات المتوفرة في المخازن"
        icon={
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
      <div className="grid grid-cols-4 md:grid-cols-4 gap-2 mt-4">
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg border border-blue-300 hover:shadow-xl transition-all duration-300 hover:border-blue-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">إجمالي الأصناف</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalProducts}</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg border border-emerald-300 hover:shadow-xl transition-all duration-300 hover:border-emerald-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">إجمالي الكميات</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalQuantity}</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg border border-purple-300 hover:shadow-xl transition-all duration-300 hover:border-purple-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">القيمة الإجمالية</div>
              <div className="text-2xl font-bold tracking-tight">{stats.totalValue.toFixed(0)} ج.م</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg border border-rose-300 hover:shadow-xl transition-all duration-300 hover:border-rose-400">
          <div className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-90 mb-1">أصناف أقل من الحد</div>
              <div className="text-2xl font-bold tracking-tight">{stats.lowStockItems}</div>
            </div>
            <div className="bg-white bg-opacity-25 rounded-xl p-2 backdrop-blur-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              الفئة
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الفئات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              البحث
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو الباركود..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>



      {/* جدول التقرير */}
      <Card className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الباركود
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم الصنف
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الفئة
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزن
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية الأساسية
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكمية الفرعية
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                إجمالي الكمية
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر الشراء
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                القيمة الإجمالية
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 text-xs">
                <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-mono">
                  {item.barcode || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                  {item.category || '-'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                  {item.warehouse}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                  {item.mainQuantity || 0} {item.unitsInMain > 1 ? `(${item.unitsInMain} ×)` : ''}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                  {item.subQuantity || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-blue-600">
                  {item.currentStock || 0}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                  <span className={`font-semibold ${!item.purchasePrice || item.purchasePrice === 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {(item.purchasePrice || 0).toFixed(2)} ج.م
                    {!item.purchasePrice || item.purchasePrice === 0 ? 
                      <span className="block text-xs text-red-500 mt-1">⚠️ غير محدد</span> : null}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">
                  {(item.value || 0).toFixed(2)} ج.م
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {(item.currentStock || 0) <= (item.minStock || 0) ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      أقل من الحد
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      متوفر
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reportData.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            لا توجد بيانات لعرضها
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryReport;