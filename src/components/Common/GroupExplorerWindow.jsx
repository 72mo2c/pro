// ======================================
// Group Explorer Window - نافذة استكشاف وإدارة المجموعات
// نافذة ذكية تتغير حسب المستوى (مثل Windows Explorer)
// ======================================

import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaTimes, 
  FaPlus, 
  FaSave, 
  FaArrowLeft, 
  FaLayerGroup, 
  FaTrash,
  FaEdit,
  FaFolder,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const GroupExplorerWindow = ({ group, onClose }) => {
  const { 
    groups, 
    addGroup, 
    updateGroup, 
    deleteGroup, 
    getRootGroups, 
    getChildGroups, 
    generateGroupCode,
    getGroupBreadcrumbPath
  } = useData();
  const { showSuccess, showError } = useNotification();

  // حالة النافذة
  const [currentLevel, setCurrentLevel] = useState([]); // مجلدات current navigation
  const [currentGroups, setCurrentGroups] = useState([]); // مجموعات في المستوى الحالي
  const [breadcrumb, setBreadcrumb] = useState([]); // breadcrumb للتنقل
  const [isEditMode, setIsEditMode] = useState(!!group); // هل في وضع التعديل
  const [initialGroup, setInitialGroup] = useState(group); // المجموعة الابتدائية

  // تحديث المجموعات عند تغيير المستوى
  useEffect(() => {
    if (currentLevel.length === 0) {
      // المستوى الجذري - المجموعات الرئيسية فقط
      setCurrentGroups(getRootGroups());
      setBreadcrumb([]);
    } else {
      // مستوى فرعي
      const parentId = currentLevel[currentLevel.length - 1];
      setCurrentGroups(getChildGroups(parentId));
      
      // تحديث breadcrumb
      const path = getGroupBreadcrumbPath(parentId);
      setBreadcrumb(path);
    }
  }, [currentLevel, groups]);

  // عند فتح النافذة في وضع التعديل
  useEffect(() => {
    if (isEditMode && initialGroup) {
      // الانتقال إلى مستوى المجموعة المختارة
      const path = getGroupBreadcrumbPath(initialGroup.id);
      if (path.length > 0) {
        // الانتقال إلى آخر عنصر في المسار
        const levelPath = path.map(g => g.id);
        setCurrentLevel(levelPath.slice(0, -1)); // جميع العناصر باستثناء الأخيرة
      }
    }
  }, [isEditMode, initialGroup]);

  // دالة تنقل للداخل (فتح مجموعة فرعية)
  const handleNavigateInto = (groupId) => {
    setCurrentLevel([...currentLevel, groupId]);
  };

  // دالة رجوع للخلف
  const handleNavigateBack = () => {
    if (currentLevel.length > 0) {
      setCurrentLevel(currentLevel.slice(0, -1));
    }
  };

  // دالة الانتقال لعنصر معين في breadcrumb
  const handleBreadcrumbClick = (groupIndex) => {
    if (groupIndex === -1) {
      // العودة للمستوى الجذري
      setCurrentLevel([]);
    } else {
      setCurrentLevel(breadcrumb.slice(0, groupIndex + 1).map(g => g.id));
    }
  };

  // إضافة مجموعة جديدة في المستوى الحالي
  const [newGroups, setNewGroups] = useState([]);
  const handleAddNewGroup = () => {
    const parentId = currentLevel.length > 0 ? currentLevel[currentLevel.length - 1] : null;
    const newGroup = {
      id: `temp-${Date.now()}`,
      name: '',
      parent_id: parentId,
      code: generateGroupCode(parentId),
      created_at: new Date().toISOString()
    };
    setNewGroups([...newGroups, newGroup]);
  };

  // تعديل اسم مجموعة جديدة
  const handleNewGroupNameChange = (tempId, newName) => {
    setNewGroups(newGroups.map(g => 
      g.id === tempId ? { ...g, name: newName } : g
    ));
  };

  // حذف مجموعة جديدة
  const handleRemoveNewGroup = (tempId) => {
    setNewGroups(newGroups.filter(g => g.id !== tempId));
  };

  // حفظ جميع المجموعات الجديدة
  const handleSaveAll = async () => {
    try {
      // التحقق من وجود أسماء فارغة
      const emptyGroups = newGroups.filter(g => !g.name.trim());
      if (emptyGroups.length > 0) {
        showError('يجب إدخال اسم لكل مجموعة جديدة');
        return;
      }

      // حفظ جميع المجموعات الجديدة
      for (const newGroup of newGroups) {
        const groupData = {
          name: newGroup.name.trim(),
          parent_id: newGroup.parent_id,
          code: newGroup.code
        };
        addGroup(groupData);
      }

      // مسح المجموعات الجديدة
      setNewGroups([]);
      showSuccess('تم حفظ المجموعات بنجاح');
      
      onClose();
    } catch (error) {
      showError('حدث خطأ أثناء حفظ المجموعات: ' + error.message);
    }
  };

  // تعديل مجموعة موجودة
  const [editingGroups, setEditingGroups] = useState([]);
  const [deletedGroupIds, setDeletedGroupIds] = useState([]);

  const handleEditGroupName = (groupId, newName) => {
    if (!editingGroups.find(g => g.id === groupId)) {
      // إضافة لمجموعة التحرير
      const originalGroup = currentGroups.find(g => g.id === groupId);
      if (originalGroup) {
        setEditingGroups([...editingGroups, { ...originalGroup }]);
      }
    }
    
    // تحديث الاسم
    setCurrentGroups(currentGroups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  };

  // حذف مجموعة موجودة
  const handleDeleteGroup = (groupId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المجموعة؟')) {
      setDeletedGroupIds([...deletedGroupIds, groupId]);
      setCurrentGroups(currentGroups.filter(g => g.id !== groupId));
    }
  };

  // حفظ التعديلات
  const handleSaveChanges = async () => {
    try {
      // التحقق من وجود أسماء فارغة
      const emptyGroups = editingGroups.filter(g => !g.name.trim());
      if (emptyGroups.length > 0) {
        showError('يجب إدخال اسم لكل مجموعة');
        return;
      }

      // حفظ التعديلات
      for (const editedGroup of editingGroups) {
        if (editedGroup.name !== editedGroup.original_name) {
          updateGroup(editedGroup.id, { name: editedGroup.name.trim() });
        }
      }

      // حذف المجموعات المختارة
      for (const deletedId of deletedGroupIds) {
        deleteGroup(deletedId);
      }

      showSuccess('تم حفظ التعديلات بنجاح');
      onClose();
    } catch (error) {
      showError('حدث خطأ أثناء حفظ التعديلات: ' + error.message);
    }
  };

  // زر العنوان
  const getWindowTitle = () => {
    if (isEditMode) {
      return `تعديل مجموعة: ${initialGroup?.name || ''}`;
    } else {
      return currentLevel.length === 0 ? 'إضافة مجموعات جديدة' : `إضافة مجموعات فرعية`;
    }
  };

  // عرض النافذة
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* رأس النافذة */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaLayerGroup className="text-blue-600" />
            {getWindowTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* شريط Breadcrumb */}
          {breadcrumb.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => handleBreadcrumbClick(-1)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  المجموعات الرئيسية
                </button>
                {breadcrumb.map((group, index) => (
                  <React.Fragment key={group.id}>
                    <FaChevronLeft className="text-gray-400" size={12} />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {group.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* زر الرجوع */}
          {currentLevel.length > 0 && (
            <div className="mb-4">
              <Button
                onClick={handleNavigateBack}
                variant="outline"
                size="sm"
                icon={<FaArrowLeft />}
              >
                العودة للمستوى السابق
              </Button>
            </div>
          )}

          {/* جدول المجموعات */}
          <Card>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentLevel.length === 0 ? 'المجموعات الرئيسية' : `المجموعات الفرعية للـ ${breadcrumb[breadcrumb.length - 1]?.name || ''}`}
                </h3>
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

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">كود المجموعة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">اسم المجموعة</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {/* المجموعات الموجودة */}
                  {currentGroups.map((group) => (
                    <tr key={group.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {group.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => handleEditGroupName(group.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleNavigateInto(group.id)}
                            variant="primary"
                            size="sm"
                            icon={<FaChevronRight />}
                            title="الدخول للمجموعة"
                          >
                            دخول
                          </Button>
                          <Button
                            onClick={() => handleDeleteGroup(group.id)}
                            variant="danger"
                            size="sm"
                            icon={<FaTrash />}
                            title="حذف المجموعة"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* المجموعات الجديدة */}
                  {newGroups.map((newGroup) => (
                    <tr key={newGroup.id} className="border-b border-gray-100 bg-blue-50">
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {newGroup.code}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="اسم المجموعة الجديدة"
                          value={newGroup.name}
                          onChange={(e) => handleNewGroupNameChange(newGroup.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => handleNavigateInto(newGroup.id)}
                            variant="primary"
                            size="sm"
                            icon={<FaChevronRight />}
                            title="الدخول للمجموعة"
                            disabled={!newGroup.name.trim()}
                          >
                            دخول
                          </Button>
                          <Button
                            onClick={() => handleRemoveNewGroup(newGroup.id)}
                            variant="danger"
                            size="sm"
                            icon={<FaTrash />}
                            title="حذف المجموعة"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* أزرار الحفظ والإغلاق */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
          >
            إلغاء
          </Button>
          <Button
            onClick={isEditMode ? handleSaveChanges : handleSaveAll}
            variant="success"
            icon={<FaSave />}
          >
            حفظ جميع التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupExplorerWindow;