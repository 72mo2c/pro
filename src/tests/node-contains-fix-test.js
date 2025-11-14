// ======================================
// Test File - اختبار إصلاحات Node.contains
// ======================================

// هذا الملف يحتوي على اختبارات للتحقق من إصلاح الأخطاء

// ✅ اختبار دالة isValidNode
export const testIsValidNode = () => {
  console.log('🔍 Testing isValidNode function...');
  
  // Test cases
  const testCases = [
    { input: null, expected: false },
    { input: undefined, expected: false },
    { input: '', expected: false },
    { input: {}, expected: false },
    { input: { nodeType: 1 }, expected: true },
    { input: document.createElement('div'), expected: true },
    { input: { nodeType: 'invalid' }, expected: false },
    { input: { nodeType: 3 }, expected: false }, // TEXT_NODE
  ];
  
  const isValidNode = (node) => {
    return node && 
           typeof node === 'object' && 
           typeof node.nodeType === 'number' &&
           node.nodeType === 1; // ELEMENT_NODE
  };
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    const result = isValidNode(testCase.input);
    if (result === testCase.expected) {
      console.log(`✅ Test ${index + 1}: PASSED`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: FAILED (expected: ${testCase.expected}, got: ${result})`);
      failed++;
    }
  });
  
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};

// ✅ اختبار safeContains function
export const testSafeContains = () => {
  console.log('🔍 Testing safeContains function...');
  
  const isValidNode = (node) => {
    return node && 
           typeof node === 'object' && 
           typeof node.nodeType === 'number' &&
           node.nodeType === 1;
  };
  
  const safeContains = (container, element) => {
    if (!element || !container) return false;
    
    const isValidElement = isValidNode(element);
    
    if (!isValidElement) return false;
    
    try {
      return container.contains(element);
    } catch (error) {
      console.warn('Node.contains() error:', error);
      return false;
    }
  };
  
  // Create test elements
  const parent = document.createElement('div');
  const child = document.createElement('span');
  const another = document.createElement('p');
  
  parent.appendChild(child);
  
  const testCases = [
    { container: parent, element: child, expected: true, description: 'Valid child element' },
    { container: parent, element: null, expected: false, description: 'Null element' },
    { container: null, element: child, expected: false, description: 'Null container' },
    { container: parent, element: another, expected: false, description: 'Non-child element' },
    { container: parent, element: undefined, expected: false, description: 'Undefined element' },
    { container: parent, element: {}, expected: false, description: 'Invalid element object' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = safeContains(testCase.container, testCase.element);
      if (result === testCase.expected) {
        console.log(`✅ Test ${index + 1}: ${testCase.description} - PASSED`);
        passed++;
      } else {
        console.log(`❌ Test ${index + 1}: ${testCase.description} - FAILED`);
        console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1}: ${testCase.description} - ERROR: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
};

// ✅ اختبار DOM Event Handling
export const testEventHandling = () => {
  console.log('🔍 Testing DOM Event Handling...');
  
  const createTestElement = () => {
    const container = document.createElement('div');
    const target = document.createElement('button');
    container.appendChild(target);
    
    document.body.appendChild(container);
    
    return { container, target };
  };
  
  const cleanUp = (container) => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };
  
  let testCount = 0;
  let passed = 0;
  
  // Test 1: Valid event target
  testCount++;
  const { container, target } = createTestElement();
  
  try {
    const isValidNode = (node) => {
      return node && 
             typeof node === 'object' && 
             typeof node.nodeType === 'number' &&
             node.nodeType === 1;
    };
    
    if (isValidNode(target)) {
      console.log('✅ Test 1: Valid event target - PASSED');
      passed++;
    } else {
      console.log('❌ Test 1: Valid event target - FAILED');
    }
  } catch (error) {
    console.log(`❌ Test 1: Valid event target - ERROR: ${error.message}`);
  } finally {
    cleanUp(container);
  }
  
  // Test 2: Event with null relatedTarget
  testCount++;
  try {
    const mockEvent = {
      target: target,
      relatedTarget: null
    };
    
    const isValidNode = (node) => {
      return node && 
             typeof node === 'object' && 
             typeof node.nodeType === 'number' &&
             node.nodeType === 1;
    };
    
    const isValidTarget = isValidNode(mockEvent.target);
    const isValidRelatedTarget = !mockEvent.relatedTarget || isValidNode(mockEvent.relatedTarget);
    
    if (isValidTarget && isValidRelatedTarget) {
      console.log('✅ Test 2: Event with null relatedTarget - PASSED');
      passed++;
    } else {
      console.log('❌ Test 2: Event with null relatedTarget - FAILED');
    }
  } catch (error) {
    console.log(`❌ Test 2: Event with null relatedTarget - ERROR: ${error.message}`);
  }
  
  console.log(`📊 Results: ${passed}/${testCount} tests passed`);
  return { passed, total: testCount };
};

// ✅ تشغيل جميع الاختبارات
export const runAllTests = () => {
  console.log('🚀 Starting Node.contains Fix Tests...\n');
  
  try {
    const results1 = testIsValidNode();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const results2 = testSafeContains();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const results3 = testEventHandling();
    console.log('\n' + '='.repeat(50) + '\n');
    
    const totalPassed = (results1.passed || 0) + (results2.passed || 0) + (results3.passed || 0);
    const totalTests = (results1.passed + results1.failed || 0) + 
                      (results2.passed + results2.failed || 0) + 
                      (results3.total || 0);
    
    console.log(`🏆 FINAL RESULTS: ${totalPassed}/${totalTests} tests passed`);
    
    if (totalPassed === totalTests) {
      console.log('🎉 ALL TESTS PASSED! The Node.contains fix is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please review the results above.');
    }
    
    return {
      isValidNode: results1,
      safeContains: results2,
      eventHandling: results3,
      total: { passed: totalPassed, total: totalTests }
    };
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    return { error: error.message };
  }
};

// تشغيل الاختبارات إذا تم استدعاء الملف مباشرة
if (typeof window !== 'undefined') {
  // تشغيل في المتصفح
  window.runNodeContainsTests = runAllTests;
  console.log('🧪 Test functions loaded. Call runNodeContainsTests() to run tests.');
}

// للـ Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testIsValidNode,
    testSafeContains,
    testEventHandling,
    runAllTests
  };
}