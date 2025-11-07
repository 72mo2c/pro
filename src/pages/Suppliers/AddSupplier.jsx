// ======================================
// Add Supplier - إضافة مورد جديد
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import Card from '../../components/Common/Card';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaTruck, FaSave, FaCheckCircle, FaPlus, FaList, FaTimes } from 'react-icons/fa';

const AddSupplier = () => {
  const { addSupplier } = useData();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastAddedSupplier, setLastAddedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone1: '',
      phone2: '',
      email: '',
      notes: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const supplierData = {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const newSupplier = addSupplier(supplierData);
      setLastAddedSupplier(newSupplier);
      setShowSuccessModal(true);
      resetForm();
    } catch (error) {
      showError('حدث خطأ في إضافة المورد');
    }
  };

  const handleAddAnother = () => {
    setShowSuccessModal(false);
    setLastAddedSupplier(null);
  };

  const handleGoToList = () => {
    navigate('/suppliers/manage');
  };

  return (
    <div className="max-w-lg mx-auto p-3">
      <Card className="shadow-sm border-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">اسم المورد *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="أدخل اسم المورد"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">العنوان *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="أدخل العنوان"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف 1 *</label>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                onChange={handleChange}
                placeholder="+20 XXX XXX XXXX"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف 2</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                placeholder="+20 XXX XXX XXXX"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="ملاحظات إضافية..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <FaSave /> حفظ
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              إعادة تعيين
            </button>
          </div>
        </form>
      </Card>

      {/* نافذة النجاح المبسطة */}
      {showSuccessModal && lastAddedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-3">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* رأس مبسط */}
            <div className="flex items-center justify-between p-3 border-b bg-green-50">
              <h2 className="text-sm font-semibold text-green-800">تم بنجاح</h2>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setLastAddedSupplier(null);
                }}
                className="text-green-400 hover:text-green-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* محتوى مبسط */}
            <div className="p-3 text-center">
              <FaCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700 mb-2">
                تم إضافة المورد <span className="font-bold">"{lastAddedSupplier.name}"</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleAddAnother}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
                >
                  <FaPlus />
                  إضافة آخر
                </button>
                <button
                  onClick={handleGoToList}
                  className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1"
                >
                  <FaList />
                  عرض القائمة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSupplier;
