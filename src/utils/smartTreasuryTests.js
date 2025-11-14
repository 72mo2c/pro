// ======================================
// Smart Treasury System Test Suite - مجموعة اختبارات النظام الذكي للخزينة
// اختبار شامل لجميع وظائف النظام الذكي
// ======================================

import { formatArabicCurrency, calculatePercentage, validateAmount } from '../utils/smartTreasuryUpdate';

// اختبارات التنسيق
export const testCurrencyFormatting = () => {
  console.log('🧪 اختبار تنسيق العملة...');
  
  const tests = [
    { input: 1000, expected: '1,000.00 ج.م' },
    { input: 0, expected: '0.00 ج.م' },
    { input: null, expected: '0.00 ج.م' },
    { input: 'invalid', expected: '0.00 ج.م' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const result = formatArabicCurrency(test.input);
    const success = result === test.expected;
    
    if (success) {
      console.log(`✅ اختبار ${index + 1}: نجح`);
      passed++;
    } else {
      console.log(`❌ اختبار ${index + 1}: فشل`, {
        input: test.input,
        expected: test.expected,
        got: result
      });
      failed++;
    }
  });
  
  console.log(`📊 نتائج تنسيق العملة: ${passed} نجح، ${failed} فشل`);
  return { passed, failed, total: tests.length };
};

// اختبارات حساب النسب
export const testPercentageCalculation = () => {
  console.log('🧪 اختبار حساب النسب...');
  
  const tests = [
    { part: 50, total: 100, expected: '50.0' },
    { part: 75, total: 150, expected: '50.0' },
    { part: 0, total: 100, expected: '0.0' },
    { part: 100, total: 0, expected: '0.0' },
    { part: 33, total: 100, expected: '33.0' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const result = calculatePercentage(test.part, test.total);
    const success = result === test.expected;
    
    if (success) {
      console.log(`✅ اختبار ${index + 1}: نجح (${result}%)`);
      passed++;
    } else {
      console.log(`❌ اختبار ${index + 1}: فشل`, {
        part: test.part,
        total: test.total,
        expected: test.expected,
        got: result
      });
      failed++;
    }
  });
  
  console.log(`📊 نتائج حساب النسب: ${passed} نجح، ${failed} فشل`);
  return { passed, failed, total: tests.length };
};

// اختبارات التحقق من صحة المبلغ
export const testAmountValidation = () => {
  console.log('🧪 اختبار التحقق من صحة المبلغ...');
  
  const tests = [
    { input: 100, expected: true },
    { input: 0, expected: false },
    { input: -50, expected: false },
    { input: 'invalid', expected: false },
    { input: null, expected: false },
    { input: '', expected: false },
    { input: 0.01, expected: true }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const result = validateAmount(test.input);
    const success = result === test.expected;
    
    if (success) {
      console.log(`✅ اختبار ${index + 1}: نجح (${result})`);
      passed++;
    } else {
      console.log(`❌ اختبار ${index + 1}: فشل`, {
        input: test.input,
        expected: test.expected,
        got: result
      });
      failed++;
    }
  });
  
  console.log(`📊 نتائج التحقق من صحة المبلغ: ${passed} نجح، ${failed} فشل`);
  return { passed, failed, total: tests.length };
};

// اختبار نظام التسوية الذكية
export const testIntelligentSettlement = () => {
  console.log('🧪 اختبار نظام التسوية الذكية...');
  
  // محاكاة بيانات العملاء والفواتير
  const mockCustomer = {
    id: 1,
    name: 'عميل تجريبي',
    debtBalance: 500,
    advanceBalance: 100
  };
  
  const mockInvoices = [
    { id: 101, remainingAmount: 200, originalAmount: 300, date: '2025-01-01' },
    { id: 102, remainingAmount: 150, originalAmount: 150, date: '2025-01-02' },
    { id: 103, remainingAmount: 250, originalAmount: 400, date: '2025-01-03' }
  ];
  
  const paymentAmount = 350;
  
  // حساب خطة التسوية
  let remainingPayment = paymentAmount;
  const invoicesToPay = [];
  let totalDebtToPay = 0;
  
  // سداد الفواتير بالترتيب
  mockInvoices.forEach(invoice => {
    if (remainingPayment <= 0) return;
    
    const amountToPay = Math.min(invoice.remainingAmount, remainingPayment);
    if (amountToPay > 0) {
      invoicesToPay.push({
        ...invoice,
        paymentAmount: amountToPay,
        willFullyPaid: amountToPay >= invoice.remainingAmount,
        newRemaining: invoice.remainingAmount - amountToPay
      });
      totalDebtToPay += amountToPay;
      remainingPayment -= amountToPay;
    }
  });
  
  // النتائج المتوقعة
  const expectedResults = {
    totalDebt: 600, // 200 + 150 + 250
    paymentAmount: 350,
    debtToPay: 350, // سيتم سداد 200 + 150
    remainingAmount: 0, // لن يتبقى شيء
    invoicesSettled: 2, // فاتورتان مسددتان
    invoicesToFullyPaid: 2 // فاتورتان مسددتان بالكامل
  };
  
  // التحقق من النتائج
  const actualResults = {
    totalDebt: mockCustomer.debtBalance,
    paymentAmount,
    debtToPay: totalDebtToPay,
    remainingAmount: remainingPayment,
    invoicesSettled: invoicesToPay.length,
    invoicesToFullyPaid: invoicesToPay.filter(inv => inv.willFullyPaid).length
  };
  
  let passed = 0;
  let failed = 0;
  
  Object.keys(expectedResults).forEach(key => {
    const expected = expectedResults[key];
    const actual = actualResults[key];
    const success = actual === expected;
    
    if (success) {
      console.log(`✅ ${key}: نجح (${actual})`);
      passed++;
    } else {
      console.log(`❌ ${key}: فشل`, { expected, actual });
      failed++;
    }
  });
  
  console.log('📊 تفاصيل الفواتير المسددة:');
  invoicesToPay.forEach((invoice, index) => {
    console.log(`  ${index + 1}. فاتورة ${invoice.id}: ${invoice.paymentAmount} (${invoice.willFullyPaid ? 'كامل' : 'جزئي'})`);
  });
  
  console.log(`📊 نتائج التسوية الذكية: ${passed} نجح، ${failed} فشل`);
  return { passed, failed, total: Object.keys(expectedResults).length, details: actualResults };
};

// اختبار حساب التوازن في التسوية
export const testSettlementBalanceCalculation = () => {
  console.log('🧪 اختبار حساب توازن التسوية...');
  
  // سيناريو 1: دين أكبر من المبلغ
  const scenario1 = {
    debtBalance: 1000,
    advanceBalance: 0,
    paymentAmount: 500,
    expected: {
      advanceUsed: 0,
      debtPaid: 500,
      advanceCredit: 0,
      remainingAmount: 0,
      newDebtBalance: 500,
      newAdvanceBalance: 0
    }
  };
  
  // سيناريو 2: مبلغ أكبر من الدين
  const scenario2 = {
    debtBalance: 300,
    advanceBalance: 0,
    paymentAmount: 500,
    expected: {
      advanceUsed: 0,
      debtPaid: 300,
      advanceCredit: 200,
      remainingAmount: 200,
      newDebtBalance: 0,
      newAdvanceBalance: 200
    }
  };
  
  // سيناريو 3: وجود رصيد مسبق مسبقاً
  const scenario3 = {
    debtBalance: 400,
    advanceBalance: 200,
    paymentAmount: 500,
    expected: {
      advanceUsed: 200,
      debtPaid: 300,
      advanceCredit: 0,
      remainingAmount: 0,
      newDebtBalance: 100,
      newAdvanceBalance: 0
    }
  };
  
  let passed = 0;
  let failed = 0;
  const scenarios = [scenario1, scenario2, scenario3];
  
  scenarios.forEach((scenario, index) => {
    const { debtBalance, advanceBalance, paymentAmount, expected } = scenario;
    
    // محاكاة الحساب
    let advanceUsed = 0;
    let debtPaid = 0;
    let advanceCredit = 0;
    let remainingAmount = paymentAmount;
    
    // استخدام الرصيد المسبق أولاً
    if (advanceBalance > 0 && remainingAmount > 0) {
      advanceUsed = Math.min(advanceBalance, remainingAmount);
      remainingAmount -= advanceUsed;
    }
    
    // سداد الدين
    if (debtBalance > 0 && remainingAmount > 0) {
      debtPaid = Math.min(debtBalance, remainingAmount);
      remainingAmount -= debtPaid;
    }
    
    // إضافة رصيد مسبق جديد
    if (remainingAmount > 0) {
      advanceCredit = remainingAmount;
      remainingAmount = 0;
    }
    
    const actual = {
      advanceUsed,
      debtPaid,
      advanceCredit,
      remainingAmount,
      newDebtBalance: debtBalance - debtPaid,
      newAdvanceBalance: advanceBalance - advanceUsed + advanceCredit
    };
    
    const success = JSON.stringify(actual) === JSON.stringify(expected);
    
    if (success) {
      console.log(`✅ سيناريو ${index + 1}: نجح`);
      passed++;
    } else {
      console.log(`❌ سيناريو ${index + 1}: فشل`, { expected, actual });
      failed++;
    }
  });
  
  console.log(`📊 نتائج حساب توازن التسوية: ${passed} نجح، ${failed} فشل`);
  return { passed, failed, total: scenarios.length };
};

