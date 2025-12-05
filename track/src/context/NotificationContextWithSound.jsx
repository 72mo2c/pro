// ======================================
// Enhanced Notification Context - إدارة الإشعارات مع الأصوات
// ======================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ConfirmationModal from '../components/Common/ConfirmationModal';

const NotificationContext = createContext();

// Hook لاستخدام Notification Context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    volume: 0.5,
    sounds: {
      success: 'success.mp3',
      error: 'error.mp3', 
      warning: 'warning.mp3',
      info: 'info.mp3',
      default: 'notification.mp3'
    }
  });

  // حالة نافذة التأكيد
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    onConfirm: null
  });

  // تحميل إعدادات الأصوات من LocalStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_sound_settings');
    if (savedSettings) {
      setSoundSettings(JSON.parse(savedSettings));
    }
  }, []);

  // حفظ إعدادات الأصوات
  const saveSoundSettings = useCallback((newSettings) => {
    setSoundSettings(newSettings);
    localStorage.setItem('notification_sound_settings', JSON.stringify(newSettings));
  }, []);

  // تشغيل الصوت
  const playSound = useCallback((type = 'default') => {
    console.log('🔊 تشغيل صوت الإشعار:', type);
    
    if (!soundSettings.enabled) {
      console.log('🔇 الأصوات معطلة');
      return;
    }

    const soundFile = soundSettings.sounds[type] || soundSettings.sounds.default;
    console.log('📁 ملف الصوت:', `/sounds/${soundFile}`);
    
    try {
      // إنشاء عنصر صوتي
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = soundSettings.volume;
      
      // إضافة event listeners للتتبع
      audio.addEventListener('loadstart', () => console.log('🔄 بدء تحميل الصوت...'));
      audio.addEventListener('canplay', () => console.log('✅ الصوت جاهز للتشغيل'));
      audio.addEventListener('ended', () => console.log('✅ انتهى تشغيل الصوت'));
      
      // تشغيل الصوت
      audio.play().then(() => {
        console.log('🎵 تم تشغيل الصوت بنجاح:', soundFile);
      }).catch(error => {
        console.warn('❌ فشل في تشغيل الصوت:', error.message);
        
        // استخدام الصوت البديل إذا فشل الملف
        console.log('🔄 محاولة استخدام الصوت البديل...');
        createFallbackSound(type, soundSettings.volume);
      });
      
      // إعداد timeout للملفات الصوتية
      setTimeout(() => {
        if (!audio.ended) {
          audio.pause();
        }
      }, 5000); // 5 ثواني حد أقصى
      
    } catch (error) {
      console.warn('❌ خطأ في تشغيل الصوت:', error);
      console.log('🔄 محاولة استخدام الصوت البديل...');
      createFallbackSound(type, soundSettings.volume);
    }
  }, [soundSettings]);

  // إنشاء صوت بديل باستخدام Web Audio API
  const createFallbackSound = useCallback((type, volume = 0.5) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // أصوات مختلفة لأنواع الإشعارات
      const soundConfigs = {
        success: { frequency: 440, duration: 0.2 },
        error: { frequency: 220, duration: 0.4 },
        warning: { frequency: 660, duration: 0.2 },
        info: { frequency: 330, duration: 0.3 },
        default: { frequency: 550, duration: 0.25 }
      };

      const config = soundConfigs[type] || soundConfigs.default;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + config.duration);
      
      console.log(`🎵 تم تشغيل الصوت البديل: ${type}`);
    } catch (error) {
      console.warn('❌ فشل في إنشاء الصوت البديل:', error);
    }
  }, []);

  // إضافة إشعار جديد مع الصوت
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // تشغيل الصوت حسب نوع الإشعار
    playSound(notification.type);

    // حفظ في LocalStorage
    const stored = localStorage.getItem('bero_notifications');
    const allNotifications = stored ? JSON.parse(stored) : [];
    allNotifications.unshift(newNotification);
    localStorage.setItem('bero_notifications', JSON.stringify(allNotifications.slice(0, 100))); // حفظ آخر 100 إشعار
  }, [playSound]);

  // إضافة إشعار نجاح مع صوت
  const showSuccess = useCallback((message) => {
    addNotification({
      type: 'success',
      title: 'نجاح',
      message,
      icon: 'success'
    });
  }, [addNotification]);

  // إضافة إشعار خطأ مع صوت
  const showError = useCallback((message) => {
    addNotification({
      type: 'error',
      title: 'خطأ',
      message,
      icon: 'error'
    });
  }, [addNotification]);

  // إضافة إشعار تحذير مع صوت
  const showWarning = useCallback((message) => {
    addNotification({
      type: 'warning',
      title: 'تحذير',
      message,
      icon: 'warning'
    });
  }, [addNotification]);

  // إضافة إشعار معلومات مع صوت
  const showInfo = useCallback((message) => {
    addNotification({
      type: 'info',
      title: 'معلومة',
      message,
      icon: 'info'
    });
  }, [addNotification]);

  // إضافة إشعار مخصص مع صوت
  const showCustom = useCallback((type, title, message, sound = true) => {
    addNotification({
      type,
      title,
      message,
      icon: type
    });
  }, [addNotification]);

  // إضافة نافذة تأكيد
  const showConfirm = useCallback((title, message, onConfirm, options = {}) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      type: options.type || 'confirm',
      confirmText: options.confirmText || 'تأكيد',
      cancelText: options.cancelText || 'إلغاء',
      onConfirm: onConfirm
    });
  }, []);

  // إغلاق نافذة التأكيد
  const closeConfirmModal = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // تنفيذ التأكيد
  const handleConfirm = useCallback(() => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    closeConfirmModal();
  }, [confirmModal.onConfirm, closeConfirmModal]);

  // تشغيل صوت الاختبار
  const testSound = useCallback((type) => {
    playSound(type);
  }, [playSound]);

  // وضع إشعار كمقروء
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // وضع جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // حذف إشعار
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(notif => notif.id !== id);
    });
  }, []);

  // حذف جميع الإشعارات
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('bero_notifications');
  }, []);

  const value = {
    notifications,
    unreadCount,
    soundSettings,
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    showConfirm,
    closeConfirmModal,
    playSound,
    testSound,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    saveSoundSettings
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* نافذة التأكيد */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />
    </NotificationContext.Provider>
  );
};