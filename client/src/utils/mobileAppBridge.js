import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Cache app info
let cachedAppInfo = null;

/**
 * Check if running inside a native mobile app container (Android / iOS)
 */
export const isNativeMobileApp = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Get native app metadata (appId, appName, version)
 */
export const getAppInfo = async () => {
  if (cachedAppInfo) return cachedAppInfo;
  if (!isNativeMobileApp()) {
    return {
      id: 'web',
      name: 'CaSa Web',
      version: '1.0.0',
      appMode: 'customer',
    };
  }

  try {
    const info = await App.getInfo();
    let appMode = 'customer';
    if (info.id === 'com.casa.vendor') appMode = 'vendor';
    else if (info.id === 'com.casa.delivery') appMode = 'delivery';

    cachedAppInfo = {
      ...info,
      appMode,
    };
    return cachedAppInfo;
  } catch (err) {
    console.warn('Could not read native app info:', err);
    return {
      id: 'web',
      name: 'CaSa',
      version: '1.0.0',
      appMode: 'customer',
    };
  }
};

/**
 * Initialize native system UI (Status Bar, Splash Screen)
 */
export const initNativeSystemUI = async () => {
  if (!isNativeMobileApp()) return;

  try {
    const info = await getAppInfo();
    
    // Set status bar styling based on app
    if (info.appMode === 'vendor') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#7e22ce' });
    } else if (info.appMode === 'delivery') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0284c7' });
    } else {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0f172a' });
    }

    // Hide splash screen after slight delay to ensure first paint
    setTimeout(async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        // ignore
      }
    }, 800);
  } catch (err) {
    console.warn('Native UI initialization warning:', err);
  }
};
