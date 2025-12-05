// ======================================
// DOM Utils - أدوات مساعدة آمنة للـ DOM
// ======================================

import React, { useEffect } from 'react';

/**
 * فحص ما إذا كان العنصر هو Node صحيح
 * @param {Element} element - العنصر المراد فحصه
 * @returns {boolean} - true إذا كان العنصر Node صحيح
 */
export const isValidNode = (element) => {
  return element && 
         typeof element === 'object' && 
         typeof element.nodeType === 'number' &&
         element.nodeType === 1; // ELEMENT_NODE
};

/**
 * فحص ما إذا كان العنصر يحتوي في حاوية معينة (آمن)
 * @param {Element} container - الحاوية
 * @param {Element} element - العنصر المراد فحصه
 * @returns {boolean} - true إذا كان العنصر موجود في الحاوية أو إذا كان أحدهما null/undefined
 */
export const safeContains = (container, element) => {
  // إرجاع false إذا لم تكن المعاملات صحيحة
  if (!container || !element) return false;
  
  // فحص صحة الـ Node
  if (!isValidNode(container) || !isValidNode(element)) {
    return false;
  }
  
  try {
    // استخدام try-catch للحماية من الأخطاء غير المتوقعة
    return container.contains(element);
  } catch (error) {
    // تسجيل الخطأ للتتبع (يمكن إزالته في الإنتاج)
    console.warn('DOM.contains() error:', error);
    return false;
  }
};

/**
 * فحص ما إذا كان العنصر خارج جميع الحاويات المحددة
 * @param {Element[]} containers - مصفوفة من الحاويات
 * @param {Element} element - العنصر المراد فحصه
 * @returns {boolean} - true إذا كان العنصر خارج جميع الحاويات
 */
export const isOutsideContainers = (containers, element) => {
  if (!element || !Array.isArray(containers)) return true;
  
  // فحص ما إذا كان العنصر داخل أي من الحاويات
  const isInsideAny = containers.some(container => 
    safeContains(container, element)
  );
  
  return !isInsideAny;
};

/**
 * فحص آمن للنقر خارج العناصر
 * @param {React.RefObject[]} refs - مصفوفة من React refs
 * @param {Event} event - الحدث
 * @returns {boolean} - true إذا كان النقر خارج جميع العناصر
 */
export const isClickOutsideRefs = (refs, event) => {
  const target = event?.target;
  
  if (!target) return true;
  
  // تحويل refs إلى عناصر DOM
  const elements = refs
    .map(ref => ref.current)
    .filter(element => isValidNode(element));
  
  return isOutsideContainers(elements, target);
};

/**
 * فحص آمن للماوس خارج العناصر
 * @param {React.RefObject[]} refs - مصفوفة من React refs
 * @param {MouseEvent} event - حدث الماوس
 * @returns {boolean} - true إذا كان الماوس خارج جميع العناصر
 */
export const isMouseOutsideRefs = (refs, event) => {
  const relatedTarget = event?.relatedTarget;
  
  // إذا لم يكن relatedTarget موجود أو غير صحيح، فافترض أن الماوس خرج
  if (!relatedTarget || !isValidNode(relatedTarget)) {
    return true;
  }
  
  // تحويل refs إلى عناصر DOM
  const elements = refs
    .map(ref => ref.current)
    .filter(element => isValidNode(element));
  
  return isOutsideContainers(elements, relatedTarget);
};

// ======================================
// Error Boundary للحماية من أخطاء DOM
// ======================================

/**
 * مكون Error Boundary لحماية من أخطاء DOM
 */
export class DOMErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DOM Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4 text-center">
          <h3>حدث خطأ في واجهة المستخدم</h3>
          <p>يرجى إعادة تحميل الصفحة</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// ======================================
// Hooks مخصصة للاستخدام الآمن
// ======================================

/**
 * Hook آمن للنقر خارج العناصر
 * @param {React.RefObject[]} refs - مصفوفة من React refs
 * @param {Function} callback - الدالة التي سيتم استدعاؤها عند النقر خارج
 * @param {boolean} active - هل الـ hook نشط
 */
export const useSafeClickOutside = (refs, callback, active = true) => {
  useEffect(() => {
    if (!active) return;
    
    const handleClickOutside = (event) => {
      if (isClickOutsideRefs(refs, event)) {
        callback?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, callback, active]);
};

/**
 * Hook آمن لـ mouse leave على عناصر محددة
 * @param {React.RefObject[]} refs - مصفوفة من React refs
 * @param {Function} callback - الدالة التي سيتم استدعاؤها عند خروج الماوس
 * @param {boolean} active - هل الـ hook نشط
 */
export const useSafeMouseLeave = (refs, callback, active = true) => {
  useEffect(() => {
    if (!active) return;
    
    // تطبيق event listeners على كل ref
    const elements = refs
      .map(ref => ref.current)
      .filter(element => isValidNode(element));

    elements.forEach(element => {
      const handleMouseLeave = (event) => {
        if (isMouseOutsideRefs(refs, event)) {
          callback?.();
        }
      };

      element.addEventListener('mouseleave', handleMouseLeave);
      
      // حفظ المرجع لإزالة الـ listener لاحقاً
      element._mouseLeaveHandler = handleMouseLeave;
    });
    
    return () => {
      // إزالة جميع event listeners
      elements.forEach(element => {
        if (element._mouseLeaveHandler) {
          element.removeEventListener('mouseleave', element._mouseLeaveHandler);
          delete element._mouseLeaveHandler;
        }
      });
    };
  }, [refs, callback, active]);
};