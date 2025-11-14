// ======================================
// Debug Tool - أداة فحص الإصلاحات
// ======================================

import { isValidNode, safeContains } from './domUtils.js';

/**
 * فحص حالة DOM وNode.contains الإصلاحات
 */
export const debugNodeContains = () => {
  console.group('🔍 Node.Contains Debug Tool');
  
  try {
    // فحص 1: اختبار دالة isValidNode
    console.log('✅ Testing isValidNode function...');
    const testElement = document.createElement('div');
    const result1 = isValidNode(testElement);
    console.log(`isValidNode(divElement): ${result1}`);
    
    // فحص 2: اختبار safeContains
    console.log('✅ Testing safeContains function...');
    const parent = document.createElement('div');
    const child = document.createElement('span');
    parent.appendChild(child);
    
    const result2 = safeContains(parent, child);
    console.log(`safeContains(parent, child): ${result2}`);
    
    // فحص 3: اختبار error case
    console.log('✅ Testing error cases...');
    const result3 = safeContains(null, child);
    const result4 = safeContains(parent, null);
    const result5 = safeContains(parent, {});
    console.log(`safeContains(null, child): ${result3}`);
    console.log(`safeContains(parent, null): ${result4}`);
    console.log(`safeContains(parent, {}): ${result5}`);
    
    // فحص 4: فحص وجود عناصر DOM
    console.log('✅ Testing DOM elements...');
    const sidebar = document.querySelector('[data-testid="sidebar"]');
    const search = document.querySelector('[data-testid="search"]');
    console.log(`Sidebar element found: ${!!sidebar}`);
    console.log(`Search element found: ${!!search}`);
    
    // فحص 5: فحص console errors
    console.log('✅ Checking for Node.contains errors...');
    console.log('Please check the browser console for any red errors related to Node.contains');
    
    console.groupEnd();
    
    return {
      isValidNode: result1,
      safeContains: result2,
      errorCases: [result3, result4, result5],
      elementsFound: {
        sidebar: !!sidebar,
        search: !!search
      }
    };
    
  } catch (error) {
    console.error('💥 Debug tool error:', error);
    console.groupEnd();
    return { error: error.message };
  }
};

/**
 * مراقبة أخطاء Console
 */
export const monitorConsoleErrors = () => {
  console.log('🎯 Starting Console Error Monitor...');
  
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // البحث عن أخطاء Node.contains
    if (message.includes('Node.contains')) {
      console.warn('⚠️ NODE.CONTAINS ERROR DETECTED:', message);
      console.log('🔧 This error should be fixed by the domUtils.js protection');
      console.log('📍 Check if the safeContains function is being used correctly');
    }
    
    // استدعاء الدالة الأصلية
    originalError.apply(console, args);
  };
  
  console.log('✅ Console error monitor started');
};

/**
 * تشغيل جميع أدوات الفحص
 */
export const runAllDebugTools = () => {
  console.log('🚀 Starting All Debug Tools...\n');
  
  try {
    // تشغيل مراقبة الأخطاء
    monitorConsoleErrors();
    
    // تشغيل فحص Node.contains
    const results = debugNodeContains();
    
    console.log('\n🎉 Debug tools completed successfully');
    console.log('📊 Results:', results);
    
    return results;
    
  } catch (error) {
    console.error('💥 Debug tools failed:', error);
    return { error: error.message };
  }
};

// تحميل تلقائي في المتصفح
if (typeof window !== 'undefined') {
  window.debugNodeContains = debugNodeContains;
  window.monitorConsoleErrors = monitorConsoleErrors;
  window.runAllDebugTools = runAllDebugTools;
  
  console.log('🧪 Debug tools loaded successfully');
  console.log('📋 Available functions:');
  console.log('   - debugNodeContains()');
  console.log('   - monitorConsoleErrors()');
  console.log('   - runAllDebugTools()');
}

// تصدير للمودولز
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugNodeContains,
    monitorConsoleErrors,
    runAllDebugTools
  };
}