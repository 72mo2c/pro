// ======================================
// Manage Suppliers - إدارة الموردين
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import { FaList, FaExclamationTriangle, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const ManageSuppliers = () => {
  const { suppliers, updateSupplier, deleteSupplier } = useData();
  const { showSuccess, showError } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // فحص الصلاحيات
  const canEditSupplier = hasPermission('edit_supplier');
  const canDeleteSupplier = hasPermission('delete_supplier');
  const canManageSuppliers = hasPermission('manage_suppliers');
  
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone1: '',
    phone2: '',
    email: '',
    notes: ''
  });

  const handleEdit = (supplier) => {
    if (!canEditSupplier) {
      showError('ليس لديك صلاحية لتعديل بيانات الموردين');
      return;
    }
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      address: supplier.address || '',
      phone1: supplier.phone1 || '',
      phone2: supplier.phone2 || '',
      email: supplier.email || '',
      notes: supplier.notes || ''
    });
    setEditModal(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!canEditSupplier) {
      showError('ليس لديك صلاحية لتعديل بيانات الموردين');
      return;
    }
    
    try {
      updateSupplier(selectedSupplier.id, formData);
      showSuccess('تم تحديث بيانات المورد بنجاح');
      setEditModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      showError('حدث خطأ في تحديث المورد');
    }
  };

  const handleDeleteClick = (supplier) => {
    if (!canDeleteSupplier) {
      showError('ليس لديك صلاحية لحذف الموردين');
      return;
    }
    setSupplierToDelete(supplier);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!canDeleteSupplier) {
      showError('ليس لديك صلاحية لحذف الموردين');
      setDeleteModal(false);
      return;
    }
    
    try {
      deleteSupplier(supplierToDelete.id);
      showSuccess(`تم حذف المورد "${supplierToDelete.name}" بنجاح`);
      setDeleteModal(false);
      setSupplierToDelete(null);
    } catch (error) {
      showError('حدث خطأ في حذف المورد');
      setDeleteModal(false);
    }
  };

  // فحص صلاحية الوصول
  if (!canManageSuppliers) {
    return (
      <div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
          <div>
            <h3 className="text-red-800 font-bold text-lg">وصول غير مصرح</h3>
            <p className="text-red-700">ليس لديك صلاحية لإدارة الموردين</p>
            <p className="text-red-600 text-sm mt-1">يرجى التواصل مع المدير للحصول على الصلاحية المطلوبة</p>
          </div>
        </div>
      </div>
    );
  }

  const columns = [
    { header: 'الاسم', accessor: 'name' },
    { header: 'العنوان', accessor: 'address' },
    { header: 'الهاتف 1', accessor: 'phone1' },
    { header: 'الهاتف 2', accessor: 'phone2' },
    { header: 'البريد', accessor: 'email' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-3">
      <Card className="shadow-sm border-0">
        <Table
          columns={columns}
          data={suppliers}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </Card>

      {/* نافذة التعديل المبسطة */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-3">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* رأس مبسط */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-800">تعديل المورد</h2>
              <button
                onClick={() => setEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* محتوى مبسط */}
            <div className="p-3">
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الاسم *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">العنوان</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الهاتف 1</label>
                  <input
                    type="tel"
                    name="phone1"
                    value={formData.phone1}
                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الهاتف 2</label>
                  <input
                    type="tel"
                    name="phone2"
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">البريد</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* أزرار مبسطة */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="flex-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف المبسطة */}
      {deleteModal && supplierToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998] p-3">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* رأس مبسط */}
            <div className="flex items-center justify-between p-3 border-b bg-red-50">
              <h2 className="text-sm font-semibold text-red-800">تأكيد الحذف</h2>
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setSupplierToDelete(null);
                }}
                className="text-red-400 hover:text-red-600"
              >
                <FaTimes />
              </button>
            </div>

            {/* محتوى مبسط */}
            <div className="p-3">
              <div className="text-center mb-3">
                <FaExclamationTriangle className="text-2xl text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-700">
                  حذف المورد: <span className="font-bold">"{supplierToDelete.name}"</span>
                </p>
                <p className="text-xs text-red-600 mt-1">لا يمكن التراجع</p>
              </div>

              {/* أزرار مبسطة */}
              <div className="flex gap-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  حذف
                </button>
                <button
                  onClick={() => {
                    setDeleteModal(false);
                    setSupplierToDelete(null);
                  }}
                  className="flex-1 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSuppliers;
