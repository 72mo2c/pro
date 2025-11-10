// ======================================
// Products Simple - صفحة المنتجات المبسطة
// للعرض والتجربة فقط
// ======================================

import React, { useState, useEffect } from 'react';
import { useFinalData } from '../context/FinalDataContext';
import { 
  FaBox, 
  FaSearch, 
  FaFilter, 
  FaExclamationTriangle,
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const ProductsSimple = () => {
  const { 
    products, 
    categories, 
    searchProducts, 
    getProductsByCategory,
    getLowStockProducts 
  } = useFinalData();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // فلترة المنتجات
  useEffect(() => {
    let filtered = products;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = searchProducts(searchTerm);
    }

    // فلترة حسب الفئة
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === parseInt(selectedCategory));
    }

    // فلترة المخزون المنخفض
    if (showLowStock) {
      const lowStockIds = getLowStockProducts().map(p => p.id);
      filtered = filtered.filter(p => lowStockIds.includes(p.id));
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, showLowStock, searchProducts, getLowStockProducts]);

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const getStockStatus = (product) => {
    const currentStock = product.mainQuantity || 0;
    const minStock = product.minStockLevel || 0;
    
    if (currentStock <= 0) {
      return { status: 'out', text: 'نفد', color: 'text-red-600 bg-red-100' };
    } else if (currentStock <= minStock) {
      return { status: 'low', text: 'مخزون منخفض', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { status: 'normal', text: 'مخزون طبيعي', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
              <FaBox className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
              <p className="text-gray-600">عرض وتصفح المنتجات (للعرض والتجربة فقط)</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            إجمالي المنتجات: {products.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* البحث */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البحث عن منتج
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو الكود أو الباركود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* فلترة الفئة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الفئة
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* فلترة المخزون المنخفض */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة المخزون
            </label>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                showLowStock 
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaFilter className="inline ml-2" />
              {showLowStock ? 'عرض الكل' : 'المخزون المنخفض فقط'}
            </button>
          </div>

          {/* معلومات النتائج */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              <div>النتائج: {filteredProducts.length} منتج</div>
              {showLowStock && (
                <div className="text-yellow-600 font-medium">
                  {getLowStockProducts().length} منتج بمخزون منخفض
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المنتج
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الفئة
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الكمية
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  حالة المخزون
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                            <FaBox className="text-blue-600" />
                          </div>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            الكود: {product.code} | الباركود: {product.barcode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {product.mainQuantity} {product.mainUnit}
                        </div>
                        {product.subQuantity > 0 && (
                          <div className="text-gray-500 text-xs">
                            + {product.subQuantity} {product.subUnit}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {product.mainPrice?.toFixed(2)} ر.س/{product.mainUnit}
                        </div>
                        {product.subPrice > 0 && (
                          <div className="text-gray-500 text-xs">
                            {product.subPrice?.toFixed(2)} ر.س/{product.subUnit}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1">
                          <FaEye className="text-sm" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1">
                          <FaEdit className="text-sm" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد منتجات</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory || showLowStock
                ? 'لم يتم العثور على منتجات تطابق المعايير المحددة'
                : 'لا توجد منتجات في النظام'
              }
            </p>
          </div>
        )}
      </div>

      {/* Note for demo */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <FaExclamationTriangle className="text-amber-500" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">ملاحظة هامة</h3>
            <p className="text-sm text-amber-700 mt-1">
              هذه الصفحة للعرض والتجربة فقط. جميع العمليات (إضافة، تعديل، حذف) هي لمحاكاة الواجهة ولا تعمل فعلياً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsSimple;