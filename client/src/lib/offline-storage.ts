// Offline storage service for PWA functionality
export class OfflineStorage {
  private dbName = 'AstrologyPortalDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Initialize IndexedDB for offline storage
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different data types
        if (!db.objectStoreNames.contains('ephemeris')) {
          const ephemerisStore = db.createObjectStore('ephemeris', { keyPath: 'id', autoIncrement: true });
          ephemerisStore.createIndex('date_location', ['date', 'location'], { unique: false });
        }

        if (!db.objectStoreNames.contains('natalCharts')) {
          db.createObjectStore('natalCharts', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('aspectMonitors')) {
          db.createObjectStore('aspectMonitors', { keyPath: 'id', autoIncrement: true });
        }

        if (!db.objectStoreNames.contains('userPreferences')) {
          db.createObjectStore('userPreferences', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('offlineQueue')) {
          const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'id', autoIncrement: true });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Store ephemeris data for offline access
  async storeEphemerisData(data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['ephemeris'], 'readwrite');
    const store = transaction.objectStore('ephemeris');
    
    // Add timestamp for cache management
    const dataWithTimestamp = {
      ...data,
      cachedAt: new Date().toISOString(),
      id: `${data.date}_${data.location || 'default'}`
    };
    
    await store.put(dataWithTimestamp);
  }

  // Retrieve ephemeris data for offline use
  async getEphemerisData(date: string, location?: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['ephemeris'], 'readonly');
    const store = transaction.objectStore('ephemeris');
    
    const key = `${date}_${location || 'default'}`;
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Check if data is still fresh (within 24 hours)
          const cached = new Date(result.cachedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - cached.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            resolve(result);
          } else {
            resolve(null); // Data is stale
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Store natal charts offline
  async storeNatalChart(chart: any): Promise<number> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['natalCharts'], 'readwrite');
    const store = transaction.objectStore('natalCharts');
    
    const chartWithTimestamp = {
      ...chart,
      createdAt: chart.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const request = store.add(chartWithTimestamp);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all natal charts
  async getAllNatalCharts(): Promise<any[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['natalCharts'], 'readonly');
    const store = transaction.objectStore('natalCharts');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Store user preferences
  async storeUserPreference(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['userPreferences'], 'readwrite');
    const store = transaction.objectStore('userPreferences');
    
    await store.put({ key, value, updatedAt: new Date().toISOString() });
  }

  // Get user preference
  async getUserPreference(key: string): Promise<any | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['userPreferences'], 'readonly');
    const store = transaction.objectStore('userPreferences');
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Queue operations for when connection is restored
  async queueOfflineOperation(operation: {
    type: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    data: any;
    endpoint: string;
  }): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    const queueItem = {
      ...operation,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    await store.add(queueItem);
  }

  // Get pending operations to sync
  async getPendingOperations(): Promise<any[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['offlineQueue'], 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const index = store.index('timestamp');
    const request = index.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const operations = request.result || [];
        resolve(operations.filter(op => !op.synced));
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Mark operation as synced
  async markOperationSynced(id: number): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['offlineQueue'], 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    
    const request = store.get(id);
    request.onsuccess = () => {
      const operation = request.result;
      if (operation) {
        operation.synced = true;
        store.put(operation);
      }
    };
  }

  // Clear old cached data to manage storage space
  async clearOldCache(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['ephemeris'], 'readwrite');
    const store = transaction.objectStore('ephemeris');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const allData = request.result || [];
      const now = new Date();
      
      allData.forEach(item => {
        const cached = new Date(item.cachedAt);
        const daysDiff = (now.getTime() - cached.getTime()) / (1000 * 60 * 60 * 24);
        
        // Remove data older than 7 days
        if (daysDiff > 7) {
          store.delete(item.id);
        }
      });
    };
  }

  // Get storage usage info
  async getStorageInfo(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    
    return { used: 0, quota: 0 };
  }
}

// Create singleton instance
export const offlineStorage = new OfflineStorage();