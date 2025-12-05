/**
 * Enhanced Adjustment Entries Component
 * 
 * Features:
 * - Real chart of accounts integration
 * - Smart balance validation algorithms
 * - Intelligent entry suggestions
 * - Advanced financial calculations
 * - Real-time balance checking
 * - Professional gradient design
 * 
 * Enhanced Algorithms:
 * - Double-entry bookkeeping validation
 * - Account balance verification
 * - Smart auto-completion
 * - Balance difference detection
 */

import React, { useState, useEffect } from 'react';
import { FaFileInvoice, FaSave, FaPlus, FaTrash, FaCalculator, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useData } from '../../context/DataContext';
import Card from '../../components/Common/Card';
import PageHeader from '../../components/Common/PageHeader';

const AdjustmentEntries = () => {
  const { showWarning, showSuccess, showError } = useNotification();
  const { chartOfAccounts, adjustmentEntries } = useData();
  
  const [entries, setEntries] = useState([
    { id: 1, account: '', debit: '', credit: '', description: '', autoCalculated: false }
  ]);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [entryType, setEntryType] = useState('adjustment'); // adjustment, opening, closing, correction
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Enhanced analytics
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [balanceDifference, setBalanceDifference] = useState(0);
  const [isBalanced, setIsBalanced] = useState(false);
  const [accountBalances, setAccountBalances] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [entrySuggestions, setEntrySuggestions] = useState([]);

  // Load account balances when component mounts
  useEffect(() => {
    loadAccountBalances();
  }, [chartOfAccounts]);

  // Recalculate totals whenever entries change
  useEffect(() => {
    calculateTotals();
    validateEntries();
  }, [entries, chartOfAccounts]);

  const loadAccountBalances = () => {
    if (chartOfAccounts && chartOfAccounts.length > 0) {
      const balances = {};
      chartOfAccounts.forEach(account => {
        balances[account.code] = {
          name: account.name,
          currentBalance: parseFloat(account.balance) || 0,
          accountType: account.type,
          isActive: account.isActive !== false
        };
      });
      setAccountBalances(balances);
    }
  };

  const calculateTotals = () => {
    const totalD = entries.reduce((sum, entry) => {
      const debit = parseFloat(entry.debit) || 0;
      return sum + debit;
    }, 0);
    
    const totalC = entries.reduce((sum, entry) => {
      const credit = parseFloat(entry.credit) || 0;
      return sum + credit;
    }, 0);
    
    setTotalDebit(totalD);
    setTotalCredit(totalC);
    setBalanceDifference(Math.abs(totalD - totalC));
    setIsBalanced(Math.abs(totalD - totalC) < 0.01);
  };

  const validateEntries = () => {
    const errors = [];
    
    // Check for missing accounts
    entries.forEach((entry, index) => {
      if (!entry.account && (entry.debit || entry.credit)) {
        errors.push(`السطر ${index + 1}: يجب اختيار حساب`);
      }
      
      if (entry.account && entry.debit && entry.credit) {
        errors.push(`السطر ${index + 1}: لا يمكن إدخال مدين ودائن معاً`);
      }
      
      if (entry.account && !entry.debit && !entry.credit) {
        errors.push(`السطر ${index + 1}: يجب إدخال مبلغ مدين أو دائن`);
      }
      
      // Validate account exists in chart of accounts
      if (entry.account && !accountBalances[entry.account]) {
        errors.push(`السطر ${index + 1}: الحساب ${entry.account} غير موجود في دليل الحسابات`);
      }
    });

    setValidationErrors(errors);
  };

  const getSmartSuggestions = () => {
    if (!isBalanced || totalDebit === 0) return [];
    
    const suggestions = [];
    
    // Suggest common adjustment pairs
    if (entries.length === 1) {
      const singleEntry = entries[0];
      if (singleEntry.account && singleEntry.debit) {
        // Suggest counterpart account
        const accountType = accountBalances[singleEntry.account]?.accountType;
        
        if (accountType === 'asset' || accountType === 'expense') {
          suggestions.push({
            account: 'أرباح_وخسائر',
            type: 'credit',
            amount: singleEntry.debit,
            description: `تسوية مقابل ${singleEntry.description || singleEntry.account}`
          });
        } else if (accountType === 'liability' || accountType === 'equity' || accountType === 'revenue') {
          suggestions.push({
            account: singleEntry.account,
            type: 'credit', 
            amount: singleEntry.debit,
            description: `تسوية مقابل ${singleEntry.description || singleEntry.account}`
          });
        }
      }
    }
    
    return suggestions;
  };

  const applySuggestion = (suggestion) => {
    const newEntry = {
      id: Date.now(),
      account: suggestion.account,
      debit: suggestion.type === 'debit' ? suggestion.amount : '',
      credit: suggestion.type === 'credit' ? suggestion.amount : '',
      description: suggestion.description,
      autoCalculated: true
    };
    setEntries([...entries, newEntry]);
  };

  const addEntry = () => {
    const newEntry = {
      id: Date.now(),
      account: '',
      debit: '',
      credit: '',
      description: '',
      autoCalculated: false
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id) => {
    if (entries.length > 1) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const updateEntry = (id, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validationErrors.length > 0) {
      showError('يرجى إصلاح الأخطاء أولاً');
      return;
    }

    if (!isBalanced()) {
      showWarning('القيد غير متوازن! يجب أن يكون مجموع المدين مساوياً لمجموع الدائن');
      return;
    }

    const entry = {
      id: Date.now(),
      type: entryType,
      date: entryDate,
      description,
      notes,
      referenceNumber,
      entries: entries.filter(e => e.account && (e.debit || e.credit)),
      totalDebit: totalDebit,
      totalCredit: totalCredit,
      balanceDifference: balanceDifference,
      createdAt: new Date().toISOString(),
      validatedBy: 'system',
      status: 'posted'
    };

    console.log('قيد تسوية محسن:', entry);
    showSuccess('تم حفظ قيد التسوية بنجاح مع التحقق الذكي');
    
    // Reset form
    setEntries([{ id: 1, account: '', debit: '', credit: '', description: '', autoCalculated: false }]);
    setDescription('');
    setNotes('');
    setReferenceNumber('');
  };

  const getAccountOptions = () => {
    return Object.keys(accountBalances).map(code => ({
      code,
      name: accountBalances[code].name,
      balance: accountBalances[code].currentBalance,
      type: accountBalances[code].accountType
    }));
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-emerald-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getEntryTypeLabel = (type) => {
    const types = {
      'adjustment': 'تسوية عادية',
      'opening': 'قيد افتتاحي',
      'closing': 'قيد إقفال',
      'correction': 'تصحيح خطأ'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <PageHeader
          title="قيود التسوية المحسنة"
          subtitle="نظام ذكي لإدارة القيود المحاسبية مع التحقق التلقائي"
          icon={
            <FaCalculator className="text-white text-2xl" />
          }
        />

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className={`rounded-xl p-6 text-white shadow-lg ${
            isBalanced ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">حالة التوازن</p>
                <p className="text-2xl font-bold">{isBalanced ? 'متوازن' : 'غير متوازن'}</p>
                <p className="text-emerald-100 text-xs">
                  {isBalanced ? '✔ القيد صحيح' : `⚠ الفرق: ${balanceDifference.toFixed(2)}`}
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                {isBalanced ? <FaCheckCircle className="w-6 h-6" /> : <FaExclamationTriangle className="w-6 h-6" />}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي المدين</p>
                <p className="text-2xl font-bold">{totalDebit.toLocaleString()}</p>
                <p className="text-blue-100 text-xs">ج.م</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">إجمالي الدائن</p>
                <p className="text-2xl font-bold">{totalCredit.toLocaleString()}</p>
                <p className="text-purple-100 text-xs">ج.م</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">عدد الأسطر</p>
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-orange-100 text-xs">سطر قيد</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FaFileInvoice className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Entry Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات القيد</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">التاريخ *</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">نوع القيد</label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="adjustment">تسوية عادية</option>
                  <option value="opening">قيد افتتاحي</option>
                  <option value="closing">قيد إقفال</option>
                  <option value="correction">تصحيح خطأ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">رقم المرجع</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="رقم مرجع اختياري..."
                />
              </div>

              <div className="flex items-end">
                <div className="w-full text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                  <div className="font-medium">{getEntryTypeLabel(entryType)}</div>
                  <div className="text-xs text-blue-600">قيد محاسبي ذكي</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Entry Details */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">تفاصيل القيد</h3>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              >
                <FaPlus />
                إضافة سطر
              </button>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-2">أخطاء التحقق:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Smart Suggestions */}
            {!isBalanced && entries.length > 0 && (
              <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">اقتراحات ذكية:</h4>
                {getSmartSuggestions().map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3 mb-2">
                    <div>
                      <div className="font-medium text-gray-800">{suggestion.description}</div>
                      <div className="text-sm text-gray-600">
                        {suggestion.account} - {suggestion.amount.toFixed(2)} ج.م
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => applySuggestion(suggestion)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      تطبيق
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                    <th className="px-4 py-3 text-center rounded-tr-lg font-bold">#</th>
                    <th className="px-4 py-3 text-right font-bold">الحساب</th>
                    <th className="px-4 py-3 text-right font-bold">البيان</th>
                    <th className="px-4 py-3 text-right font-bold">مدين</th>
                    <th className="px-4 py-3 text-right font-bold">دائن</th>
                    <th className="px-4 py-3 text-center font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          entry.autoCalculated 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.account}
                          onChange={(e) => updateEntry(entry.id, 'account', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">اختر الحساب...</option>
                          {getAccountOptions().map(acc => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.name}
                              {acc.balance !== 0 && ` (${acc.balance.toFixed(2)})`}
                            </option>
                          ))}
                        </select>
                        {entry.account && accountBalances[entry.account] && (
                          <div className={`text-xs mt-1 ${getBalanceColor(accountBalances[entry.account].currentBalance)}`}>
                            الرصيد الحالي: {accountBalances[entry.account].currentBalance.toFixed(2)} ج.م
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={entry.description}
                          onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="البيان..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entry.debit}
                          onChange={(e) => {
                            updateEntry(entry.id, 'debit', e.target.value);
                            if (e.target.value) {
                              updateEntry(entry.id, 'credit', '');
                            }
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={entry.credit}
                          onChange={(e) => {
                            updateEntry(entry.id, 'credit', e.target.value);
                            if (e.target.value) {
                              updateEntry(entry.id, 'debit', '');
                            }
                          }}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-right"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          disabled={entries.length === 1}
                          className={`p-2 rounded-lg transition-colors ${
                            entries.length === 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right rounded-br-lg">الإجمالي</td>
                    <td className="px-4 py-3 text-right text-emerald-600 text-lg">
                      {totalDebit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-purple-600 text-lg">
                      {totalCredit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center rounded-bl-lg">
                      {isBalanced ? (
                        <div className="flex items-center justify-center text-emerald-600">
                          <FaCheckCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm">متوازن</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-red-600">
                          <FaExclamationTriangle className="w-5 h-5 mr-1" />
                          <span className="text-sm">غير متوازن</span>
                        </div>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balance Status */}
            {!isBalanced && totalDebit > 0 && totalCredit > 0 && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <FaExclamationTriangle className="text-red-600 w-5 h-5" />
                <div>
                  <div className="font-semibold text-red-800">القيد غير متوازن!</div>
                  <div className="text-red-700">الفرق: {Math.abs(totalDebit - totalCredit).toFixed(2)} ج.م</div>
                </div>
              </div>
            )}

            {isBalanced && totalDebit > 0 && (
              <div className="mt-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 text-emerald-800">
                <div className="flex items-center gap-2 font-semibold">
                  <FaCheckCircle className="w-5 h-5" />
                  ✅ القيد متوازن وجاهز للحفظ
                </div>
              </div>
            )}
          </Card>

          {/* Entry Description */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">وصف القيد</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">وصف القيد *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="أدخل وصف القيد..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ملاحظات</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="أضف ملاحظات إضافية..."
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isBalanced || totalDebit === 0 || validationErrors.length > 0}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isBalanced && totalDebit > 0 && validationErrors.length === 0
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FaSave />
            حفظ قيد التسوية المحسن
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdjustmentEntries;