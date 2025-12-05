import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContextWithSound';
import { 
  FaTruck, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaQuestionCircle
} from 'react-icons/fa';

const ShippingManagement = () => {
  // استخدام البيانات من DataContext
  const { 
    shippingVehicles, 
    shipments, 
    addShippingVehicle, 
    updateShippingVehicle, 
    deleteShippingVehicle,
    getAvailableVehicles,
    updateShipmentStatus,
    getShipmentsByStatus,
    getShippingDashboard
  } = useData();
  
  // استخدام نظام الإشعارات الأصلي
  const { showSuccess, showError, showWarning, showConfirm } = useNotification();

  const [activeTab, setActiveTab] = useState('vehicles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // تصفية الشاحنات
  const filteredVehicles = shippingVehicles.filter(vehicle => {
    const matchesSearch = vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // تصفية الشحنات
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // إحصائيات سريعة
  const dashboardData = getShippingDashboard();

  const getStatusColor = (status) => {
    switch(status) {
      case 'متاح': return 'bg-green-100 text-green-800';
      case 'مشغول': return 'bg-yellow-100 text-yellow-800';
      case 'صيانة': return 'bg-red-100 text-red-800';
      case 'خارج الخدمة': return 'bg-gray-100 text-gray-800';
      case 'awaiting_pickup': return 'bg-orange-100 text-orange-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'awaiting_pickup': return 'في انتظار الاستلام';
      case 'in_transit': return 'في الطريق';
      case 'delivered': return 'تم التسليم';
      case 'delayed': return 'متأخر';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'عالي': return 'bg-red-100 text-red-800';
      case 'عادي': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddVehicle = (vehicleData) => {
    try {
      addShippingVehicle(vehicleData);
      setShowAddModal(false);
      showSuccess('تم إضافة الشاحنة بنجاح');
    } catch (error) {
      showError(error.message || 'حدث خطأ أثناء إضافة الشاحنة');
    }
  };

  const handleEditVehicle = (vehicleData) => {
    try {
      updateShippingVehicle(selectedVehicle.id, vehicleData);
      setShowEditModal(false);
      setSelectedVehicle(null);
      showSuccess('تم تعديل الشاحنة بنجاح');
    } catch (error) {
      showError(error.message || 'حدث خطأ أثناء تعديل الشاحنة');
    }
  };

  const handleDeleteVehicle = (id) => {
    const vehicle = shippingVehicles.find(v => v.id === id);
    
    // تحقق من الشحنات النشطة فقط (التي تمنع الحذف)
    const activeShipments = (shipments || []).filter(shipment => {
      return shipment && shipment.vehicleId === id && 
             ['awaiting_pickup', 'in_transit', 'delayed'].includes(shipment.status);
    });
    
    // إذا كان هناك شحنات نشطة، منع الحذف
    if (activeShipments.length > 0) {
      showWarning('لا يمكن حذف الشاحنة لأنها مرتبطة بشحنات نشطة. يجب إكمال الشحنات أو إلغاؤها أولاً.');
      return;
    }

    showConfirm(
      'حذف الشاحنة',
      `هل أنت متأكد من حذف الشاحنة "${vehicle?.vehicleNumber}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
      () => {
        try {
          // تنفيذ الحذف
          deleteShippingVehicle(id);
          
          // عرض رسالة النجاح
          showSuccess('تم حذف الشاحنة بنجاح');
        } catch (error) {
          console.error('خطأ في حذف الشاحنة:', error);
          showError(error?.message || 'حدث خطأ أثناء حذف الشاحنة');
        }
      },
      {
        type: 'danger',
        confirmText: 'حذف الشاحنة',
        cancelText: 'إلغاء'
      }
    );
  };

  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    setShowDetailsModal(true);
  };

  const handleUpdateShipmentStatus = (shipmentId, newStatus) => {
    try {
      updateShipmentStatus(shipmentId, newStatus);
      const statusMessages = {
        'in_transit': 'تم بدء شحن الشحنة بنجاح',
        'delivered': 'تم تأكيد تسليم الشحنة بنجاح',
        'delayed': 'تم تسجيل تأخير الشحنة',
        'cancelled': 'تم إلغاء الشحنة بنجاح'
      };
      showSuccess(statusMessages[newStatus] || 'تم تحديث حالة الشحنة بنجاح');
    } catch (error) {
      showError(error.message || 'حدث خطأ أثناء تحديث حالة الشحنة');
    }
  };

  const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(
      vehicle || {
        vehicleType: '',
        vehicleNumber: '',
        driver: '',
        capacity: '',
        status: 'متاح',
        currentLocation: '',
        phone: ''
      }
    );

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg w-full max-w-sm">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-800">
              {vehicle ? 'تعديل الشاحنة' : 'إضافة شاحنة جديدة'}
            </h3>
          </div>
          
          {/* Form */}
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">نوع الشاحنة</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                >
                  <option value="">اختر</option>
                  <option value="شاحنة كبيرة">شاحنة كبيرة</option>
                  <option value="شاحنة متوسطة">شاحنة متوسطة</option>
                  <option value="شاحنة صغيرة">شاحنة صغيرة</option>
                  <option value="فان">فان</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">السعة</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="مثال: 5 طن"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رقم الشاحنة</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                placeholder="مثال: أ 1234 ب"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">اسم السائق</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                value={formData.driver}
                onChange={(e) => setFormData({...formData, driver: e.target.value})}
                placeholder="اسم السائق"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="01012345678"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="متاح">متاح</option>
                  <option value="مشغول">مشغول</option>
                  <option value="صيانة">صيانة</option>
                  <option value="خارج الخدمة">خارج الخدمة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الموقع</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-orange-500"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({...formData, currentLocation: e.target.value})}
                  placeholder="الموقع"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => onSubmit(formData)}
              className="flex-1 bg-orange-600 text-white py-1.5 px-3 rounded-md hover:bg-orange-700 transition-colors text-xs"
            >
              {vehicle ? 'تحديث' : 'إضافة'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-400 transition-colors text-xs"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'vehicles'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTruck className="inline-block mr-2" />
              الشاحنات
            </button>
            <button
              onClick={() => setActiveTab('shipments')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'shipments'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaShippingFast className="inline-block mr-2" />
              الشحنات النشطة
            </button>
          </nav>
        </div>

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="p-4">
            {/* Search and Filter */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="البحث عن شاحنة أو سائق..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">جميع الحالات</option>
                <option value="متاح">متاح</option>
                <option value="مشغول">مشغول</option>
                <option value="في الطريق">في الطريق</option>
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
              >
                <FaPlus />
                إضافة شاحنة
              </button>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FaTruck className="text-blue-600 text-lg" />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{dashboardData.thisMonthShipments}</p>
                    <p className="text-xs text-gray-600">شحنات هذا الشهر</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FaShippingFast className="text-green-600 text-lg" />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{dashboardData.activeVehicles}</p>
                    <p className="text-xs text-gray-600">شاحنات متاحة</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-orange-600 text-lg" />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{dashboardData.onTimeDeliveryRate}%</p>
                    <p className="text-xs text-gray-600">معدل التسليم في الوقت</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FaClock className="text-red-600 text-lg" />
                  <div>
                    <p className="text-xl font-bold text-gray-800">{dashboardData.delayedThisMonth}</p>
                    <p className="text-xs text-gray-600">شحنات متأخرة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicles List */}
            <div className="space-y-3">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <FaTruck className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p>لا توجد شاحنات متاحة</p>
                </div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      {/* معلومات الشاحنة */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-orange-600 text-lg">
                          <FaTruck />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 text-xs">
                          <div>
                            <p className="text-gray-500">النوع</p>
                            <p className="font-medium text-gray-800">{vehicle.vehicleType}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">رقم الشاحنة</p>
                            <p className="font-medium text-gray-800">{vehicle.vehicleNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">السائق</p>
                            <p className="font-medium text-gray-800">{vehicle.driver}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">السعة</p>
                            <p className="font-medium text-gray-800">{vehicle.capacity}</p>
                          </div>
                        </div>
                        
                        <div className="hidden md:block">
                          <p className="text-gray-500">الموقع</p>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" />
                            {vehicle.currentLocation}
                          </p>
                        </div>
                      </div>

                      {/* الحالة والأزرار */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowEditModal(true);
                            }}
                            className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* الموقع للجوال */}
                    <div className="md:hidden mt-2 pt-2 border-t border-gray-100">
                      <p className="text-gray-500 text-xs">الموقع الحالي</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <FaMapMarkerAlt className="text-xs" />
                        {vehicle.currentLocation}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Active Shipments Tab */}
        {activeTab === 'shipments' && (
          <div className="p-4">
            <div className="space-y-3">
              {filteredShipments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <FaShippingFast className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p>لا توجد شحنات في النظام</p>
                </div>
              ) : (
                filteredShipments.map((shipment) => (
                  <div key={shipment.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">فاتورة #{shipment.invoiceId}</h3>
                        <p className="text-xs text-gray-600">{shipment.customerName}</p>
                        <p className="text-xs text-gray-500">رقم التتبع: {shipment.trackingNumber}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                          {getStatusText(shipment.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(shipment.priority)}`}>
                          {shipment.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <p className="flex items-center gap-1 mb-1">
                          <FaMapMarkerAlt className="text-xs text-gray-400" />
                          {shipment.deliveryAddress}
                        </p>
                        <p>الشاحنة: {shipment.vehicleName}</p>
                        <p>السائق: {shipment.driverName}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 mb-1">
                          <FaClock className="text-xs text-gray-400" />
                          التسليم المتوقع: {new Date(shipment.estimatedDelivery).toLocaleDateString('ar-EG')}
                        </p>
                        <p>الوزن: {shipment.totalWeight} كجم</p>
                        <p>التكلفة: {shipment.cost || 0} جنيه</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2 flex-wrap">
                      {shipment.status === 'awaiting_pickup' && (
                        <button 
                          onClick={() => handleUpdateShipmentStatus(shipment.id, 'in_transit')}
                          className="bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors text-xs flex items-center gap-1"
                        >
                          <FaShippingFast />
                          بدء التحميل
                        </button>
                      )}
                      {shipment.status === 'in_transit' && (
                        <button 
                          onClick={() => handleUpdateShipmentStatus(shipment.id, 'delivered')}
                          className="bg-green-600 text-white py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors text-xs flex items-center gap-1"
                        >
                          <FaCheckCircle />
                          تأكيد التسليم
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewShipment(shipment)}
                        className="bg-orange-600 text-white py-1.5 px-3 rounded-lg hover:bg-orange-700 transition-colors text-xs flex items-center gap-1"
                      >
                        <FaEye />
                        تفاصيل الشحنة
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <VehicleForm
          onSubmit={handleAddVehicle}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <VehicleForm
          vehicle={selectedVehicle}
          onSubmit={handleEditVehicle}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}

      {/* Shipment Details Modal */}
      {showDetailsModal && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  تفاصيل الشحنة - {selectedShipment.trackingNumber}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedShipment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* معلومات أساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">معلومات الشحنة</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">رقم الفاتورة:</span> {selectedShipment.invoiceId}</p>
                    <p><span className="text-gray-600">العميل:</span> {selectedShipment.customerName}</p>
                    <p><span className="text-gray-600">الهاتف:</span> {selectedShipment.customerPhone}</p>
                    <p><span className="text-gray-600">العنوان:</span> {selectedShipment.deliveryAddress}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">معلومات النقل</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">الشاحنة:</span> {selectedShipment.vehicleName}</p>
                    <p><span className="text-gray-600">السائق:</span> {selectedShipment.driverName}</p>
                    <p><span className="text-gray-600">الوزن:</span> {selectedShipment.totalWeight} كجم</p>
                    <p><span className="text-gray-600">التكلفة:</span> {selectedShipment.cost || 0} جنيه</p>
                  </div>
                </div>
              </div>

              {/* حالة الشحنة */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">حالة الشحنة الحالية</h4>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedShipment.status)}`}>
                    {getStatusText(selectedShipment.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedShipment.priority)}`}>
                    {selectedShipment.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">الموقع الحالي:</span> {selectedShipment.currentLocation || 'غير محدد'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">التسليم المتوقع:</span> {new Date(selectedShipment.estimatedDelivery).toLocaleString('ar-EG')}
                </p>
                {selectedShipment.actualDelivery && (
                  <p className="text-sm text-green-600">
                    <span className="font-medium">تم التسليم:</span> {new Date(selectedShipment.actualDelivery).toLocaleString('ar-EG')}
                  </p>
                )}
              </div>

              {/* تاريخ الشحنة */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">تاريخ الشحنة</h4>
                <div className="space-y-2">
                  {(selectedShipment.history || []).map((entry, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {getStatusText(entry.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{entry.location}</p>
                      {entry.notes && (
                        <p className="text-sm text-gray-500">{entry.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedShipment.status === 'awaiting_pickup' && (
                  <button 
                    onClick={() => handleUpdateShipmentStatus(selectedShipment.id, 'in_transit')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <FaShippingFast />
                    بدء التحميل
                  </button>
                )}
                {selectedShipment.status === 'in_transit' && (
                  <button 
                    onClick={() => handleUpdateShipmentStatus(selectedShipment.id, 'delivered')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <FaCheckCircle />
                    تأكيد التسليم
                  </button>
                )}
                {selectedShipment.status === 'in_transit' && (
                  <button 
                    onClick={() => handleUpdateShipmentStatus(selectedShipment.id, 'delayed')}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <FaClock />
                    تسجيل تأخير
                  </button>
                )}
                {(selectedShipment.status === 'delayed' || selectedShipment.status === 'in_transit') && (
                  <button 
                    onClick={() => handleUpdateShipmentStatus(selectedShipment.id, 'cancelled')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <FaTimes />
                    إلغاء الشحنة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingManagement;