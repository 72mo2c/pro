// ======================================
// API Configuration Manager
// إدارة عنوان API مع دعم Tauri
// ======================================

import { readTextFile, writeTextFile, createDir, exists } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

// Default API URLs (fallback)
const DEFAULT_CONFIG = {
  COMPANY_API_URL: 'http://localhost:5000/api/v1/companies',
  API_URL: 'http://localhost:5000/api/v1',
};

// Config file name
const CONFIG_FILE = 'api-config.json';

class APIConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.isReady = false;
    this.isTauri = window.__TAURI__ !== undefined;
  }

  /**
   * Initialize and load configuration
   */
  async init() {
    if (this.isReady) return;

    try {
      if (this.isTauri) {
        // Running in Tauri - load from file
        await this.loadFromFile();
      } else {
        // Running in browser - use environment variables
        this.loadFromEnv();
      }
      
      this.isReady = true;
      console.log('✅ API Config loaded:', this.config);
    } catch (error) {
      console.warn('⚠️ Failed to load API config, using defaults:', error);
      this.isReady = true;
    }
  }

  /**
   * Load configuration from environment variables (browser mode)
   */
  loadFromEnv() {
    this.config = {
      COMPANY_API_URL: process.env.REACT_APP_COMPANY_API_URL || DEFAULT_CONFIG.COMPANY_API_URL,
      API_URL: process.env.REACT_APP_API_URL || DEFAULT_CONFIG.API_URL,
    };
  }

  /**
   * Load configuration from file (Tauri mode)
   */
  async loadFromFile() {
    try {
      const appDataDirPath = await appDataDir();
      const configPath = `${appDataDirPath}${CONFIG_FILE}`;

      // Check if config file exists
      const fileExists = await exists(configPath);

      if (fileExists) {
        // Read existing config
        const content = await readTextFile(configPath);
        const fileConfig = JSON.parse(content);
        
        this.config = {
          ...DEFAULT_CONFIG,
          ...fileConfig,
        };
        
        console.log('📄 Loaded API config from file');
      } else {
        // Create default config file
        await this.saveToFile();
        console.log('📄 Created default API config file');
      }
    } catch (error) {
      console.error('❌ Error loading config from file:', error);
      throw error;
    }
  }

  /**
   * Save configuration to file (Tauri only)
   */
  async saveToFile() {
    if (!this.isTauri) {
      console.warn('⚠️ Cannot save config in browser mode');
      return;
    }

    try {
      const appDataDirPath = await appDataDir();
      
      // Ensure directory exists
      try {
        await createDir(appDataDirPath, { recursive: true });
      } catch (e) {
        // Directory might already exist
      }

      const configPath = `${appDataDirPath}${CONFIG_FILE}`;
      const content = JSON.stringify(this.config, null, 2);

      await writeTextFile(configPath, content);
      console.log('💾 API config saved to file');
    } catch (error) {
      console.error('❌ Error saving config to file:', error);
      throw error;
    }
  }

  /**
   * Get Company API Base URL
   */
  getCompanyApiUrl() {
    return this.config.COMPANY_API_URL;
  }

  /**
   * Get General API Base URL
   */
  getApiUrl() {
    return this.config.API_URL;
  }

  /**
   * Update Company API URL
   */
  async setCompanyApiUrl(url) {
    this.config.COMPANY_API_URL = url;
    
    if (this.isTauri) {
      await this.saveToFile();
    }
  }

  /**
   * Update General API URL
   */
  async setApiUrl(url) {
    this.config.API_URL = url;
    
    if (this.isTauri) {
      await this.saveToFile();
    }
  }

  /**
   * Get full configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update full configuration
   */
  async updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig,
    };

    if (this.isTauri) {
      await this.saveToFile();
    }
  }

  /**
   * Reset to default configuration
   */
  async reset() {
    this.config = { ...DEFAULT_CONFIG };
    
    if (this.isTauri) {
      await this.saveToFile();
    }
  }

  /**
   * Check if running in Tauri
   */
  isTauriApp() {
    return this.isTauri;
  }

  /**
   * Get config file path (Tauri only)
   */
  async getConfigPath() {
    if (!this.isTauri) return null;
    
    const appDataDirPath = await appDataDir();
    return `${appDataDirPath}${CONFIG_FILE}`;
  }
}

// Create singleton instance
const apiConfig = new APIConfigManager();

// Initialize on load
apiConfig.init().catch(console.error);

export default apiConfig;