// اختبار أداء النظام
export const testSystemPerformance = () => {
  console.log('🧪 اختبار أداء النظام...');
  
  const startTime = performance.now();
  
  // محاكاة 1000 عملية حساب
  for (let i = 0; i < 1000; i++) {
    formatArabicCurrency(Math.random() * 10000);
    calculatePercentage(Math.random() * 100, Math.random() * 1000);
    validateAmount(Math.random() * 1000);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  const maxAcceptableDuration = 100; // 100ms كحد أقصى
  const passed = duration <= maxAcceptableDuration;
  
  console.log(`⏱️ وقت المعالجة: ${duration.toFixed(2)}ms`);
  console.log(`📊 اختبار الأداء: ${passed ? 'نجح' : 'فشل'} (الحد الأقصى: ${maxAcceptableDuration}ms)`);
  
  return { 
    duration, 
    maxAcceptableDuration, 
    passed, 
    failed: passed ? 0 : 1 
  };
};

// تشغيل جميع الاختبارات
export const runAllTests = () => {
  console.log('🚀 بدء تشغيل جميع اختبارات النظام الذكي للخزينة');
  console.log('=' .repeat(60));
  
  const testResults = {
    currencyFormatting: testCurrencyFormatting(),
    percentageCalculation: testPercentageCalculation(),
    amountValidation: testAmountValidation(),
    intelligentSettlement: testIntelligentSettlement(),
    settlementBalanceCalculation: testSettlementBalanceCalculation(),
    systemPerformance: testSystemPerformance()
  };
  
  console.log('=' .repeat(60));
  console.log('📋 ملخص النتائج النهائية:');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(testResults).forEach(([testName, result]) => {
    const passed = result.passed || 0;
    const failed = result.failed || 0;
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`${testName}: ${passed} نجح، ${failed} فشل`);
  });
  
  const totalTests = totalPassed + totalFailed;
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
  
  console.log('=' .repeat(60));
  console.log(`🎯 المجموع: ${totalPassed} نجح، ${totalFailed} فشل`);
  console.log(`📈 نسبة النجاح: ${successRate}%`);
  
  if (totalFailed === 0) {
    console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام');
  } else {
    console.log('⚠️ يوجد فشل في بعض الاختبارات. يرجى المراجعة');
  }
  
  return {
    totalPassed,
    totalFailed,
    totalTests,
    successRate,
    results: testResults
  };
};

// تصدير الاختبارات
export default {
  testCurrencyFormatting,
  testPercentageCalculation,
  testAmountValidation,
  testIntelligentSettlement,
  testSettlementBalanceCalculation,
  testSystemPerformance,
  runAllTests
};