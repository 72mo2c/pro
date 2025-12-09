// ======================================
// إدارة الوحدات - إضافة وتعديل الوحدات الأساسية والفرعية
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useNavigate } from 'react-router-dom';
import { 
  FaCubes, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaSave, 
  FaArrowLeft,
  FaBoxes,
  FaBox
} from 'react-icons/fa';

const UnitsManagement = () => {
  const navigate = useNavigate();
  const { 
    units,
    addUnit,
    updateUnit,
    deleteUnit
  } = useData();
  const { showSuccess, showError } = useNotification();

  // حالات الواجهة
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newUnitData, setNewUnitData] = useState({
    name: '',
    type: 'main', // 'main' أو 'sub'
    description: ''
  });

  // تجميع الوحدات حسب النوع
  const mainUnits = units.filter(unit => unit.type === 'main');
  const subUnits = units.filter(unit => unit.type === 'sub');

  // فتح نافذة إضافة وحدة
  const openAddModal = (type = 'main') => {
    setNewUnitData({
      name: '',
      type: type,
      description: ''
    });
    setShowAddModal(true);
  };

  // فتح نافذة تعديل وحدة
  const openEditModal = (unit) => {
    setEditingUnit(unit);
    setNewUnitData({
      name: unit.name,
      type: unit.type,
      description: unit.description || ''
    });
    setShowEditModal(true);
  };

  // إضافة وحدة جديدة
  const handleAddUnit = () => {
    if (!newUnitData.name.trim()) {
      showError('اسم الوحدة مطلوب');
      return;
    }

    // التحقق من عدم تكرار الاسم
    const existingUnit = units.find(unit => 
      unit.name.toLowerCase() === newUnitData.name.toLowerCase() && 
      unit.type === newUnitData.type
    );

    if (existingUnit) {
      showError('اسم الوحدة موجود مسبقاً');
      return;
    }

    try {
      addUnit({
        name: newUnitData.name.trim(),
        type: newUnitData.type,
        description: newUnitData.description.trim(),
        createdAt: new Date().toISOString()
      });

      showSuccess('تم إضافة الوحدة بنجاح');
      setShowAddModal(false);
    } catch (error) {
      showError('حدث خطأ في إضافة الوحدة');
    }
  };

  // تعديل وحدة
  const handleEditUnit = () => {
    if (!newUnitData.name.trim()) {
      showError('اسم الوحدة مطلوب');
      return;
    }

    // التحقق من عدم تكرار الاسم (مع تجاهل الوحدة الحالية)
    const existingUnit = units.find(unit => 
      unit.name.toLowerCase() === newUnitData.name.toLowerCase() && 
      unit.type === newUnitData.type &&
      unit.id !== editingUnit.id
    );

    if (existingUnit) {
      showError('اسم الوحدة موجود مسبقاً');
      return;
    }

    try {
      updateUnit(editingUnit.id, {
        name: newUnitData.name.trim(),
        type: newUnitData.type,
        description: newUnitData.description.trim()
      });

      showSuccess('تم تحديث الوحدة بنجاح');
      setShowEditModal(false);
      setEditingUnit(null);
    } catch (error) {
      showError('حدث خطأ في تحديث الوحدة');
    }
  };

  // حذف وحدة
  const handleDeleteUnit = (unit) => {
    if (window.confirm(`هل تريد حذف الوحدة "${unit.name}"؟`)) {
      try {
        deleteUnit(unit.id);
        showSuccess('تم حذف الوحدة بنجاح');
      } catch (error) {
        showError('حدث خطأ في حذف الوحدة');
      }
    }
  };

  // إغلاق النوافذ
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingUnit(null);
    setNewUnitData({
      name: '',
      type: 'main',
      description: ''
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/warehouses/manage-products')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaCubes className="text-blue-600" />
                  إدارة الوحدات
                </h2>
                <p className="text-sm text-gray-600 mt-1">إدارة الوحدات الأساسية والفرعية</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openAddModal('main')}
                className="bg-teal-300 hover:bg-teal-400 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <FaPlus /> وحدة 
              </button>
              
            </div>
          </div>
        </div>

        {/* محتوى الصفحة */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الوحدات الأساسية */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <FaBoxes className="text-blue-600" />
                  الوحدات الأساسية
                </h3>
                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {mainUnits.length} وحدة
                </span>
              </div>

              {mainUnits.length === 0 ? (
                <div className="text-center py-8 text-blue-600">
                  <FaBoxes size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">لا توجد وحدات أساسية</p>
                  <button
                    onClick={() => openAddModal('main')}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    إضافة وحدة أساسية جديدة
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mainUnits.map(unit => (
                    <div key={unit.id} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{unit.name}</h4>
                          {unit.description && (
                            <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(unit)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الوحدات الفرعية */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                  <FaBox className="text-green-600" />
                  الوحدات الفرعية
                </h3>
                <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {subUnits.length} وحدة
                </span>
              </div>

              {subUnits.length === 0 ? (
                <div className="text-center py-8 text-green-600">
                  <FaBox size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">لا توجد وحدات فرعية</p>
                  <button
                    onClick={() => openAddModal('sub')}
                    className="mt-2 text-green-600 hover:text-green-800 font-semibold"
                  >
                    إضافة وحدة فرعية جديدة
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subUnits.map(unit => (
                    <div key={unit.id} className="bg-white rounded-lg p-4 shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{unit.name}</h4>
                          {unit.description && (
                            <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(unit)}
                            className="text-green-600 hover:text-green-800 transition-colors p-2"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal إضافة وحدة */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={closeModals}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes size={16} />
              </button>
              <h3 className="text-lg font-semibold text-center">إضافة وحدة جديدة</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوحدة</label>
                <select
                  value={newUnitData.type}
                  onChange={(e) => setNewUnitData({...newUnitData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="main">وحدة أساسية</option>
                  <option value="sub">وحدة فرعية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الوحدة</label>
                <input
                  type="text"
                  value={newUnitData.name}
                  onChange={(e) => setNewUnitData({...newUnitData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم الوحدة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
                <textarea
                  value={newUnitData.description}
                  onChange={(e) => setNewUnitData({...newUnitData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="وصف الوحدة"
                  rows="3"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddUnit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <FaSave /> إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal تعديل وحدة */}
      {showEditModal && editingUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-2xl text-white relative">
              <button
                onClick={closeModals}
                className="absolute top-3 left-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all"
              >
                <FaTimes size={16} />
              </button>
              <h3 className="text-lg font-semibold text-center">تعديل الوحدة</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوحدة</label>
                <select
                  value={newUnitData.type}
                  onChange={(e) => setNewUnitData({...newUnitData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="main">وحدة أساسية</option>
                  <option value="sub">وحدة فرعية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الوحدة</label>
                <input
                  type="text"
                  value={newUnitData.name}
                  onChange={(e) => setNewUnitData({...newUnitData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="أدخل اسم الوحدة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (اختياري)</label>
                <textarea
                  value={newUnitData.description}
                  onChange={(e) => setNewUnitData({...newUnitData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="وصف الوحدة"
                  rows="3"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditUnit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <FaSave /> حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitsManagement;