// ======================================
// TabBar - شريط التبويبات الحقيقي
// ======================================

import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaPlus, FaSignOutAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTab } from '../../contexts/TabContext';
import ConfirmationModal from '../Common/ConfirmationModal';
import SubscriptionInfo from '../../pages/Subscription/SubscriptionInfo';

const TabBar = () => {
  const { tabs, activeTabId, closeTab, switchTab, openNewTab, reorderTabs, closeAllTabs } = useTab();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCloseAllConfirm, setShowCloseAllConfirm] = useState(false);
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);
  const [dragOverTabIndex, setDragOverTabIndex] = useState(null);
  
  // للتحكم في التمرير
  const tabsContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // التحقق من إمكانية التمرير
  const checkScrollability = () => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollLeft = Math.abs(container.scrollLeft);
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // في RTL حاوية التمرير، scrollLeft قد يكون سالبًا
      setCanScrollLeft(scrollLeft < maxScroll - 1);
      setCanScrollRight(scrollLeft > 1);
    }
  };

  // مراقبة التغييرات في التمرير وعدد التبويبات
  useEffect(() => {
    checkScrollability();
    const container = tabsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [tabs]);

  // التمرير التلقائي للتبويبة النشطة عند فتحها أو التبديل إليها
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container && activeTabId) {
      // البحث عن عنصر التبويبة النشطة
      const activeTabElement = container.querySelector(`[data-tab-id="${activeTabId}"]`);
      
      if (activeTabElement) {
        // التمرير للتبويبة النشطة بشكل ناعم
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center' // محاولة وضعها في المنتصف
        });
      }
    }
  }, [activeTabId]);

  // التمرير عند الضغط على الأسهم
  const scroll = (direction) => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // دوال السحب والإفلات
  const handleDragStart = (e, index, tab) => {
    // منع سحب التبويب الرئيسي
    if (tab.isMain) {
      e.preventDefault();
      return;
    }
    
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    
    // تأثير بصري للعنصر المسحوب
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedTabIndex(null);
    setDragOverTabIndex(null);
  };

  const handleDragOver = (e, index, tab) => {
    e.preventDefault();
    
    // منع الإفلات على التبويب الرئيسي
    if (tab.isMain) {
      return;
    }
    
    setDragOverTabIndex(index);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverTabIndex(null);
  };

  const handleDrop = (e, toIndex, tab) => {
    e.preventDefault();
    
    // منع الإفلات على التبويب الرئيسي
    if (tab.isMain) {
      return;
    }
    
    if (draggedTabIndex !== null && draggedTabIndex !== toIndex) {
      reorderTabs(draggedTabIndex, toIndex);
    }
    
    setDraggedTabIndex(null);
    setDragOverTabIndex(null);
  };

  // معالجة زر إضافة التبويبة
  const handleNewTabClick = () => {
    // ضغطة واحدة: فتح تبويبة جديدة
    openNewTab();
  };

  const handleNewTabDoubleClick = () => {
    // ضغطتين: إظهار تأكيد إغلاق جميع التبويبات
    if (tabs.length > 1) {
      setShowCloseAllConfirm(true);
    }
  };

  const handleCloseAllConfirm = () => {
    closeAllTabs();
    setShowCloseAllConfirm(false);
  };

  const handleCloseAllCancel = () => {
    setShowCloseAllConfirm(false);
  };

  return (
    <>
      <div dir="rtl" className="h-9 flex items-center gap-2 px-3">
        {/* زر التمرير لليسار */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="flex items-center justify-center w-6 h-6 text-orange-600 hover:text-orange-800 bg-white/80 hover:bg-orange-100 rounded-full transition-all shadow-sm flex-shrink-0 z-10"
            title="تمرير لليسار"
          >
            <FaChevronLeft size={10} />
          </button>
        )}

        {/* حاوية التبويبات */}
        <div className="relative flex-1 overflow-hidden">
          {/* تأثير التدرج على اليسار */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100/80 to-transparent z-10 pointer-events-none" />
          )}
          
          {/* التبويبات */}
          <div 
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabs.map((tab, index) => {
              const isActive = tab.id === activeTabId;
              const isDragging = draggedTabIndex === index;
              const isDragOver = dragOverTabIndex === index;
              
              return (
                <div
                  key={tab.id}
                  data-tab-id={tab.id}
                  draggable={!tab.isMain} // التبويب الرئيسي غير قابل للسحب
                  onDragStart={(e) => handleDragStart(e, index, tab)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index, tab)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index, tab)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-t-lg transition-all cursor-pointer group relative
                    min-w-[140px] max-w-[220px] flex-shrink-0
                    ${
                      isActive
                        ? 'bg-white shadow-lg border-t-2 border-l border-r border-orange-500 -mb-[1px] z-10'
                        : 'bg-white/60 hover:bg-white/90 border border-transparent hover:border-orange-300/50 shadow-sm'
                    }
                    ${isDragging ? 'opacity-40 cursor-grabbing' : !tab.isMain ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                    ${isDragOver && !tab.isMain ? 'border-l-4 border-l-orange-500' : ''}
                  `}
                  onClick={() => switchTab(tab.id)}
                  style={{
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    transition: isDragging ? 'transform 0.2s ease' : 'all 0.2s ease'
                  }}
                >
                  {/* أيقونة التبويب */}
                  <span className={`text-base flex-shrink-0 transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}>{tab.icon}</span>
                  
                  {/* عنوان التبويب */}
                  <span 
                    className={`
                      text-sm font-semibold truncate flex-1
                      ${isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-gray-800'}
                    `}
                    title={tab.title}
                  >
                    {tab.title}
                  </span>

                  {/* زر الإغلاق (فقط للتبويبات الإضافية) */}
                  {!tab.isMain && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className={`
                        flex-shrink-0 p-1 rounded-md transition-all
                        ${
                          isActive
                            ? 'text-orange-500 hover:bg-orange-100 hover:text-orange-700'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100'
                        }
                      `}
                      title="إغلاق التبويب"
                    >
                      <FaTimes size={11} />
                    </button>
                  )}

                  {/* مؤشر التبويب النشط */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-t-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* تأثير التدرج على اليمين */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100/80 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {/* زر التمرير لليمين */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="flex items-center justify-center w-6 h-6 text-orange-600 hover:text-orange-800 bg-white/80 hover:bg-orange-100 rounded-full transition-all shadow-sm flex-shrink-0 z-10"
            title="تمرير لليمين"
          >
            <FaChevronRight size={10} />
          </button>
        )}

        {/* معلومات الاشتراك */}
        <div className="flex-shrink-0 ml-1">
          <SubscriptionInfo />
        </div>

        {/* زر تسجيل الخروج */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center justify-center w-9 h-8 text-red-600 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-1 border border-red-200 hover:border-red-400"
          title="تسجيل الخروج (ستظهر رسالة تأكيد)"
        >
          <FaSignOutAlt size={13} className="font-bold" />
        </button>
        {/* زر تبويب جديد */}
        <button
          onClick={handleNewTabClick}
          onDoubleClick={handleNewTabDoubleClick}
          className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white bg-orange-50 hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 rounded-lg transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-1"
          title="ضغطة واحدة: تبويب جديد | ضغطتين: إغلاق جميع التبويبات"
        >
          <FaPlus size={13} className="font-bold" />
        </button>
      </div>
      
      {/* نافذة تأكيد تسجيل الخروج */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد من تسجيل الخروج؟\nسيتم إنهاء جلسة العمل الحالية وجميع البيانات غير المحفوظة قد تُفقد."
        type="warning"
        confirmText="تسجيل الخروج"
        cancelText="البقاء"
      />

      {/* نافذة تأكيد إغلاق جميع التبويبات */}
      <ConfirmationModal
        isOpen={showCloseAllConfirm}
        onClose={handleCloseAllCancel}
        onConfirm={handleCloseAllConfirm}
        title="إغلاق جميع التبويبات"
        message={`هل أنت متأكد من إغلاق جميع التبويبات (${tabs.length - 1} تبويب)؟\nسيتم الاحتفاظ بتبويب لوحة التحكم فقط.`}
        type="warning"
        confirmText="إغلاق الكل"
        cancelText="إلغاء"
      />
    </>
  );
};

export default TabBar;
