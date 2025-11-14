// ======================================
// Transfer Between Warehouses - تحويل بين المخازن
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaExchangeAlt, 
  FaWarehouse, 
  FaBox, 
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHistory,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

const Transfer = () => {
  const { warehouses, products, transfers, transferProduct } = useData();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState({
    productId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    quantity: '',
    subQuantity: '',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransfer, setLastTransfer] = useState(null);

  // الحصول على المنتجات المتوفرة في المخزن المصدر
  const availableProducts = () => {
    if (!formData.fromWarehouseId) return [];
    
    return products.filter(p => 
      p.warehouseId === parseInt(formData.fromWarehouseId)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // عند اختيار منتج، نحفظ بياناته
    if (name === 'productId' && value) {
      const product = availableProducts().find(p => p.id === parseInt(value));
      setSelectedProduct(product);
    }

    // إعادة تعيين المنتج المختار عند تغيير المخزن المصدر
    if (name === 'fromWarehouseId') {
      setFormData(prev => ({
        ...prev,
        productId: '',
        quantity: '',
        subQuantity: ''
      }));
      setSelectedProduct(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من عدم التحويل لنفس المخزن
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      showError('لا يمكن التحويل إلى نفس المخزن');
      return;
    }

    // التحقق من الكمية
    const quantity = parseInt(formData.quantity) || 0;
    const subQuantity = parseInt(formData.subQuantity) || 0;
    
    if (quantity <= 0 && subQuantity <= 0) {
      showError('يجب إدخال كمية أساسية أو فرعية أكبر من صفر');
      return;
    }

    // التحقق من الكميات المتاحة
    if (selectedProduct && quantity > (selectedProduct.mainQuantity || 0)) {
      showError(`الكمية الأساسية المتوفرة فقط ${selectedProduct.mainQuantity || 0}`);
      return;
    }

    if (selectedProduct && subQuantity > (selectedProduct.subQuantity || 0)) {
      showError(`الكمية الفرعية المتوفرة فقط ${selectedProduct.subQuantity || 0}`);
      return;
    }

    try {
      const transferData = {
        productId: parseInt(formData.productId),
        fromWarehouseId: parseInt(formData.fromWarehouseId),
        toWarehouseId: parseInt(formData.toWarehouseId),
        quantity: quantity,
        subQuantity: subQuantity,
        notes: formData.notes
      };

      const result = transferProduct(transferData);
      
      // حفظ بيانات التحويل لعرضها في Modal
      setLastTransfer({
        ...result,
        fromWarehouseName: warehouses.find(w => w.id === parseInt(formData.fromWarehouseId))?.name,
        toWarehouseName: warehouses.find(w => w.id === parseInt(formData.toWarehouseId))?.name
      });
      
      setShowSuccessModal(true);
      showSuccess('تم تحويل المنتج بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: '',
        subQuantity: '',
        notes: ''
      });
      setSelectedProduct(null);
    } catch (error) {
      showError(error.message || 'حدث خطأ في عملية التحويل');
    }
  };

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name
  }));

  const productOptions = availableProducts().map(p => ({
    value: p.id,
    label: `${p.name} - ${p.category} (متوفر: ${p.mainQuantity || 0}${p.subQuantity ? ` + ${p.subQuantity}` : ''})`
  }));

  // دالة لحساب الوقت المنقضي
  const getTimeAgo = (date) => {
    const now = new Date();
    const transferDate = new Date(date);
    const diffInMinutes = Math.floor((now - transferDate) / 60000);
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="space-y-4">

      {/* Modal تأكيد التحويل */}
      {showSuccessModal && lastTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes size={16} />
              </button>
              <div className="flex items-center justify-center mb-3">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <FaCheckCircle size={36} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-center">تم التحويل بنجاح!</h2>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* اسم المنتج */}
              <div className="bg-gradient-to-r from-orange-50 to-white p-3 rounded-lg border-r-4 border-orange-500">
                <div className="flex items-center gap-2">
                  <FaBox className="text-orange-500" size={18} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">المنتج</p>
                    <p className="text-base font-bold text-gray-800">{lastTransfer.productName}</p>
                  </div>
                </div>
              </div>

              {/* التحويل */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <FaWarehouse className="text-blue-500 mx-auto mb-1" size={18} />
                    <p className="text-xs text-gray-500">من المخزن</p>
                    <p className="font-bold text-gray-800 text-sm">{lastTransfer.fromWarehouseName}</p>
                  </div>
                  <FaArrowRight className="text-blue-500" size={18} />
                  <div className="text-center flex-1">
                    <FaWarehouse className="text-green-500 mx-auto mb-1" size={18} />
                    <p className="text-xs text-gray-500">إلى المخزن</p>
                    <p className="font-bold text-gray-800 text-sm">{lastTransfer.toWarehouseName}</p>
                  </div>
                </div>
              </div>

              {/* الكمية */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FaExchangeAlt className="text-green-500" size={16} />
                  <p className="text-xs text-gray-500">الكمية المحولة</p>
                </div>
                <p className="text-xl font-bold text-green-600">{lastTransfer.quantity}</p>
              </div>

              {/* ملاحظات */}
              {lastTransfer.notes && (
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <p className="text-xs text-gray-500">ملاحظات</p>
                  <p className="text-gray-800 text-sm">{lastTransfer.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 rounded-b-2xl">
              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="primary"
                size="sm"
                className="w-full"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج التحويل */}
      <Card icon={<FaExchangeAlt />} title="نموذج التحويل">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اختيار المخازن */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">من المخزن (المصدر)</label>
              <select
                name="fromWarehouseId"
                value={formData.fromWarehouseId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">اختر المخزن المصدر</option>
                {warehouseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.fromWarehouseId && (
                <p className="text-xs text-gray-500 mt-1">
                  <FaInfoCircle className="inline ml-1" />
                  المنتجات المتوفرة: {availableProducts().length}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">إلى المخزن (الوجهة)</label>
              <select
                name="toWarehouseId"
                value={formData.toWarehouseId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">اختر المخزن الوجهة</option>
                {warehouseOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* اختيار المنتج */}
          {formData.fromWarehouseId && (
            <div>
              <label className="text-sm font-medium mb-1 block">اختر المنتج</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">اختر المنتج</option>
                {productOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {availableProducts().length === 0 && (
                <div className="mt-1 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" size={16} />
                  <p className="text-xs text-yellow-700">لا توجد منتجات في هذا المخزن</p>
                </div>
              )}
            </div>
          )}

          {/* معلومات المنتج المختار */}
          {selectedProduct && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" size={16} />
                معلومات المنتج
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <p className="text-xs text-gray-500">الاسم</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الفئة</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الكمية الأساسية</p>
                  <p className="font-bold text-green-600 text-base">{selectedProduct.mainQuantity || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">الكمية الفرعية</p>
                  <p className="font-bold text-blue-600 text-base">{selectedProduct.subQuantity || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">السعر</p>
                  <p className="font-semibold text-gray-800 text-sm">{selectedProduct.mainPrice} ج.م</p>
                </div>
              </div>
            </div>
          )}

          {/* الكمية والملاحظات */}
          {formData.productId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">الكمية الأساسية المراد تحويلها</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="أدخل الكمية الأساسية"
                    min="0"
                    max={selectedProduct?.mainQuantity}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">الكمية الفرعية المراد تحويلها</label>
                  <input
                    type="number"
                    name="subQuantity"
                    value={formData.subQuantity}
                    onChange={handleChange}
                    placeholder="أدخل الكمية الفرعية"
                    min="0"
                    max={selectedProduct?.subQuantity}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* رسالة تحذيرية */}
              {!formData.quantity && !formData.subQuantity && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <FaInfoCircle className="text-blue-600" size={16} />
                  <p className="text-xs text-blue-700">يرجى إدخال الكمية الأساسية أو الفرعية أو كلاهما</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1 block">ملاحظات (اختياري)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="أدخل ملاحظات حول عملية التحويل..."
                />
              </div>
            </>
          )}

          {/* أزرار التحكم */}
          <div className="flex gap-3">
            <Button 
              type="submit" 
              variant="primary" 
              size="sm"
              icon={<FaExchangeAlt />}
              disabled={!formData.productId || !formData.fromWarehouseId || !formData.toWarehouseId || (!formData.quantity && !formData.subQuantity)}
            >
              تنفيذ التحويل
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              size="sm"
              onClick={() => {
                setFormData({
                  productId: '',
                  fromWarehouseId: '',
                  toWarehouseId: '',
                  quantity: '',
                  notes: ''
                });
                setSelectedProduct(null);
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </form>
      </Card>

      {/* سجل التحويلات الأخيرة */}
      <Card icon={<FaHistory />} title="سجل التحويلات الأخيرة">
        {transfers.length === 0 ? (
          <div className="text-center py-8">
            <FaHistory className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-base">لا توجد تحويلات بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">التاريخ</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">المنتج</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">من المخزن</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">إلى المخزن</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">الكمية</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {transfers.slice(0, 10).map((transfer) => (
                  <tr key={transfer.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">
                          {new Date(transfer.date).toLocaleDateString('ar-EG')}
                        </p>
                        <p className="text-xs text-gray-500">{getTimeAgo(transfer.date)}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FaBox className="text-orange-500" size={14} />
                        <span className="font-semibold text-gray-800 text-sm">{transfer.productName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700">
                        {warehouses.find(w => w.id === transfer.fromWarehouseId)?.name || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700">
                        {warehouses.find(w => w.id === transfer.toWarehouseId)?.name || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-bold text-blue-600 text-sm">{transfer.quantity}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-600">{transfer.notes || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transfer;
