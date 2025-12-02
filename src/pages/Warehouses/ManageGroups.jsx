// ======================================
// Manage Groups - إدارة المجموعات الكاملة
// نظام هرمي مع الوظائف المطلوبة كاملة
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useAuth } from '../../context/AuthContext';

const ManageGroups = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = useData();
  const { showSuccess } = useNotification();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // State للـ accordion في المنطقة الهرمية
  const [collapsedLevels, setCollapsedLevels] = useState({});

  // دوال مساعدة للـ accordion - تصميمية فقط
  const toggleLevel = (level) => {
    setCollapsedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  // دالة للحصول على لون المستوى
  const getLevelColor = (level) => {
    const colors = {
      1: 'border-green-200 bg-green-50',     // أخضر فاتح
      2: 'border-blue-200 bg-blue-50',       // أزرق فاتح  
      3: 'border-yellow-200 bg-yellow-50',   // أصفر فاتح
      4: 'border-purple-200 bg-purple-50',   // بنفسجي فاتح
      5: 'border-pink-200 bg-pink-50'        // وردي فاتح
    };
    return colors[level] || 'border-gray-200 bg-gray-50';
  };

  // دالة مجمعة للمجموعات المتشابهة - تصميمية فقط
  const groupByLevel = (groups) => {
    const levelGroups = {};
    groups.forEach(group => {
      const level = group.level || 1;
      if (!levelGroups[level]) {
        levelGroups[level] = [];
      }
      levelGroups[level].push(group);
    });
    return levelGroups;
  };

  // دوال التحقق من صحة البيانات للعرض الهرمي الرئيسي
  // هذه الدوال تعمل مع البيانات الأساسية (جدول groups)

  // الحصول على جميع المجموعات في مستوى معين
  const getAllGroupsAtLevel = (level) => {
    const groupsList = [];
    
    const collectGroups = (groupList) => {
      groupList.forEach(group => {
        if (group.level === level) {
          groupsList.push(group);
        }
        if (group.children && group.children.length > 0) {
          collectGroups(group.children);
        }
      });
    };
    
    collectGroups(groups);
    return groupsList;
  };

  // دالة للتحقق من إمكانية إضافة مجموعة فرعية في العرض الهرمي
  const canAddSubGroup = (parentGroup = null) => {
    // في العرض الهرمي، نسمح بإضافة مجموعات فرعية دائماً
    // لكن نتحقق من أن المجموعة الأب لها اسم
    if (parentGroup && !parentGroup.name?.trim()) {
      return false;
    }
    return true;
  };

  // دالة للحصول على رسالة التحذير في العرض الهرمي
  const getAddSubGroupMessage = (parentGroup = null) => {
    if (parentGroup && !parentGroup.name?.trim()) {
      return 'يرجى كتابة اسم هذه المجموعة أولاً';
    }
    return '';
  };

  const filteredGroups = groups.filter(group => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = group.name?.toLowerCase().includes(searchLower);
    const matchesSerial = group.serial?.toString().toLowerCase().includes(searchLower);
    return matchesName || matchesSerial;
  });

  // مكون رسالة التأكيد المميزة والراقية
  const ConfirmDeleteModal = ({ group, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-80 transform transition-all">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-center mb-2 text-gray-900">تأكيد الحذف</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              هل أنت متأكد من حذف المجموعة "<span className="font-medium">{group.name}</span>"؟
              <br />
              <span className="text-red-500 text-xs mt-2 block">هذا الإجراء لا يمكن التراجع عنه</span>
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition-colors"
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const handleDeleteGroup = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      deleteGroup(groupToDelete.id);
      showSuccess('تم حذف المجموعة بنجاح');
    }
    setShowDeleteModal(false);
    setGroupToDelete(null);
  };

  const handleDoubleClick = (group) => {
    setEditingGroup(group);
    setShowCreateModal(true);
  };

  const handleCreateGroup = (groupData) => {
    if (editingGroup) {
      // تحديث مجموعة موجودة
      updateGroup(editingGroup.id, groupData);
      showSuccess('تم تعديل المجموعة بنجاح');
      
      // التمرير التلقائي للمجموعة المُعدلة
      setTimeout(() => {
        const editedElement = document.querySelector(`[data-group-id="${editingGroup.id}"]`);
        if (editedElement) {
          editedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          editedElement.style.backgroundColor = '#f0f9ff';
          setTimeout(() => {
            editedElement.style.backgroundColor = '';
          }, 2000);
        }
      }, 100);
    } else {
      // إنشاء مجموعة جديدة
      addGroup(groupData);
      showSuccess('تم إنشاء المجموعة بنجاح');
    }
    
    setEditingGroup(null);
  };

  // مكون عرض التسلسل الهرمي مع ألوان و accordion
  const renderHierarchicalView = (group, level = 1) => {
    const indent = '    '.repeat(level - 1);
    const isCollapsed = collapsedLevels[level];
    
    return (
      <div key={group.id} className="mb-1">
        <div className="text-xs">
          {indent}{/* أيقونة المجلد للإشارة للمستوى */}
          <span className={`inline-block w-3 h-3 rounded-sm mr-1 ${getLevelColor(level)}`}></span>
          <span className="font-bold">{group.serial}</span> - {group.name}
        </div>
        {group.children && group.children.map(child => 
          renderHierarchicalView(child, level + 1)
        )}
      </div>
    );
  };

  // نافذة الإنشاء الشاملة - نظام لا نهائي
  const CreateGroupModal = ({ onClose, onSave, existingGroup = null }) => {
    const { showSuccess } = useNotification();
    const [name, setName] = useState(existingGroup?.name || '');
    const [description, setDescription] = useState(existingGroup?.description || '');
    const [hierarchy, setHierarchy] = useState([]);

    // إذا كانت مجموعة موجودة، تحميل بياناتها
    React.useEffect(() => {
      if (existingGroup) {
        // تحويل المجموعة إلى بنية التسلسل الهرمي
        const convertToHierarchy = (group) => {
          return {
            id: group.id,
            name: group.name,
            children: (group.children || []).map(child => convertToHierarchy(child))
          };
        };
        
        const groupHierarchy = convertToHierarchy(existingGroup);
        setName(existingGroup.name || '');
        setDescription(existingGroup.description || '');
        
        // تحويل children إلى hierarchy structure
        if (existingGroup.children && existingGroup.children.length > 0) {
          setHierarchy(existingGroup.children.map(child => convertToHierarchy(child)));
        }
      }
    }, [existingGroup]);

    // دوال محلية للتحقق من القيود داخل CreateGroupModal
    const getAllGroupsAtLevelLocal = (level) => {
      const groupsList = [];
      
      const collectGroups = (groupList) => {
        groupList.forEach(group => {
          if (group.level === level) {
            groupsList.push(group);
          }
          if (group.children && group.children.length > 0) {
            collectGroups(group.children);
          }
        });
      };
      
      collectGroups(hierarchy);
      return groupsList;
    };

    const canAddSubGroupLocal = (parentGroup = null) => {
      if (!parentGroup) {
        // للمستوى 2، التحقق من المجموعة الرئيسية
        return name.trim().length > 0;
      }
      
      // للمستويات 3+, التحقق من المجموعة الأب
      const targetLevel = (parentGroup.level || 1) + 1;
      
      if (targetLevel === 2) {
        return name.trim().length > 0;
      }
      
      // التحقق من أن جميع مجموعات المستوى السابق مملوءة
      const allPreviousLevelGroups = getAllGroupsAtLevelLocal(targetLevel - 1);
      const hasEmptyGroups = allPreviousLevelGroups.some(group => !group.name.trim());
      
      return !hasEmptyGroups && parentGroup.name.trim().length > 0;
    };

    const getAddSubGroupMessageLocal = (parentGroup = null) => {
      if (!parentGroup) {
        return !name.trim() ? 'يرجى كتابة اسم المجموعة الرئيسية أولاً' : '';
      }
      
      const targetLevel = (parentGroup.level || 1) + 1;
      
      if (targetLevel === 2) {
        return !name.trim() ? 'يرجى كتابة اسم المجموعة الرئيسية أولاً' : '';
      }
      
      if (!parentGroup.name.trim()) {
        return `يرجى كتابة اسم مجموعة المستوى ${targetLevel - 1} أولاً`;
      }
      
      const allPreviousLevelGroups = getAllGroupsAtLevelLocal(targetLevel - 1);
      const hasEmptyGroups = allPreviousLevelGroups.some(group => !group.name.trim());
      
      if (hasEmptyGroups) {
        return `يرجى إكمال أسماء جميع مجموعات المستوى ${targetLevel - 1} أولاً`;
      }
      
      return '';
    };

    const addSubGroup = (parentId = null) => {
      const newGroup = {
        id: Date.now() + Math.random(),
        name: '',
        level: 1,
        children: []
      };
      
      if (parentId === null) {
        // إضافة مجموعة على المستوى الأول (المستوى 2)
        const targetLevel = 2;
        
        // التحقق من أن المجموعة الرئيسية مكتوبة
        if (!name.trim()) {
          showSuccess('يرجى كتابة اسم المجموعة الرئيسية أولاً');
          return; // إيقاف العملية
        }
        
        newGroup.level = targetLevel;
        setHierarchy([...hierarchy, newGroup]);
      } else {
        // إضافة مجموعة فرعية لمجموعة معينة
        // العثور على المجموعة الأب
        const findParentGroup = (groups, id) => {
          for (const group of groups) {
            if (group.id === id) {
              return group;
            }
            if (group.children && group.children.length > 0) {
              const found = findParentGroup(group.children, id);
              if (found) return found;
            }
          }
          return null;
        };
        
        const parentGroup = findParentGroup(hierarchy, parentId);
        const targetLevel = (parentGroup?.level || 1) + 1;
        
        // التحقق من أن المستوى السابق مملوء بالاسماء
        const validatePreviousLevel = (targetLevel, parentGroup) => {
          if (targetLevel === 2) {
            return name.trim().length > 0;
          }
          
          const allPreviousLevelGroups = getAllGroupsAtLevelLocal(targetLevel - 1);
          const hasEmptyGroups = allPreviousLevelGroups.some(group => !group.name.trim());
          
          if (hasEmptyGroups) {
            showSuccess(`يرجى إكمال أسماء جميع مجموعات المستوى ${targetLevel - 1} أولاً`);
            return false;
          }
          
          return true;
        };
        
        if (!validatePreviousLevel(targetLevel, parentGroup)) {
          return; // إيقاف العملية
        }
        
        const updateGroupInHierarchy = (groups) => {
          return groups.map(group => {
            if (group.id === parentId) {
              // إضافة المجموعة الفرعية للمجموعة المحددة
              return {
                ...group,
                level: targetLevel,
                children: [...(group.children || []), { ...newGroup, level: targetLevel }]
              };
            } else if (group.children && group.children.length > 0) {
              // البحث في المجموعات الفرعية
              return {
                ...group,
                children: updateGroupInHierarchy(group.children)
              };
            }
            return group;
          });
        };
        
        setHierarchy(updateGroupInHierarchy(hierarchy));
      }
    };

    const updateGroupName = (groupId, value) => {
      const updateInHierarchy = (groups) => {
        return groups.map(group => {
          if (group.id === groupId) {
            return { ...group, name: value };
          } else if (group.children && group.children.length > 0) {
            return {
              ...group,
              children: updateInHierarchy(group.children)
            };
          }
          return group;
        });
      };
      setHierarchy(updateInHierarchy(hierarchy));
    };

    const removeGroup = (groupId) => {
      const removeFromHierarchy = (groups) => {
        return groups
          .filter(group => group.id !== groupId)
          .map(group => ({
            ...group,
            children: group.children ? removeFromHierarchy(group.children) : []
          }));
      };
      setHierarchy(removeFromHierarchy(hierarchy));
    };

    // إنشاء ref خارج حلقة map
    const groupRefs = React.useRef({});

    const renderRecursiveGroups = (groups, level = 1) => {
      return groups.map((group) => {
        // إنشاء ref فريد لكل مجموعة
        if (!groupRefs.current[group.id]) {
          groupRefs.current[group.id] = React.createRef();
        }
        
        const currentLevel = level + 1;
        return (
          <div key={group.id} ref={groupRefs.current[group.id]} className={`border mb-1 p-1 ${getLevelColor(currentLevel)} rounded-md transition-all duration-200 hover:shadow-sm`}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {/* مؤشر لون المستوى */}
                <span className="inline-block w-3 h-3 rounded border border-white shadow-sm"></span>
                <span className="font-bold text-xs">المستوى {currentLevel} - {group.serial || 'جديد'}</span>
              </div>
              <button 
                onClick={() => removeGroup(group.id)} 
                className="text-xs border p-1 hover:bg-red-50 hover:border-red-200 transition-colors rounded"
              >
                حذف
              </button>
            </div>
            
            <input
              type="text"
              value={group.name}
              onChange={(e) => updateGroupName(group.id, e.target.value)}
              className="w-full p-1 border text-xs mb-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              placeholder={`مجموعة المستوى ${currentLevel}`}
            />
            
            {group.children && group.children.length > 0 && (
              <div className="mr-2 mt-2 space-y-1">
                {renderRecursiveGroups(group.children, currentLevel)}
              </div>
            )}
            
            <button 
              onClick={() => {
                if (canAddSubGroupLocal(group)) {
                  addSubGroup(group.id);
                  // التمرير التلقائي للعنصر الجديد
                  setTimeout(() => {
                    const newElement = groupRefs.current[group.id]?.current?.nextElementSibling;
                    if (newElement) {
                      newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 100);
                }
              }} 
              disabled={!canAddSubGroupLocal(group)}
              className={`text-xs border p-1 mt-1 w-full rounded transition-colors ${
                canAddSubGroupLocal(group) 
                  ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title={getAddSubGroupMessageLocal(group) || 'إضافة مجموعة فرعية جديدة'}
            >
              + إضافة مجموعة فرعية
            </button>
          </div>
        );
      });
    };

    // دالة معالجة التسلسل الهرمي
    const processHierarchy = (groups, parentSerial = null, level = 2) => {
      return groups.map((group, index) => {
        const serial = parentSerial 
          ? `${parentSerial}-${String(index + 1).padStart(3, '0')}`
          : `${String(index + 1).padStart(3, '0')}`;
          
        return {
          id: group.id || Date.now() + index,
          name: group.name || `مجموعة ${index + 1}`,
          level: level,
          serial: serial,
          parentSerial: parentSerial,
          children: processHierarchy(group.children || [], serial, level + 1)
        };
      });
    };

    const handleSave = () => {
      if (!name.trim()) return;

      if (existingGroup) {
        // تعديل المجموعة الموجودة
        const updatedGroup = {
          ...existingGroup,
          name: name.trim(),
          description: description.trim(),
          children: processHierarchy(hierarchy, existingGroup.serial, 2)
        };
        
        onSave(updatedGroup);
        showSuccess('تم تعديل المجموعة بنجاح');
        
        // التمرير التلقائي للمجموعة المُعدلة
        setTimeout(() => {
          const editedElement = document.querySelector(`[data-group-id="${existingGroup.id}"]`);
          if (editedElement) {
            editedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            editedElement.style.backgroundColor = '#f0f9ff';
            setTimeout(() => {
              editedElement.style.backgroundColor = '';
            }, 2000);
          }
        }, 100);
      } else {
        // إنشاء مجموعة جديدة
        const mainSerial = String(groups.length + 1).padStart(3, '0');

        const newGroup = {
          id: Date.now(),
          name,
          description,
          level: 1,
          serial: mainSerial,
          parentSerial: null,
          children: processHierarchy(hierarchy, mainSerial, 2)
        };

        onSave(newGroup);
        showSuccess('تم إنشاء المجموعة بنجاح');
      }
      
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white border w-11/12 h-5/6 flex flex-col">
          <div className="p-2 border-b flex justify-between items-center">
            <h2 className="font-bold text-sm">
              {existingGroup ? 'تعديل مجموعة ' : 'إنشاء مجموعة جديدة'}
            </h2>
            <button onClick={onClose} className="text-sm">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              <div className="space-y-4">
                <div className="p-2 border">
                  <h3 className="font-bold text-sm mb-2">المجموعة الرئيسية</h3>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs mb-1">اسم المجموعة الرئيسية</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-1 border text-xs"
                        placeholder="مثال: مشروبات غازية"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs mb-1">الوصف</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-1 border text-xs"
                        rows="2"
                        placeholder="وصف المجموعة..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-2 border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm">المجموعات الفرعية</h3>
                    <button 
                      onClick={() => {
                        if (canAddSubGroupLocal()) {
                          addSubGroup();
                        }
                      }} 
                      disabled={!canAddSubGroupLocal()}
                      className={`px-2 py-1 border text-xs rounded transition-colors ${
                        canAddSubGroupLocal() 
                          ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      title={getAddSubGroupMessageLocal() || 'إضافة مجموعة فرعية جديدة'}
                    >
                      + إضافة مجموعة فرعية
                    </button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {hierarchy.length > 0 && (
                      <div className="space-y-1">
                        {hierarchy.map((group) => (
                          <div key={group.id} className={`hierarchy-group border mb-1 p-1 ${getLevelColor(2)} rounded-md transition-all duration-200 hover:shadow-sm`}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                {/* مؤشر لون المستوى */}
                                <span className="inline-block w-4 h-4 rounded border-2 border-white shadow-sm"></span>
                                <span className="font-bold text-xs">المستوى 2 - {group.serial || 'جديد'}</span>
                              </div>
                              <button 
                                onClick={() => removeGroup(group.id)} 
                                className="text-xs border p-1 hover:bg-red-50 hover:border-red-200 transition-colors rounded"
                              >
                                حذف
                              </button>
                            </div>
                            
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => updateGroupName(group.id, e.target.value)}
                              className="w-full p-1 border text-xs mb-1 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                              placeholder="مجموعة المستوى 2"
                            />
                            
                            {group.children && group.children.length > 0 && (
                              <div className="mr-2 mt-2 space-y-1">
                                {renderRecursiveGroups(group.children, 2)}
                              </div>
                            )}
                            
                            <button 
                              onClick={() => {
                                if (canAddSubGroupLocal(group)) {
                                  addSubGroup(group.id);
                                  // التمرير التلقائي للعنصر الجديد
                                  setTimeout(() => {
                                    const elements = document.querySelectorAll('.hierarchy-group');
                                    const lastElement = elements[elements.length - 1];
                                    if (lastElement) {
                                      lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                  }, 100);
                                }
                              }} 
                              disabled={!canAddSubGroupLocal(group)}
                              className={`text-xs border p-1 mt-1 w-full rounded transition-colors ${
                                canAddSubGroupLocal(group) 
                                  ? 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              title={getAddSubGroupMessageLocal(group) || 'إضافة مجموعة فرعية جديدة'}
                            >
                              + إضافة مجموعة فرعية
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {hierarchy.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        لا توجد مجموعات فرعية. انقر على "إضافة مجموعة فرعية" للبدء
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-2 border-t flex justify-end gap-2">
            <button onClick={onClose} className="px-3 py-1 border text-xs">
              إلغاء
            </button>
            <button 
              onClick={handleSave} 
              className="px-4 py-1 bg-black text-white text-xs"
              disabled={!name.trim()}
            >
              حفظ المجموعة
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* شريط علوي */}
      <div className="flex justify-between items-center p-1 border-b">
        <span className="font-bold text-xs">إدارة المجموعات ({filteredGroups.length})</span>
        
        <div className="flex gap-1">
          <div className="relative">
            <input
              type="text"
              placeholder="بحث بالرقم التسلسلي أو الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-2 py-1 border text-xs w-48 focus:w-56 transition-all duration-200"
            />
          </div>
          
          {hasPermission('add_category') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-2 py-1 border text-xs flex items-center gap-1"
            >
              إنشاء مجموعة شاملة
            </button>
          )}
        </div>
      </div>

      {/* جدول المجموعات */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-right p-1 font-bold text-xs">الرقم</th>
              <th className="text-right p-1 font-bold text-xs">اسم المجموعة</th>
              <th className="text-center p-1 font-bold text-xs">عدد المجموعات</th>
              <th className="text-center p-1 font-bold text-xs">المجموعة</th>
              <th className="text-center p-1 font-bold text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group, index) => (
              <tr 
                key={group.id} 
                data-group-id={group.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onDoubleClick={() => handleDoubleClick(group)}
                title="انقر مرتين للتعديل"
              >
                <td className="p-1 font-mono text-xs">{group.serial}</td>
                <td className="p-1">
                  <div className="font-medium text-sm">{group.name}</div>
                  {group.description && (
                    <div className="text-gray-500 text-xs">{group.description}</div>
                  )}
                </td>
                <td className="p-1 text-center text-xs">
                  {group.children?.length || 0} مجموعة
                </td>
                <td className="p-1 text-center text-xs">
                  المجموعة {group.level}
                </td>
                <td className="p-1 text-center">
                  <div className="flex justify-center">
                    {hasPermission('delete_category') && (
                      <button
                        onClick={() => handleDeleteGroup(group)}
                        className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs hover:bg-red-100 transition-colors"
                        title="حذف المجموعة"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredGroups.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div>إدارة المجموعات</div>
                    <div className="text-sm">
                      {searchTerm ? (
                        <>لا توجد نتائج للبحث عن "<span className="font-medium">{searchTerm}</span>"</>
                      ) : (
                        'لا توجد مجموعات'
                      )}
                    </div>
                    {!searchTerm && hasPermission('add_category') && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="mt-2 px-4 py-2 border text-sm"
                      >
                        إنشاء أول مجموعة
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* النوافذ المنبثقة */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => {
            setShowCreateModal(false);
            setEditingGroup(null);
          }}
          onSave={handleCreateGroup}
          existingGroup={editingGroup}
        />
      )}
      
      {/* رسالة التأكيد المميزة */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          group={groupToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setGroupToDelete(null);
          }}
          onConfirm={confirmDeleteGroup}
        />
      )}
    </div>
  );
};

export default ManageGroups;