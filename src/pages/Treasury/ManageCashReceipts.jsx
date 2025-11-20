// ======================================
// Manage Cash Receipts - إدارة إيصالات الاستلام
// ======================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { useTab } from '../../contexts/TabContext';
import PageHeader from '../../components/Common/PageHeader';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import { 
  FaPlus, 
  FaEye, 
  FaTrash, 
  FaMoneyBillWave,
  FaSearch,
  FaLock,
  FaFileInvoice,
  FaUsers,
  FaPhone,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaCalculator,
  FaMoneyCheck,
  FaUniversity,
  FaCalendarAlt,
  FaExchangeAlt
} from 'react-icons/fa';

const ManageCashReceipts = () => {
  const navigate = useNavigate();
  const { cashReceipts, deleteCashReceipt, customers, suppliers } = useData();
  const { settings } = useSystemSettings();
  const { hasPermission } = useAuth();
  const { showWarning, showError } = useNotification();
  const { openTab } = useTab();

  // دالة تنسيق العملة
  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'EGP';
    const locale = settings?.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  
  const paymentMethodLabels = {
    cash: 'نقداً',
    check: 'شيك',
    bank_transfer: 'تحويل بنكي'
  };
  
  // الحصول على معلومات المصدر الكاملة
  const getSourceDetails = (receipt) => {
    if (receipt.fromType === 'customer') {
      return customers.find(c => c.id === receipt.fromId);
    } else if (receipt.fromType === 'supplier') {
      return suppliers.find(s => s.id === receipt.fromId);
    }
    return null;
  };
  
  // الحصول على اسم المصدر
  const getSourceName = (receipt) => {
    const details = getSourceDetails(receipt);
    return details?.name || receipt.fromName || 'غير محدد';
  };
  
  // فلترة وبحث
  const filteredReceipts = cashReceipts.filter(receipt => {
    const sourceName = getSourceName(receipt);
    const matchesSearch = 
      String(receipt.receiptNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(sourceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(receipt.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // أعمدة الجدول - مدمجة وأصغر
  const columns = [
    { header: 'رقم الإيصال', accessor: 'receiptNumber' },
    { header: 'التاريخ', accessor: 'date' },
    { header: 'من', accessor: 'sourceName' },
    { header: 'المبلغ', accessor: 'amount' },
    { header: 'طريقة الدفع', accessor: 'paymentMethod' },
  ];
  
  // تنسيق البيانات للجدول
  const tableData = filteredReceipts.map(receipt => ({
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    date: new Date(receipt.date).toLocaleDateString('ar-EG'),
    sourceName: getSourceName(receipt),
    amount: hasPermission('view_financial_data') ? formatCurrency(parseFloat(receipt.amount)) : (
      <span className="flex items-center gap-1 text-gray-400">
        <FaLock className="text-xs" />
        مخفي
      </span>
    ),
    paymentMethod: paymentMethodLabels[receipt.paymentMethod] || receipt.paymentMethod
  }));
  
  const handleView = (receipt) => {
    if (!hasPermission('view_cash_receipts')) {
      showWarning('ليس لديك صلاحية عرض إيصالات الاستلام');
      return;
    }
    
    const original = cashReceipts.find(r => r.id === receipt.id);
    setSelectedReceipt(original);
    setShowViewModal(true);
  };
  
  // معالج الضغط مرتين على الصف
  const handleRowDoubleClick = (receipt) => {
    handleView(receipt);
  };
  
  const handleDelete = (receipt) => {
    if (!hasPermission('delete_cash_receipt')) {
      showWarning('ليس لديك صلاحية حذف إيصالات الاستلام');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا الإيصال؟')) {
      try {
        deleteCashReceipt(receipt.id);
      } catch (error) {
        showError('خطأ: ' + error.message);
      }
    }
  };
  
  const handleAddNew = () => {
    if (!hasPermission('manage_cash_receipts')) {
      showWarning('ليس لديك صلاحية إدارة إيصالات الاستلام');
      return;
    }
    // فتح تبويبة جديدة لإضافة إيصال نقدي
    openTab('/treasury/receipt/new', 'إضافة إيصال نقدي', '💰➕');
  };
  
  // حساب إجمالي الإيصالات
  const totalReceipts = filteredReceipts.reduce((sum, receipt) => 
    sum + parseFloat(receipt.amount || 0), 0
  );
  
  return (
    <div className="space-y-3">
      <PageHeader 
        title="سجل إيصالات الاستلام"
        icon={<FaMoneyBillWave />}
        action={
          hasPermission('manage_cash_receipts') && (
            <Button onClick={handleAddNew} icon={<FaPlus />} size="sm">
              إضافة إيصال
            </Button>
          )
        }
      />
      
      {/* بطاقات الإحصائيات - تصميم مدمج */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <FaMoneyBillWave className="text-lg text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">عدد الإيصالات</div>
              <div className="text-xl font-bold text-green-600 truncate">
                {hasPermission('view_cash_receipts') ? filteredReceipts.length : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <FaLock className="text-xs" />
                    --
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FaCalculator className="text-lg text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">الإجمالي</div>
              <div className="text-lg font-bold text-blue-600 truncate">
                {hasPermission('view_financial_data') ? formatCurrency(totalReceipts) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <FaLock className="text-xs" />
                    --
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FaMoneyBillWave className="text-lg text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600">المتوسط</div>
              <div className="text-lg font-bold text-purple-600 truncate">
                {hasPermission('view_financial_data') ? formatCurrency(filteredReceipts.length > 0 ? (totalReceipts / filteredReceipts.length) : 0) : (
                  <span className="flex items-center gap-1 text-gray-400 text-sm">
                    <FaLock className="text-xs" />
                    --
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* أدوات البحث - مدمجة */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="بحث برقم الإيصال أو المصدر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-600 whitespace-nowrap">
            {filteredReceipts.length} / {cashReceipts.length}
          </div>
        </div>
        
        {/* الجدول مع الضغط مرتين */}
        <div className="mt-3">
          <Table
            columns={columns}
            data={tableData || []}
            onView={handleView}
            onDelete={handleDelete}
            onRowDoubleClick={handleRowDoubleClick}
          />
        </div>
      </Card>
      
      {/* Modal عرض تفاصيل الإيصال - تصميم محسن ومدمج */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-green-600" />
            <span className="text-base">إيصال #{selectedReceipt?.receiptNumber}</span>
          </div>
        }
        size="lg"
      >
        {selectedReceipt && (() => {
          const sourceDetails = getSourceDetails(selectedReceipt);
          return (
            <div className="space-y-3">
              {/* معلومات الإيصال الأساسية - مدمجة */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaFileInvoice className="text-green-600" />
                  معلومات الإيصال
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">رقم الإيصال</div>
                    <div className="font-bold text-sm text-gray-800">{selectedReceipt.receiptNumber}</div>
                  </div>
                  
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">التاريخ</div>
                    <div className="font-bold text-sm text-gray-800">
                      {new Date(selectedReceipt.date).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">المبلغ</div>
                    <div className="font-bold text-base text-green-600">
                      {hasPermission('view_financial_data') ? 
                        formatCurrency(parseFloat(selectedReceipt.amount)) : 
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <FaLock />
                          مخفي
                        </span>
                      }
                    </div>
                  </div>
                  
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">طريقة الدفع</div>
                    <div className="font-medium text-sm text-gray-800">
                      {paymentMethodLabels[selectedReceipt.paymentMethod] || selectedReceipt.paymentMethod}
                    </div>
                  </div>
                  
                  {selectedReceipt.referenceNumber && (
                    <div className="bg-white rounded p-2 border">
                      <div className="text-xs text-gray-600">رقم المرجع</div>
                      <div className="font-medium text-sm text-gray-800">{selectedReceipt.referenceNumber}</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* معلومات الشيك - تظهر فقط للشيكات */}
              {selectedReceipt.paymentMethod === 'check' && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <FaMoneyCheck className="text-yellow-600" />
                    معلومات الشيك
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedReceipt.checkNumber && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">رقم الشيك</div>
                        <div className="font-bold text-sm text-gray-800">{selectedReceipt.checkNumber}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.checkBank && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">البنك</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.checkBank}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.checkBranch && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">الفرع</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.checkBranch}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.checkDueDate && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">تاريخ الاستحقاق</div>
                        <div className="font-medium text-sm text-gray-800">
                          {new Date(selectedReceipt.checkDueDate).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    )}
                    
                    {selectedReceipt.checkOwnerName && (
                      <div className="bg-white rounded p-2 border md:col-span-2">
                        <div className="text-xs text-gray-600">اسم صاحب الشيك</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.checkOwnerName}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* معلومات التحويل البنكي - تظهر فقط للتحويلات */}
              {selectedReceipt.paymentMethod === 'bank_transfer' && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <FaUniversity className="text-blue-600" />
                    معلومات التحويل البنكي
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedReceipt.transferNumber && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">رقم الحوالة</div>
                        <div className="font-bold text-sm text-gray-800">{selectedReceipt.transferNumber}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.transferBankFrom && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">البنك المرسل</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.transferBankFrom}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.transferAccountFrom && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">رقم الحساب المرسل</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.transferAccountFrom}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.transferBankTo && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">البنك المستلم</div>
                        <div className="font-medium text-sm text-gray-800">{selectedReceipt.transferBankTo}</div>
                      </div>
                    )}
                    
                    {selectedReceipt.transferDate && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">تاريخ التحويل</div>
                        <div className="font-medium text-sm text-gray-800">
                          {new Date(selectedReceipt.transferDate).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* معلومات المصدر - مدمجة */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <FaUsers className="text-purple-600" />
                  معلومات المصدر
                </h3>
                {sourceDetails ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded p-2 border">
                      <div className="text-xs text-gray-600">الاسم</div>
                      <div className="font-bold text-sm text-gray-800">{sourceDetails.name}</div>
                      <div className="text-xs text-purple-600">
                        {selectedReceipt.fromType === 'customer' ? 'عميل' : 'مورد'}
                      </div>
                    </div>
                    
                    <div className="bg-white rounded p-2 border">
                      <div className="text-xs text-gray-600">الهاتف</div>
                      <div className="font-medium text-sm text-gray-800">
                        {sourceDetails.phone1 || sourceDetails.phone2 ? 
                          `${sourceDetails.phone1 || ''}${sourceDetails.phone1 && sourceDetails.phone2 ? ' / ' : ''}${sourceDetails.phone2 || ''}` : 
                          <span className="text-gray-400">غير محدد</span>
                        }
                      </div>
                    </div>
                    
                    {sourceDetails.area && (
                      <div className="bg-white rounded p-2 border">
                        <div className="text-xs text-gray-600">المنطقة</div>
                        <div className="font-medium text-sm text-gray-800">{sourceDetails.area}</div>
                      </div>
                    )}
                    
                    {sourceDetails.address && (
                      <div className="bg-white rounded p-2 border col-span-2">
                        <div className="text-xs text-gray-600">العنوان</div>
                        <div className="font-medium text-sm text-gray-800">{sourceDetails.address}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border rounded p-3 text-center">
                    <p className="text-sm text-gray-600">المصدر: {selectedReceipt.fromName || 'غير محدد'}</p>
                  </div>
                )}
              </div>
              
              {/* الوصف والملاحظات - مدمجة */}
              {(selectedReceipt.description || selectedReceipt.notes) && (
                <div className="space-y-2">
                  {selectedReceipt.description && (
                    <div className="bg-gray-50 rounded p-2 border">
                      <div className="text-xs font-medium text-gray-700 mb-1">الوصف</div>
                      <p className="text-sm text-gray-600">{selectedReceipt.description}</p>
                    </div>
                  )}
                  
                  {selectedReceipt.notes && (
                    <div className="bg-yellow-50 rounded p-2 border border-yellow-200">
                      <div className="text-xs font-medium text-yellow-800 mb-1">ملاحظات</div>
                      <p className="text-sm text-yellow-700">{selectedReceipt.notes}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* زر الإغلاق */}
              <div className="flex justify-end pt-2 border-t">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowViewModal(false)}
                  size="sm"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ManageCashReceipts;
