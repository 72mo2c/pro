class IndexedDBManager {
    constructor() {
        this.dbName = 'InventoryDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('فشل في فتح قاعدة البيانات:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ تم فتح قاعدة البيانات بنجاح');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                console.log('🔄 تحديث قاعدة البيانات...');
                this._createStores();
            };
        });
    }

    _createStores() {
        // Create products store
        if (!this.db.objectStoreNames.contains('products')) {
            const productsStore = this.db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            productsStore.createIndex('name', 'name', { unique: false });
            productsStore.createIndex('categoryId', 'categoryId', { unique: false });
            productsStore.createIndex('warehouseId', 'warehouseId', { unique: false });
            productsStore.createIndex('barcode', 'barcode', { unique: false });
            productsStore.createIndex('sku', 'sku', { unique: false });
        }

        // Create categories store
        if (!this.db.objectStoreNames.contains('categories')) {
            const categoriesStore = this.db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
            categoriesStore.createIndex('name', 'name', { unique: false });
            categoriesStore.createIndex('parentId', 'parentId', { unique: false });
            categoriesStore.createIndex('type', 'type', { unique: false });
        }

        // Create warehouses store
        if (!this.db.objectStoreNames.contains('warehouses')) {
            const warehousesStore = this.db.createObjectStore('warehouses', { keyPath: 'id', autoIncrement: true });
            warehousesStore.createIndex('name', 'name', { unique: false });
            warehousesStore.createIndex('status', 'status', { unique: false });
        }

        // Create customers store
        if (!this.db.objectStoreNames.contains('customers')) {
            const customersStore = this.db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
            customersStore.createIndex('name', 'name', { unique: false });
            customersStore.createIndex('phone', 'phone', { unique: false });
        }

        // Create suppliers store
        if (!this.db.objectStoreNames.contains('suppliers')) {
            const suppliersStore = this.db.createObjectStore('suppliers', { keyPath: 'id', autoIncrement: true });
            suppliersStore.createIndex('name', 'name', { unique: false });
            suppliersStore.createIndex('phone', 'phone', { unique: false });
        }

        console.log('✅ تم إنشاء جميع المتاجر والفهارس بنجاح');
    }

    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.add(data);

                request.onsuccess = () => {
                    console.log(`✅ تم إضافة البيانات إلى ${storeName}:`, data);
                    resolve(request.result);
                };
                request.onerror = (error) => {
                    console.error(`❌ خطأ في إضافة البيانات إلى ${storeName}:`, error);
                    reject(error);
                };
            } catch (error) {
                console.error(`❌ خطأ عام في إضافة البيانات إلى ${storeName}:`, error);
                reject(error);
            }
        });
    }

    async update(storeName, id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({ ...data, id });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async search(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async count(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async close() {
        if (this.db) {
            this.db.close();
            console.log('🔒 تم إغلاق قاعدة البيانات');
        }
    }

    async deleteDatabase() {
        return new Promise((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);
            
            deleteRequest.onsuccess = () => {
                console.log('🗑️ تم حذف قاعدة البيانات');
                resolve();
            };
            
            deleteRequest.onerror = () => {
                console.error('❌ فشل في حذف قاعدة البيانات:', deleteRequest.error);
                reject(deleteRequest.error);
            };
        });
    }
}

export default IndexedDBManager;