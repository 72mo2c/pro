// ======================================
// Manage Categories - إدارة الفئات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaLock, 
  FaSitemap, 
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaIndent,
  FaArrowUp
} from 'react-icons/fa';

const ManageCategories = () => {
  const { 
    categories, 
    addCategory, 
    addCategoryWithSubcategories,
    updateCategory, 
    deleteCategory,
    getMainCategories,
    getSubcategories,
    getCategoryTree,
    getCategoryTreeRecursive,
    addSubcategory,
    moveCategory
  } = useData();
  const { showSuccess, showError, showConfirm } = useNotification();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();

  // دالة تنسيق العملة (للاستخدام المستقبلي)
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // دوال مساعدة لإدارة المجموعات الفرعية
  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddSubcategory = (parentId) => {
    setFormData({
      name: '',
      description: '',
      color: '#fb923c',
      parentId: parentId
    });
    setEditingId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMoveCategory = (categoryId, newParentId) => {
    try {
      moveCategory(categoryId, newParentId);
      showSuccess('تم نقل الفئة بنجاح');
    } catch (error) {
      showError(error.message);
    }
  };

  // ======================================
  // نظام النوافذ المتعددة الجديد
  // ======================================
  
  // فتح نافذة جديدة
  const openNewWindow = (windowType, parentId = null, parentName = '', shouldReplace = false) => {
    // الحصول على النافذة الحالية لنسخ بياناتها
    const currentWindow = openWindows[openWindows.length - 1];
    
    // تحديد المستوى بناءً على نوع النافذة والنافذة الحالية
    const currentLevel = currentWindow?.data?.level || 0;
    const newLevel = windowType === 'main' ? 1 : currentLevel + 1;
    
    const newWindow = {
      id: nextWindowId,
      type: windowType, // 'main', 'subcategories', 'nested'
      parentId: parentId,
      parentName: parentName,
      title: getWindowTitle(windowType, parentName),
      data: {
        categoryData: { name: parentName || '', description: '', color: '#fb923c' },
        subcategories: currentWindow?.data?.subcategories || [], // نقل الفئات الفرعية من النافذة السابقة
        level: newLevel, // تحديد المستوى الحالي
        isDirty: false
      },
      position: { x: 50 + (openWindows.length * 30), y: 50 + (openWindows.length * 30) },
      size: { width: 380, height: 480 },
      createdAt: new Date().toISOString()
    };

    if (shouldReplace) {
      // استبدال النافذة الحالية بدلاً من إضافة جديدة
      setOpenWindows(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = newWindow; // استبدال آخر نافذة
        return updated;
      });
      setActiveWindowId(nextWindowId);
      
      // إضافة النافذة السابقة إلى تاريخ التنقل
      if (openWindows.length > 0) {
        setNavigationStack(prev => [...prev, currentWindow]);
      }
    } else {
      // إضافة نافذة جديدة
      setOpenWindows(prev => [...prev, newWindow]);
      setActiveWindowId(nextWindowId);
    }
    
    setNextWindowId(prev => prev + 1);
    
    // تحميل البيانات المناسبة للنافذة
    if (windowType === 'subcategories' || windowType === 'nested') {
      loadSubcategoriesData(newWindow.id, parentId);
    }
  };

  // التبديل إلى نافذة الفئات الفرعية (استبدال النافذة الحالية)
  const switchToSubcategoriesWindow = (parentId, parentName) => {
    // الحصول على النافذة الحالية لنسخ بياناتها
    const currentWindow = openWindows[openWindows.length - 1];
    
    // إنشاء نافذة جديدة للفئات الفرعية مع البيانات الموجودة
    const newWindow = {
      id: nextWindowId,
      type: 'subcategories',
      parentId: parentId || 'temp_main',
      parentName: parentName,
      title: `الفئات الفرعية: ${parentName}`,
      data: {
        categoryData: { name: parentName, description: '', color: '#fb923c' },
        subcategories: currentWindow?.data?.subcategories || [], // نقل الفئات الفرعية من النافذة السابقة
        isDirty: false
      },
      position: { x: 50 + (openWindows.length * 30), y: 50 + (openWindows.length * 30) },
      size: { width: 380, height: 480 },
      createdAt: new Date().toISOString()
    };

    // استبدال النافذة الحالية
    setOpenWindows(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = newWindow;
      return updated;
    });
    setActiveWindowId(nextWindowId);
    
    // إضافة النافذة السابقة إلى تاريخ التنقل
    if (openWindows.length > 0) {
      setNavigationStack(prev => [...prev, currentWindow]);
    }
    
    setNextWindowId(prev => prev + 1);
    
    // تحميل البيانات إذا كان هناك parentId صحيح
    if (parentId && parentId !== 'temp_main') {
      loadSubcategoriesData(newWindow.id, parentId);
    }
  };

  // التبديل إلى نافذة الفئات المتداخلة (استبدال النافذة الحالية)
  const switchToNestedWindow = (parentId, parentName, parentSubcategoryIndex = null) => {
    // الحصول على النافذة الحالية لتحديد المستوى
    const currentWindow = openWindows[openWindows.length - 1];
    const currentLevel = (currentWindow?.data?.level || 1) + 1;
    
    const newWindow = {
      id: nextWindowId,
      type: 'nested',
      parentId: parentId,
      parentName: parentName,
      title: `الفئات الفرعية المستوى ${currentLevel}: ${parentName}`,
      data: {
        categoryData: { name: parentName, description: '', color: '#fb923c' },
        subcategories: [], // فارغة لأن هذه نافذة جديدة
        level: currentLevel, // تحديد المستوى الحالي
        parentSubcategoryIndex: parentSubcategoryIndex, // الفئة الفرعية الأب
        isDirty: false
      },
      position: { x: 50 + (openWindows.length * 30), y: 50 + (openWindows.length * 30) },
      size: { width: 380, height: 480 },
      createdAt: new Date().toISOString()
    };

    // استبدال النافذة الحالية
    setOpenWindows(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = newWindow;
      return updated;
    });
    setActiveWindowId(nextWindowId);
    
    // إضافة النافذة السابقة إلى تاريخ التنقل
    if (openWindows.length > 0) {
      setNavigationStack(prev => [...prev, currentWindow]);
    }
    
    setNextWindowId(prev => prev + 1);
    
    // تحميل البيانات إذا كان هناك parentId صحيح
    if (parentId && parentId !== 'temp_main') {
      loadSubcategoriesData(newWindow.id, parentId);
    }
  };

  // العودة إلى النافذة السابقة
  const goBackToPreviousWindow = () => {
    if (navigationStack.length === 0) return;

    const previousWindow = navigationStack[navigationStack.length - 1];
    const currentWindow = openWindows[openWindows.length - 1];
    
    // نقل البيانات مع الحفاظ على المستوى الهرمي
    let updatedPreviousSubcategories = [...(previousWindow.data.subcategories || [])];
    
    if (currentWindow.data.subcategories && currentWindow.data.subcategories.length > 0) {
      // إذا كان هناك parentSubcategoryIndex، فربط البيانات بالفئة الفرعية الصحيحة
      if (currentWindow.data.subcategories[0]?.parentSubcategoryIndex !== undefined) {
        const parentIndex = currentWindow.data.subcategories[0].parentSubcategoryIndex;
        if (parentIndex !== null && parentIndex >= 0 && parentIndex < updatedPreviousSubcategories.length) {
          updatedPreviousSubcategories = updatedPreviousSubcategories.map((sub, i) => {
            if (i === parentIndex) {
              return {
                ...sub,
                children: [...(sub.children || []), ...currentWindow.data.subcategories]
              };
            }
            return sub;
          });
        }
      } else {
        // إضافة البيانات في المستوى الحالي
        updatedPreviousSubcategories = [...updatedPreviousSubcategories, ...currentWindow.data.subcategories];
      }
    }
    
    const updatedPreviousWindow = {
      ...previousWindow,
      data: {
        ...previousWindow.data,
        subcategories: updatedPreviousSubcategories
      }
    };
    
    setNavigationStack(prev => prev.slice(0, -1));
    
    setOpenWindows(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = updatedPreviousWindow; // استبدال النافذة الحالية بالنافذة المحدثة
      return updated;
    });
    
    setActiveWindowId(previousWindow.id);
    
    // تم إزالة إشعار الرجوع حسب طلب المستخدم
  };

  // إنشاء مسار التنقل (breadcrumbs)
  const getNavigationPath = () => {
    const path = [];
    
    // إضافة النافذة الحالية
    const currentWindow = openWindows.find(w => w.id === activeWindowId);
    if (currentWindow) {
      path.push({
        id: currentWindow.id,
        title: currentWindow.title,
        type: currentWindow.type
      });
    }

    // إضافة النوافذ في تاريخ التنقل
    navigationStack.forEach(window => {
      path.unshift({
        id: window.id,
        title: window.title,
        type: window.type
      });
    });

    return path;
  };

  // إغلاق نافذة
  const closeWindow = (windowId) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      const remainingWindows = openWindows.filter(w => w.id !== windowId);
      setActiveWindowId(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1].id : null);
    }
  };

  // تفعيل نافذة (جعلها أمامية)
  const activateWindow = (windowId) => {
    setActiveWindowId(windowId);
  };

  // تحميل بيانات الفئات الفرعية
  const loadSubcategoriesData = (windowId, parentId) => {
    setOpenWindows(prev => prev.map(window => {
      if (window.id === windowId) {
        const subcategories = getSubcategories(parentId);
        return {
          ...window,
          data: {
            ...window.data,
            subcategories: subcategories.map(sub => ({
              ...sub,
              isEditing: false,
              tempName: sub.name,
              tempDescription: sub.description || '',
              tempColor: sub.color || '#fb923c'
            }))
          }
        };
      }
      return window;
    }));
  };

  // الحصول على عنوان النافذة
  const getWindowTitle = (type, parentName = '') => {
    switch (type) {
      case 'main':
        return 'إضافة فئة جديدة';
      case 'subcategories':
        return `الفئات الفرعية: ${parentName}`;
      case 'nested':
        return `الفئات الفرعية لـ: ${parentName}`;
      default:
        return 'نافذة جديدة';
    }
  };

  // تحديث بيانات النافذة
  const updateWindowData = (windowId, field, value) => {
    setOpenWindows(prev => prev.map(window => {
      if (window.id === windowId) {
        return {
          ...window,
          data: {
            ...window.data,
            [field]: value,
            isDirty: true
          }
        };
      }
      return window;
    }));
  };

  // تحديث بيانات الفئة الفرعية
  const updateSubcategoryInWindow = (windowId, subIndex, field, value) => {
    setOpenWindows(prev => prev.map(window => {
      if (window.id === windowId) {
        const updatedSubcategories = window.data.subcategories.map((sub, i) => 
          i === subIndex ? { ...sub, [field]: value } : sub
        );
        return {
          ...window,
          data: {
            ...window.data,
            subcategories: updatedSubcategories,
            isDirty: true
          }
        };
      }
      return window;
    }));
  };

  // إضافة فئة فرعية جديدة مع حفظ المستوى الهرمي
  const addSubcategoryToWindow = (windowId, parentSubcategoryIndex = null) => {
    setOpenWindows(prev => prev.map(window => {
      if (window.id === windowId) {
        const newSubcategory = {
          id: `temp_${Date.now()}`,
          name: '',
          description: '',
          color: '#fb923c',
          isEditing: true,
          isNew: true,
          tempName: '',
          tempDescription: '',
          tempColor: '#fb923c',
          // معلومات المستوى الهرمي
          parentSubcategoryIndex: window.data.parentSubcategoryIndex, // الفئة الفرعية الأب في المستوى السابق
          level: window.data.level || 1, // مستوى النافذة
          children: [] //_children فارغة لأن هذه فئة جديدة
        };
        
        // إضافة الفئة الفرعية في المستوى الحالي (النافذة الحالية)
        const updatedSubcategories = [...window.data.subcategories, newSubcategory];
        
        return {
          ...window,
          data: {
            ...window.data,
            subcategories: updatedSubcategories,
            isDirty: true
          }
        };
      }
      return window;
    }));
  };

  // حفظ الفئة الفرعية
  const saveSubcategoryInWindow = (windowId, subIndex) => {
    const window = openWindows.find(w => w.id === windowId);
    if (!window) return;

    // منع الحفظ المباشر في النوافذ المتداخلة - سيتم الحفظ من النافذة الرئيسية فقط
    if (window.data.level > 1) {
      showError('لا يمكن حفظ الفئات الفرعية مباشرة في النوافذ المتداخلة. يرجى العودة إلى النافذة الرئيسية لحفظ جميع البيانات معاً.');
      return;
    }

    const subcategory = window.data.subcategories[subIndex];
    if (!subcategory.tempName?.trim()) {
      showError('يرجى إدخال اسم الفئة الفرعية');
      return;
    }

    try {
      if (subcategory.isNew) {
        // إضافة فئة جديدة
        addSubcategory(window.parentId, {
          name: subcategory.tempName.trim(),
          description: subcategory.tempDescription || '',
          color: subcategory.tempColor
        });
        showSuccess(`تم إضافة "${subcategory.tempName}" بنجاح`);
      } else {
        // تحديث فئة موجودة
        updateCategory(subcategory.id, {
          name: subcategory.tempName.trim(),
          description: subcategory.tempDescription || '',
          color: subcategory.tempColor
        });
        showSuccess(`تم تحديث "${subcategory.tempName}" بنجاح`);
      }

      // إعادة تحميل البيانات
      loadSubcategoriesData(windowId, window.parentId);
      
    } catch (error) {
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  // حذف الفئة الفرعية
  const deleteSubcategoryFromWindow = (windowId, subIndex) => {
    const window = openWindows.find(w => w.id === windowId);
    if (!window) return;

    const subcategory = window.data.subcategories[subIndex];
    if (!subcategory.isNew) {
      showError('لا يمكن حذف فئة موجودة من هذه الواجهة');
      return;
    }

    setOpenWindows(prev => prev.map(w => {
      if (w.id === windowId) {
        const updatedSubcategories = w.data.subcategories.filter((_, i) => i !== subIndex);
        return {
          ...w,
          data: {
            ...w.data,
            subcategories: updatedSubcategories,
            isDirty: true
          }
        };
      }
      return w;
    }));
  };

  // فتح نافذة فئة رئيسية جديدة
  const openMainCategoryWindow = () => {
    openNewWindow('main');
  };

  // فتح نافذة فئات فرعية (نافذة جديدة منفصلة)
  const openSubcategoriesWindow = (parentId, parentName) => {
    openNewWindow('subcategories', parentId, parentName, false);
  };

  // فتح نافذة فئات فرعية متداخلة (نافذة جديدة منفصلة)
  const openNestedWindow = (parentId, parentName) => {
    openNewWindow('nested', parentId, parentName, false);
  };

  // حفظ الفئة الرئيسية مع جميع البيانات الهرمية
  const saveMainCategory = (windowId) => {
    const window = openWindows.find(w => w.id === windowId);
    if (!window) return;

    const { categoryData, subcategories } = window.data;
    if (!categoryData.name.trim()) {
      showError('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      // فلترة وتنسيق الفئات الفرعية مع الحفاظ على الهيكل الهرمي
      const formatSubcategoriesRecursively = (subs) => {
        return subs
          .filter(sub => sub.tempName && sub.tempName.trim())
          .map(sub => ({
            name: sub.tempName.trim(),
            description: sub.tempDescription || '',
            color: sub.tempColor || '#fb923c',
            // حفظ الأطفال بشكل هرمي
            children: sub.children ? formatSubcategoriesRecursively(sub.children) : [],
            subcategories: sub.subcategories ? formatSubcategoriesRecursively(sub.subcategories) : []
          }));
      };
      
      const validSubcategories = formatSubcategoriesRecursively(subcategories);
      
      // حساب إجمالي عدد الفئات الفرعية عبر جميع المستويات
      const countTotalSubcategories = (subs) => {
        let total = subs.length;
        subs.forEach(sub => {
          if (sub.children && sub.children.length > 0) {
            total += countTotalSubcategories(sub.children);
          }
          if (sub.subcategories && sub.subcategories.length > 0) {
            total += countTotalSubcategories(sub.subcategories);
          }
        });
        return total;
      };
      
      const totalSubcategoriesCount = countTotalSubcategories(validSubcategories);
      
      if (validSubcategories.length > 0) {
        // حفظ الفئة الرئيسية مع الفئات الفرعية
        addCategoryWithSubcategories(categoryData, validSubcategories);
        showSuccess(`تم إنشاء الفئة "${categoryData.name}" مع ${validSubcategories.length} فئات فرعية رئيسية (إجمالي: ${totalSubcategoriesCount} فئة فرعية)`);
      } else {
        // حفظ الفئة الرئيسية فقط
        addCategory(categoryData);
        showSuccess('تم إضافة الفئة الرئيسية بنجاح');
      }

      closeWindow(windowId);
      
    } catch (error) {
      console.error('خطأ في حفظ الفئة:', error);
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  // ======================================
  // النظام القديم (للاستخدام المؤقت)
  // ======================================
  const openCategoryModal = (level = 0, parentId = null) => {
    setCurrentModalLevel(level);
    setModalParentId(parentId);
    setModalCategoryData({ name: '', description: '', color: '#fb923c' });
    setModalSubcategories([]);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setCurrentModalLevel(0);
    setModalParentId(null);
    setModalCategoryData({ name: '', description: '', color: '#fb923c' });
    setModalSubcategories([]);
  };

  const handleModalSubmit = () => {
    if (!modalCategoryData.name.trim()) {
      showError('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      if (currentModalLevel === 0) {
        // إضافة فئة رئيسية
        if (modalSubcategories.length > 0) {
          const validSubcategories = modalSubcategories.filter(sub => sub.name && sub.name.trim());
          if (validSubcategories.length > 0) {
            addCategoryWithSubcategories(modalCategoryData, validSubcategories);
            showSuccess(`تم إنشاء الفئة "${modalCategoryData.name}" مع ${validSubcategories.length} مجموعات فرعية`);
          } else {
            addCategory(modalCategoryData);
            showSuccess('تم إضافة الفئة الرئيسية بنجاح');
          }
        } else {
          addCategory(modalCategoryData);
          showSuccess('تم إضافة الفئة الرئيسية بنجاح');
        }
      } else {
        // إضافة فئة فرعية
        addSubcategory(modalParentId, {
          name: modalCategoryData.name.trim(),
          description: modalCategoryData.description || '',
          color: modalCategoryData.color
        });
        showSuccess('تم إضافة المجموعة الفرعية بنجاح');
      }
      closeCategoryModal();
    } catch (error) {
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  const getModalTitle = () => {
    if (currentModalLevel === 0) return 'إضافة فئة جديدة';
    if (currentModalLevel === 1) return 'إضافة فئات فرعية';
    return `فئات فرعية لـ: ${categories.find(c => c.id === modalParentId)?.name || 'الفئة'}`;
  };

  const addModalSubcategory = () => {
    setModalSubcategories([...modalSubcategories, { name: '', description: '', color: '#fb923c' }]);
  };

  const removeModalSubcategory = (index) => {
    setModalSubcategories(modalSubcategories.filter((_, i) => i !== index));
  };

  const updateModalSubcategory = (index, field, value) => {
    setModalSubcategories(modalSubcategories.map((sub, i) => 
      i === index ? { ...sub, [field]: value } : sub
    ));
  };

  const openSubcategoriesModal = (categoryId, categoryName) => {
    // فتح نافذة إدارة الفئات الفرعية لفئة معينة
    setCurrentModalLevel(2);
    setModalParentId(categoryId);
    setModalCategoryData({ name: categoryName, description: '', color: '#fb923c' });
    
    // جلب الفئات الفرعية للفئة المحددة
    const subcategories = getSubcategories(categoryId);
    setModalSubcategories(subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      description: sub.description || '',
      color: sub.color || '#fb923c'
    })));
    
    setShowCategoryModal(true);
  };

  const addNewSubcategoryToCurrent = () => {
    if (currentModalLevel === 2) {
      // إضافة فئة فرعية جديدة للفئة الحالية
      const newSubcategory = {
        name: '',
        description: '',
        color: '#fb923c',
        isNew: true
      };
      setModalSubcategories([...modalSubcategories, newSubcategory]);
    }
  };

  const handleSubcategorySave = (index) => {
    const subcategory = modalSubcategories[index];
    if (!subcategory.name.trim()) {
      showError('يرجى إدخال اسم الفئة الفرعية');
      return;
    }

    try {
      if (subcategory.isNew) {
        // إضافة فئة فرعية جديدة
        addSubcategory(modalParentId, {
          name: subcategory.name.trim(),
          description: subcategory.description || '',
          color: subcategory.color
        });
        showSuccess(`تم إضافة "${subcategory.name}" بنجاح`);
      } else {
        // تعديل فئة فرعية موجودة
        updateCategory(subcategory.id, {
          name: subcategory.name.trim(),
          description: subcategory.description || '',
          color: subcategory.color
        });
        showSuccess(`تم تحديث "${subcategory.name}" بنجاح`);
      }
      
      // إعادة تحديث القائمة
      const subcategories = getSubcategories(modalParentId);
      setModalSubcategories(subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description || '',
        color: sub.color || '#fb923c'
      })));
      
    } catch (error) {
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  const handleSubcategoryDelete = (index) => {
    const subcategory = modalSubcategories[index];
    if (!subcategory.isNew) {
      showError('لا يمكن حذف فئة فرعية موجودة من هذه الواجهة');
      return;
    }
    
    removeModalSubcategory(index);
  };

  // الحصول على الفئات الرئيسية والمجموعات الفرعية
  const mainCategories = getMainCategories();
  const categoryTree = getCategoryTree();
  const categoryTreeRecursive = getCategoryTreeRecursive();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#fb923c', // اللون البرتقالي الافتراضي
    parentId: null // دعم الفئات المتداخلة
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set()); // للفئات المتوسعة
  const [viewMode, setViewMode] = useState('tree'); // 'tree' أو 'list'
  
  // نافذة إضافة الفئة الشاملة - التصميم الجديد
  // نظام النوافذ المتعددة الجديد
  const [openWindows, setOpenWindows] = useState([]); // Array من النوافذ المفتوحة
  const [nextWindowId, setNextWindowId] = useState(1);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [windowHistory, setWindowHistory] = useState([]); // تاريخ التنقل بين النوافذ
  const [navigationStack, setNavigationStack] = useState([]); // مكدس التنقل للعودة
  
  // متغيرات النافذة الواحدة (للاستخدام عند الحاجة)
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [currentModalLevel, setCurrentModalLevel] = useState(0); // 0: رئيسية, 1: فرعية, 2: فرعية فرعية
  const [modalParentId, setModalParentId] = useState(null);
  const [modalCategoryData, setModalCategoryData] = useState({ name: '', description: '', color: '#fb923c' });
  const [modalSubcategories, setModalSubcategories] = useState([]);
  
  // توسيع تلقائي للفئات عند البحث
  React.useEffect(() => {
    if (searchTerm && viewMode === 'tree' && categoryTreeRecursive.length > 0) {
      const newExpanded = new Set();
      const hasSearchMatchInTree = (cat) => {
        if (cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        const children = cat.children || cat.subcategories || [];
        return children.some(child => hasSearchMatchInTree(child));
      };
      
      const expandWithSearch = (cat) => {
        if (cat.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          newExpanded.add(cat.id);
        }
        (cat.children || cat.subcategories || []).forEach(expandWithSearch);
      };
      
      categoryTreeRecursive.forEach(expandWithSearch);
      setExpandedCategories(newExpanded);
    }
  }, [searchTerm, viewMode]); // إزالة categoryTreeRecursive من dependencies
  
  // حالة النافذة المنبثقة للفئات الفرعية
  const [showSubcategoriesModal, setShowSubcategoriesModal] = useState(false);
  const [subcategoriesData, setSubcategoriesData] = useState([
    { name: '', description: '', color: '#fb923c' }
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hasPermission(editingId ? 'edit_category' : 'add_category')) {
      showError(`ليس لديك صلاحية ${editingId ? 'تعديل' : 'إضافة'} الفئات`);
      return;
    }
    
    if (!formData.name.trim()) {
      showError('يرجى إدخال اسم الفئة');
      return;
    }

    try {
      if (editingId) {
        updateCategory(editingId, formData);
        showSuccess('تم تحديث الفئة بنجاح');
        setEditingId(null);
      } else {
        // التحقق من نوع الإضافة (فئة رئيسية أم فرعية)
        const isMainCategory = formData.parentId === null;
        const validSubcategories = subcategoriesData.filter(sub => sub.name && sub.name.trim());
        
        if (isMainCategory && validSubcategories.length > 0) {
          // إنشاء فئة رئيسية مع مجموعاتها الفرعية
          const cleanedSubcategories = validSubcategories.map(sub => ({
            name: sub.name.trim(),
            description: sub.description || '',
            color: sub.color || '#fb923c'
          }));
          
          const result = addCategoryWithSubcategories({
            name: formData.name.trim(),
            description: formData.description || '',
            color: formData.color
          }, cleanedSubcategories);
          
          showSuccess(`تم إنشاء الفئة "${result.mainCategory.name}" مع ${result.subcategories.length} مجموعات فرعية بنجاح`);
        } else {
          // إضافة فئة واحدة (رئيسية أو فرعية)
          if (isMainCategory) {
            addCategory(formData);
            showSuccess('تم إضافة الفئة الرئيسية بنجاح');
          } else {
            addSubcategory(formData.parentId, {
              name: formData.name.trim(),
              description: formData.description || '',
              color: formData.color
            });
            showSuccess('تم إضافة المجموعة الفرعية بنجاح');
          }
        }
      }
      
      // إعادة تعيين النماذج
      setFormData({
        name: '',
        description: '',
        color: '#fb923c',
        parentId: null
      });
      setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  const handleEdit = (category) => {
    if (!hasPermission('edit_category')) {
      showError('ليس لديك صلاحية تعديل الفئات');
      return;
    }
    
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#fb923c',
      parentId: category.parentId || null
    });
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id, name) => {
    if (!hasPermission('delete_category')) {
      showError('ليس لديك صلاحية حذف الفئات');
      return;
    }
    
    const subcategories = getSubcategories(id);
    const hasSubcategories = subcategories.length > 0;
    
    if (hasSubcategories) {
      showError(`لا يمكن حذف الفئة "${name}" لأنها تحتوي على ${subcategories.length} مجموعة فرعية. يرجى حذف المجموعات الفرعية أولاً.`);
      return;
    }
    
    showConfirm(
      'حذف الفئة',
      `هل أنت متأكد من حذف الفئة "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
      () => {
        try {
          deleteCategory(id);
          showSuccess('تم حذف الفئة بنجاح');
        } catch (error) {
          showError(error.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
        }
      },
      {
        type: 'danger',
        confirmText: 'حذف الفئة',
        cancelText: 'إلغاء'
      }
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      color: '#fb923c',
      parentId: null
    });
    setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
  };

  // دوال إدارة النافذة المنبثقة للفئات الفرعية
  const handleAddSubcategoryField = () => {
    setSubcategoriesData([...subcategoriesData, { 
      name: '', 
      description: '', 
      color: '#fb923c' 
    }]);
  };

  const handleRemoveSubcategoryField = (index) => {
    if (subcategoriesData.length > 1) {
      const updated = subcategoriesData.filter((_, i) => i !== index);
      setSubcategoriesData(updated);
    }
  };

  const handleSubcategoryChange = (index, field, value) => {
    const updated = subcategoriesData.map((sub, i) => 
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubcategoriesData(updated);
  };

  const handleOpenSubcategoriesModal = () => {
    setShowSubcategoriesModal(true);
  };

  const handleSaveSubcategories = () => {
    // إغلاق النافذة (البيانات محفوظة بالفعل في subcategoriesData)
    setShowSubcategoriesModal(false);
  };

  const handleCloseSubcategoriesModal = () => {
    setShowSubcategoriesModal(false);
    setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }]);
  };

  // فلترة الفئات حسب البحث
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دالة رسم عنصر الفئة مع دعم متعدد المستويات
  const renderCategoryItem = (category, level = 0, isSubcategory = false) => {
    const children = category.children || category.subcategories || []; // دعم كلا الشكلين
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const marginClass = level > 0 ? `mr-${level * 2}` : '';

    // حساب عدد المستويات الفرعية الإجمالي
    const countAllSubcategories = (cat) => {
      const directChildren = cat.children || cat.subcategories || [];
      if (directChildren.length === 0) return 0;
      
      let total = directChildren.length;
      directChildren.forEach(child => {
        total += countAllSubcategories(child);
      });
      return total;
    };

    const totalSubcategories = countAllSubcategories(category);

    return (
      <div key={category.id} className={`${marginClass} mb-1`}>
        <div className="flex items-center justify-between p-1.5 rounded border border-gray-200 hover:border-gray-300 transition-all bg-white">
          <div className="flex items-center gap-2 flex-1">
            {/* أيقونة التوسيع */}
            {hasChildren ? (
              <button
                onClick={() => toggleCategoryExpansion(category.id)}
                className="p-0.5 hover:bg-gray-100 rounded text-xs"
              >
                {isExpanded ? 
                  <FaChevronDown className="text-gray-600 text-xs" /> : 
                  <FaChevronRight className="text-gray-600 text-xs" />
                }
              </button>
            ) : (
              <div className="w-3"></div>
            )}

            {/* أيقونة الفئة */}
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
              style={{ backgroundColor: category.color || '#fb923c' }}
            >
              {isExpanded && hasChildren ? <FaFolderOpen /> : <FaFolder />}
            </div>

            {/* معلومات الفئة */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                {level > 0 && (
                  <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    مستوى {level}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</span>
                {isSubcategory && <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">فرعية</span>}
                {hasChildren && (
                  <span className="px-1 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                    {totalSubcategories} فرعية
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-xs text-gray-600">{category.description}</p>
              )}
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-1">
            {hasPermission('edit_category') && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaPlus />}
                  onClick={() => openSubcategoriesModal(category.id, category.name)}
                  title="إدارة الفئات الفرعية"
                  className="text-xs px-1 py-0.5"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FaEdit />}
                  onClick={() => handleEdit(category)}
                  title="تعديل"
                  className="text-xs px-1 py-0.5"
                />
              </>
            )}
            {hasPermission('delete_category') && (
              <Button
                variant="danger"
                size="sm"
                icon={<FaTrash />}
                onClick={() => handleDelete(category.id, category.name)}
                title="حذف"
                className="text-xs px-1 py-0.5"
              />
            )}
            {!hasPermission('edit_category') && !hasPermission('delete_category') && (
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <FaLock className="text-xs" />
              </div>
            )}
          </div>
        </div>

        {/* المجموعات الفرعية */}
        {isExpanded && hasChildren && (
          <div className="mt-1 border-l-2 border-gray-200 pl-2">
            {children.map(child => 
              renderCategoryItem(child, level + 1, true)
            )}
          </div>
        )}
      </div>
    );
  };

  // ألوان مقترحة
  // الألوان المقترحة للنوافذ الجديدة
  const suggestedColors = [
    { name: 'برتقالي', value: '#fb923c' },
    { name: 'أزرق', value: '#3b82f6' },
    { name: 'أخضر', value: '#10b981' },
    { name: 'أحمر', value: '#ef4444' },
    { name: 'بنفسجي', value: '#8b5cf6' },
    { name: 'وردي', value: '#ec4899' },
    { name: 'أصفر', value: '#f59e0b' },
    { name: 'رمادي', value: '#6b7280' }
  ];

  return (
    <div className="p-2">
      {/* زر إضافة الفئة الجديد - التصميم المحدث */}
      {hasPermission('manage_categories') && (
        <div className="mb-4">
          <Button
            variant="success"
            size="sm"
            icon={<FaPlus />}
            onClick={openMainCategoryWindow}
            className="px-3 py-2 text-sm font-medium"
          >
            إضافة فئة جديدة
          </Button>
        </div>
      )}

      {/* النافذة المنبثقة الشاملة للفئات */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-auto max-h-[95vh] overflow-hidden">
            {/* رأس النافذة */}
            <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">{getModalTitle()}</h3>
              <button
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-160px)]">
              {currentModalLevel === 0 ? (
                // النافذة الرئيسية - إضافة فئة جديدة
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الفئة الرئيسية
                    </label>
                    <input
                      type="text"
                      value={modalCategoryData.name}
                      onChange={(e) => setModalCategoryData({...modalCategoryData, name: e.target.value})}
                      placeholder="أدخل اسم الفئة..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوصف (اختياري)
                    </label>
                    <textarea
                      value={modalCategoryData.description}
                      onChange={(e) => setModalCategoryData({...modalCategoryData, description: e.target.value})}
                      placeholder="وصف الفئة..."
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اللون
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {suggestedColors.map(color => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setModalCategoryData({...modalCategoryData, color: color.value})}
                          className={`w-8 h-8 rounded-full border-2 ${
                            modalCategoryData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        الفئات الفرعية
                      </label>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<FaPlus />}
                        onClick={addModalSubcategory}
                        className="text-sm px-3 py-1.5"
                      >
                        إضافة
                      </Button>
                    </div>
                    
                    {modalSubcategories.length > 0 && (
                      <div className="space-y-3">
                        {modalSubcategories.map((sub, index) => (
                          <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-md">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => updateModalSubcategory(index, 'name', e.target.value)}
                              placeholder={`فئة فرعية ${index + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => removeModalSubcategory(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // نافذة إدارة الفئات الفرعية
                <div className="space-y-6">
                  {modalSubcategories.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FaFolder className="text-5xl mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">لا توجد فئات فرعية</p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        icon={<FaPlus />}
                        onClick={addNewSubcategoryToCurrent}
                        className="mt-3 px-4 py-2"
                      >
                        إضافة فئة فرعية جديدة
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800 text-lg">
                          {modalSubcategories.length} فئة فرعية
                        </h4>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<FaPlus />}
                          onClick={addNewSubcategoryToCurrent}
                          className="text-sm px-3 py-1.5"
                        >
                          إضافة جديدة
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {modalSubcategories.map((sub, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-4">
                              <div
                                className="w-4 h-4 rounded mt-1 flex-shrink-0"
                                style={{ backgroundColor: sub.color }}
                              />
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={sub.name}
                                  onChange={(e) => {
                                    const newSubcategories = [...modalSubcategories];
                                    newSubcategories[index].name = e.target.value;
                                    setModalSubcategories(newSubcategories);
                                  }}
                                  placeholder="اسم الفئة الفرعية"
                                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-medium"
                                />
                                <textarea
                                  value={sub.description || ''}
                                  onChange={(e) => {
                                    const newSubcategories = [...modalSubcategories];
                                    newSubcategories[index].description = e.target.value;
                                    setModalSubcategories(newSubcategories);
                                  }}
                                  placeholder="الوصف (اختياري)"
                                  rows="2"
                                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded text-sm text-gray-600"
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                {!sub.isNew && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    icon={<FaFolder />}
                                    onClick={() => openSubcategoriesModal(sub.id, sub.name)}
                                    className="text-sm px-3 py-1.5"
                                    title="إدارة الفئات الفرعية"
                                  />
                                )}
                                <Button
                                  type="button"
                                  variant="success"
                                  size="sm"
                                  icon={<FaSave />}
                                  onClick={() => handleSubcategorySave(index)}
                                  className="text-sm px-3 py-1.5"
                                  title="حفظ"
                                />
                                {sub.isNew && (
                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    icon={<FaTrash />}
                                    onClick={() => handleSubcategoryDelete(index)}
                                    className="text-sm px-3 py-1.5"
                                    title="حذف"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* أزرار النافذة */}
            <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
              <div className="flex gap-2">
                {currentModalLevel > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<FaArrowUp />}
                    onClick={() => openCategoryModal(0, null)}
                    className="px-3 py-2 text-sm"
                  >
                    الرئيسية
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-sm"
                >
                  إلغاء
                </Button>
                {currentModalLevel === 0 && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={<FaSave />}
                    onClick={handleModalSubmit}
                    className="px-4 py-2 text-sm"
                  >
                    حفظ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نموذج إضافة/تعديل الفئة القديم - مخفي مؤقتاً */}
      {false && hasPermission('manage_categories') && (
        <div className="bg-white border border-gray-300 rounded-sm p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <FaTags className="text-sm text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              {editingId 
                ? 'تعديل الفئة' 
                : formData.parentId 
                  ? `إضافة فئة فرعية جديدة` 
                  : 'إضافة فئة جديدة'
              }
            </h2>
            {formData.parentId && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                المستوى {categoryTreeRecursive.find(cat => cat.id === formData.parentId) ? 
                  (categoryTreeRecursive.find(cat => cat.id === formData.parentId).level || 0) + 1 : '...'}
              </span>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="اسم الفئة..."
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-400 focus:outline-none"
                required
              />
              {!formData.parentId && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={<FaFolder />}
                  onClick={handleOpenSubcategoriesModal}
                  disabled={!formData.name.trim() || editingId !== null}
                  className="px-2 py-1 text-xs"
                >
                  فئات فرعية
                </Button>
              )}
            </div>
            
            {/* عرض الفئات الفرعية المحددة */}
            {subcategoriesData.some(sub => sub.name.trim()) && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <FaIndent className="text-xs text-blue-600" />
                  <span className="text-xs font-medium text-blue-800">
                    {subcategoriesData.filter(sub => sub.name.trim()).length} مجموعات فرعية
                  </span>
                </div>
                <div className="space-y-0.5">
                  {subcategoriesData
                    .filter(sub => sub.name.trim())
                    .map((sub, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: sub.color }}
                        ></div>
                        <span>{sub.name}</span>
                      </div>
                    ))
                  }
                </div>
                <button
                  type="button"
                  onClick={() => setSubcategoriesData([{ name: '', description: '', color: '#fb923c' }])}
                  className="text-xs text-red-600 hover:text-red-800 mt-1"
                >
                  مسح الكل
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant={editingId ? "primary" : "success"} 
                size="sm" 
                icon={editingId ? <FaEdit /> : <FaPlus />}
                className="px-2 py-1 text-xs"
              >
                {editingId ? 'تحديث' : (formData.parentId ? 'إضافة فئة فرعية' : 'إضافة')}
              </Button>
              <Button type="button" variant="secondary" size="sm" icon={<FaTimes />} onClick={handleCancel} className="px-2 py-1 text-xs">
                إلغاء
              </Button>
              {formData.parentId && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  icon={<FaArrowUp />} 
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs"
                  title="العودة للإضافة الرئيسية"
                >
                  الرئيسية
                </Button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* قائمة الفئات */}
      <div className="bg-white border border-gray-300 rounded-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-800">
              الفئات ({categories.length})
            </h2>
            <div className="flex gap-1 text-xs text-gray-600">
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                {mainCategories.length} رئيسية
              </span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                {categories.filter(c => c.parentId).length} فرعية
              </span>
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                {(() => {
                  // حساب عدد المستويات الإجمالي
                  const countLevels = (tree, maxLevel = 0) => {
                    let currentMax = maxLevel;
                    tree.forEach(category => {
                      const subcategories = getSubcategories(category.id);
                      if (subcategories.length > 0) {
                        const childMax = countLevels(subcategories, maxLevel + 1);
                        currentMax = Math.max(currentMax, childMax);
                      } else {
                        currentMax = Math.max(currentMax, maxLevel);
                      }
                    });
                    return currentMax;
                  };
                  const maxLevel = countLevels(categoryTreeRecursive);
                  return `${maxLevel + 1} مستويات`;
                })()}
              </span>
            </div>
          </div>
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-32 px-2 py-1 border border-gray-300 rounded text-xs focus:border-blue-400 focus:outline-none"
          />
        </div>

        {viewMode === 'tree' ? (
          /* العرض الشجري */
          <div className="space-y-1 p-2">
            {(() => {
              // فلترة شاملة للفئات التي تحتوي على نتائج بحث
              const filterCategoriesWithSearch = (tree) => {
                const hasSearchMatch = (cat) => {
                  if (cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
                  const children = cat.children || cat.subcategories || [];
                  return children.some(child => hasSearchMatch(child));
                };

                return tree.filter(hasSearchMatch);
              };

              const filteredTree = searchTerm ? filterCategoriesWithSearch(categoryTreeRecursive) : categoryTreeRecursive;

              return filteredTree.length === 0 ? (
                <div className="text-center py-8">
                  <FaSitemap className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'لا توجد فئات مطابقة' : 'لا توجد فئات بعد!'}
                  </p>
                </div>
              ) : (
                filteredTree.map(category => renderCategoryItem(category))
              );
            })()}
          </div>
        ) : (
          /* العرض العادي */
          <div className="p-2">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <FaTags className="text-4xl text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'لا توجد فئات مطابقة' : 'لا توجد فئات بعد!'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {(() => {
                  // إنشاء مصفوفة مسطحة مع معلومات المستوى
                  const buildFlatList = (tree, level = 0) => {
                    let flatList = [];
                    tree.forEach(category => {
                      const subcategories = getSubcategories(category.id);
                      flatList.push({ ...category, level });
                      if (subcategories.length > 0) {
                        flatList = flatList.concat(buildFlatList(subcategories, level + 1));
                      }
                    });
                    return flatList;
                  };

                  const flatList = buildFlatList(categoryTreeRecursive);

                  return flatList
                    .filter(category => {
                      if (!searchTerm) return true;
                      return category.name.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .map((category) => {
                      const isSubcategory = category.parentId;
                      const indentLevel = category.level * 16; // 16px لكل مستوى

                      return (
                        <div
                          key={category.id}
                          className={`p-2 rounded border transition-all ${
                            isSubcategory 
                              ? 'border-blue-200 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          style={{ marginLeft: `${indentLevel}px` }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: category.color || '#fb923c' }}
                            >
                              {isSubcategory ? <FaIndent /> : <FaTags />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                                {category.level > 0 && (
                                  <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                    مستوى {category.level}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{new Date(category.createdAt).toLocaleDateString('ar-EG')}</span>
                                {isSubcategory && (
                                  <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    فرعية
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {category.description && (
                            <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                          )}

                          <div className="flex gap-1">
                            {hasPermission('edit_category') && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<FaPlus />}
                                  onClick={() => openSubcategoriesWindow(category.id, category.name)}
                                  className="flex-1 text-xs px-1 py-0.5"
                                  title="إدارة الفئات الفرعية"
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<FaEdit />}
                                  onClick={() => handleEdit(category)}
                                  className="flex-1 text-xs px-1 py-0.5"
                                />
                              </>
                            )}
                            {hasPermission('delete_category') && (
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<FaTrash />}
                                onClick={() => handleDelete(category.id, category.name)}
                                className="flex-1 text-xs px-1 py-0.5"
                              />
                            )}
                            {!hasPermission('edit_category') && !hasPermission('delete_category') && (
                              <div className="flex items-center gap-1 text-gray-400 text-xs w-full justify-center py-1">
                                <FaLock className="text-xs" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            )}
          </div>
        )}
      </div>



      {/* ====================================== */}
      {/* نظام النوافذ المتعددة الجديد */}
      {/* ====================================== */}
      {openWindows.map(window => (
        <MultiWindow
          key={window.id}
          window={window}
          isActive={activeWindowId === window.id}
          onClose={() => closeWindow(window.id)}
          onActivate={() => activateWindow(window.id)}
          onUpdateData={(field, value) => updateWindowData(window.id, field, value)}
          onUpdateSubcategory={(subIndex, field, value) => updateSubcategoryInWindow(window.id, subIndex, field, value)}
          onAddSubcategory={() => addSubcategoryToWindow(window.id)}
          onSaveSubcategory={(subIndex) => saveSubcategoryInWindow(window.id, subIndex)}
          onDeleteSubcategory={(subIndex) => deleteSubcategoryFromWindow(window.id, subIndex)}
          onSaveMainCategory={() => saveMainCategory(window.id)}
          onOpenNestedWindow={(parentName, parentId, parentIndex) => switchToNestedWindow(parentId, parentName, parentIndex)}
          onSwitchToSubcategories={(parentName) => switchToSubcategoriesWindow(window.data.categoryData.name ? window.id : null, parentName)}
          onGoBack={() => goBackToPreviousWindow()}
          navigationPath={getNavigationPath()}
          categories={categories}
          getSubcategories={getSubcategories}
          suggestedColors={suggestedColors}
        />
      ))}
    </div>
  );
};

// ======================================
// مكون النوافذ المتعددة
// ======================================
const MultiWindow = ({
  window,
  isActive,
  onClose,
  onActivate,
  onUpdateData,
  onUpdateSubcategory,
  onAddSubcategory,
  onSaveSubcategory,
  onDeleteSubcategory,
  onSaveMainCategory,
  onOpenNestedWindow,
  onSwitchToSubcategories,
  onGoBack,
  navigationPath,
  categories,
  getSubcategories,
  suggestedColors
}) => {
  const windowStyle = {
    position: 'fixed',
    top: window.position.y,
    left: window.position.x,
    width: window.size.width,
    height: window.size.height,
    zIndex: isActive ? 1000 : 900,
    boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 3px -1px rgba(0, 0, 0, 0.1)'
  };

  return (
    <div 
      style={windowStyle}
      className={`bg-white rounded border transition-all duration-200 ${
        isActive ? 'border-gray-400' : 'border-gray-200'
      }`}
      onClick={onActivate}
    >
      {/* رأس النافذة */}
      <div className={`rounded-t border-b ${isActive ? 'bg-gray-50 text-gray-800' : 'bg-white text-gray-600'}`}>
        {/* شريط التنقل */}
        {navigationPath && navigationPath.length > 1 && (
          <div className={`px-2 py-1 border-b ${
            isActive ? 'border-gray-300' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2 text-xs">
              {navigationPath.map((pathItem, index) => (
                <div key={pathItem.id} className="flex items-center gap-1">
                  {index > 0 && <span className="text-gray-400">›</span>}
                  <span 
                    className={`cursor-pointer hover:underline ${
                      index === navigationPath.length - 1 
                        ? (isActive ? 'text-white font-medium' : 'text-gray-900 font-medium')
                        : (isActive ? 'text-blue-200' : 'text-gray-600')
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // يمكن إضافة وظيفة للانتقال إلى نقطة معينة في المسار
                    }}
                  >
                    {pathItem.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* شريط الأدوات العلوي */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-white' : 'bg-gray-400'
            }`}></div>
            <h3 className="font-semibold text-sm">{window.title}</h3>
            {window.type !== 'main' && (
              <span className={`px-2 py-0.5 rounded text-xs ${
                isActive ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {window.type === 'subcategories' ? '2' : '3+'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* زر العودة */}
            {navigationPath && navigationPath.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGoBack();
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  isActive 
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="العودة إلى النافذة السابقة"
              >
                ← رجوع
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`w-6 h-6 rounded flex items-center justify-center text-sm transition-colors ${
                isActive 
                  ? 'hover:bg-red-500 text-white' 
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* محتوى النافذة */}
      <div className="p-3 overflow-y-auto" style={{ height: window.size.height - 100 }}>
        
        {/* نافذة الفئة الرئيسية */}
        {window.type === 'main' && (
          <div className="space-y-4">
            {/* معلومات الفئة الرئيسية */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  اسم الفئة الرئيسية
                </label>
                <input
                  type="text"
                  value={window.data.categoryData.name}
                  onChange={(e) => onUpdateData('categoryData', {
                    ...window.data.categoryData,
                    name: e.target.value
                  })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  placeholder="أدخل اسم الفئة الرئيسية..."
                />
              </div>
            </div>

            {/* قسم إضافة الفئات الفرعية */}
            <div className="border-t pt-4">
              <div className="text-center">
                <div className="mb-3">
                  <div className="text-3xl mb-2">📁</div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    إضافة الفئات الفرعية
                  </h3>
                  <p className="text-xs text-gray-500">
                    اضغط على الزر أدناه لإضافة فئات فرعية لهذه الفئة الرئيسية
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    if (window.data.categoryData.name.trim()) {
                      onSwitchToSubcategories(window.data.categoryData.name);
                    } else {
                      // يمكن إضافة رسالة خطأ هنا
                      alert('يرجى إدخال اسم الفئة الرئيسية أولاً');
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                >
                  ➕ إضافة فئات فرعية
                </button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة الفئات الفرعية */}
        {(window.type === 'subcategories' || window.type === 'nested') && (
          <div className="space-y-3">
            {/* معلومات الفئة الرئيسية */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: categories.find(c => c.id === window.parentId)?.color || '#fb923c' }}
                ></div>
                <h3 className="text-sm font-medium text-gray-700">
                  {window.parentName || 'فئة غير محددة'}
                </h3>
              </div>
              <p className="text-xs text-gray-500">
                إدارة الفئات الفرعية لهذه الفئة
              </p>
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">الفئات الفرعية ({window.data.subcategories.length})</h4>
              <button
                onClick={onAddSubcategory}
                className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
              >
                ➕ إضافة جديدة
              </button>
            </div>

            {window.data.subcategories.length === 0 ? (
              <div className="text-center py-6 text-gray-500 border border-dashed border-gray-300 rounded">
                <div className="text-2xl mb-1">📁</div>
                <p className="text-xs font-medium">لا توجد فئات فرعية</p>
                <p className="text-xs">اضغط "إضافة جديدة" لإنشاء أول فئة فرعية</p>
              </div>
            ) : (
              <div className="space-y-2">
                {window.data.subcategories.map((sub, index) => (
                  <div key={sub.id} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: sub.tempColor || sub.color || '#fb923c' }}
                        ></div>
                        <h5 className="text-sm font-medium text-gray-700">
                          {sub.tempName || sub.name || `فئة جديدة ${index + 1}`}
                        </h5>
                      </div>
                      <div className="flex gap-1">
                        {/* زر الانتقال إلى المستوى التالي */}
                        <button
                          onClick={() => onOpenNestedWindow(sub.tempName || sub.name, sub.id, index)}
                          className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                          title="إضافة فئات فرعية فرعية"
                        >
                          ➕
                        </button>
                        {/* تعطيل زر الحفظ في النوافذ المتداخلة - سيتم الحفظ من النافذة الرئيسية فقط */}
                        {window.data.level === 1 && (
                          <button
                            onClick={() => onSaveSubcategory(index)}
                            className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                          >
                            💾 حفظ
                          </button>
                        )}
                        {sub.isNew && (
                          <button
                            onClick={() => onDeleteSubcategory(index)}
                            className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-600">الاسم</label>
                      <input
                        type="text"
                        value={sub.tempName || sub.name}
                        onChange={(e) => onUpdateSubcategory(index, 'tempName', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        placeholder="اسم الفئة..."
                      />
                    </div>

                    {/* زر الانتقال للمستوى التالي */}
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => onOpenNestedWindow(sub.tempName || sub.name, sub.id, index)}
                        className="w-full px-2 py-1.5 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                      >
                        📁 إضافة فئات فرعية فرعية لهذه الفئة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ذيل النافذة */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {window.data.isDirty && (
            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              ⚠️ غير محفوظ
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onClose}
            className="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-100"
          >
            إغلاق
          </button>
          {window.type === 'main' && (
            <button
              onClick={onSaveMainCategory}
              className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
            >
              حفظ الفئة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;
