// ======================================
// Manage Groups - إدارة المجموعات (نظام هرمي متعدد المستويات)
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import GroupExplorerWindow from '../../components/Common/GroupExplorerWindow';
import { FaLayerGroup, FaPlus, FaSearch } from 'react-icons/fa';

const ManageGroups = () => {
  const { groups, getRootGroups } = useData();
  const { showSuccess, showError, showConfirm } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showExplorerWindow, setShowExplorerWindow] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // فلترة المجموعات الرئيسية حسب البحث
  const filteredRootGroups = getRootGroups().filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تنسيق تاريخ الإنشاء
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG');
    } catch (error) {
      return 'غير محدد';
    }
  };

  // فتح نافذة إضافة مجموعة جديدة
  const handleAddNewGroup = () => {
    if (!hasPermission('add_category')) {
      showError('ليس لديك صلاحية إضافة المجموعات');
      return;
    }
    setEditingGroup(null);
    setShowExplorerWindow(true);
  };

  // فتح نافذة تعديل مجموعة موجودة
  const handleEditGroup = (group) => {
    if (!hasPermission('edit_category')) {
      showError('ليس لديك صلاحية تعديل المجموعات');
      return;
    }
    setEditingGroup(group);
    setShowExplorerWindow(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaLayerGroup className="text-blue-600" />
          إدارة المجموعات
        </h1>
        {!hasPermission('manage_categories') && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            <FaLayerGroup className="text-sm" />
            <span className="text-sm font-medium">عرض فقط - ليس لديك صلاحيات الإدارة</span>
          </div>
        )}
      </div>

      {/* شريط الأدوات العلوي */}
      {hasPermission('manage_categories') && (
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="البحث في المجموعات الرئيسية..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddNewGroup}
                variant="success"
                size="sm"
                icon={<FaPlus />}
              >
                إضافة مجموعة جديدة
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* جدول عرض المجموعات الرئيسية */}
      <Card icon={<FaLayerGroup />}>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            المجموعات الرئيسية المتاحة ({filteredRootGroups.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            انقر مزدوجاً على أي مجموعة لتعديلها، أو استخدم زر "إدارة الفرعية" لإضافة مجموعات فرعية
          </p>
        </div>

        {filteredRootGroups.length === 0 ? (
          <div className="text-center py-12">
            <FaLayerGroup className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm ? 'لا توجد مجموعات مطابقة للبحث' : 'لا توجد مجموعات بعد، قم بإضافة المجموعة الأولى!'}
            </p>
            {hasPermission('manage_categories') && !searchTerm && (
              <Button
                onClick={handleAddNewGroup}
                variant="success"
                icon={<FaPlus />}
                className="mt-3"
              >
                إضافة مجموعة جديدة
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">كود المجموعة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم المجموعة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">تاريخ الإنشاء</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">عدد المجموعات الفرعية</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredRootGroups.map((group) => {
                  const subGroups = groups.filter(g => g.parent_id === group.id);
                  
                  return (
                    <tr
                      key={group.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                      onDoubleClick={() => handleEditGroup(group)}
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {group.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{group.name}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(group.created_at || group.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {subGroups.length} مجموعة فرعية
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleEditGroup(group)}
                            variant="primary"
                            size="sm"
                            icon={<FaLayerGroup />}
                            title="إدارة المجموعات الفرعية"
                          >
                            إدارة الفرعية
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* نافذة إدارة المجموعات */}
      {showExplorerWindow && (
        <GroupExplorerWindow
          group={editingGroup}
          onClose={() => {
            setShowExplorerWindow(false);
            setEditingGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageGroups;