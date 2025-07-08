
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.numberguard.contacts',
  appName: 'NumberGuard',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff"
    }
  }
};

export default config;
