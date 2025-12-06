// ======================================
// ManageGroups - صفحة إدارة المجموعات
// ======================================

import React, { useState } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';

const ManageGroups = () => {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'مجموعة العملاء المميزين',
      description: 'عملاء بقيمة شراء عالية',
      memberCount: 25,
      createdDate: '2025-01-15',
      color: '#3B82F6'
    },
    {
      id: 2,
      name: 'مجموعة الموردين الأساسيين',
      description: 'الموردين الذين نعمل معهم بشكل مستمر',
      memberCount: 8,
      createdDate: '2025-01-10',
      color: '#10B981'
    },
    {
      id: 3,
      name: 'منتجات المخزون المنخفض',
      description: 'منتجات تحتاج إعادة تموين',
      memberCount: 15,
      createdDate: '2025-01-08',
      color: '#F59E0B'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  // تصفية المجموعات بناءً على البحث
  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // إضافة مجموعة جديدة
  const handleAddGroup = () => {
    if (newGroup.name.trim()) {
      const group = {
        id: Date.now(),
        ...newGroup,
        memberCount: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setGroups([...groups, group]);
      setNewGroup({ name: '', description: '', color: '#3B82F6' });
      setShowAddModal(false);
    }
  };

  // حذف مجموعة
  const handleDeleteGroup = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      setGroups(groups.filter(group => group.id !== id));
    }
  };

  // ألوان جاهزة للمجموعات
  const colorOptions = [
    '#3B82F6', // أزرق
    '#10B981', // أخضر
    '#F59E0B', // برتقالي
    '#EF4444', // أحمر
    '#8B5CF6', // بنفسجي
    '#06B6D4', // سماوي
    '#F97316', // برتقالي فاتح
    '#84CC16'  // أخضر فاتح
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaUsers className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إدارة المجموعات</h1>
                  <p className="text-gray-600 text-sm">إنشاء وإدارة مجموعات العملاء والموردين والمنتجات</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <FaPlus />
                إضافة مجموعة جديدة
              </button>
            </div>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المجموعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* قائمة المجموعات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {/* TODO: إضافة وظائف التعديل */}}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{group.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaUsers className="text-xs" />
                    <span>{group.memberCount} عضو</span>
                  </div>
                  <span className="text-gray-400">{group.createdDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* رسالة عند عدم وجود نتائج */}
        {filteredGroups.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FaUsers className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مجموعات</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'لم يتم العثور على مجموعات مطابقة للبحث' : 'ابدأ بإنشاء مجموعتك الأولى'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                إنشاء مجموعة جديدة
              </button>
            )}
          </div>
        )}
      </div>

      {/* نافذة إضافة مجموعة جديدة */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">إضافة مجموعة جديدة</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اسم المجموعة</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم المجموعة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="وصف مختصر للمجموعة"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewGroup({ ...newGroup, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          newGroup.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewGroup({ name: '', description: '', color: '#3B82F6' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddGroup}
                  disabled={!newGroup.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                >
                  إضافة المجموعة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroups;