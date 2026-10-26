
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.allprominentgh.bestsales",
  appName: "BEST SALES GHANA",
  webDir: "www",
  server: {
    url: "https://bestsalesgh.com",
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#123B82",
      showSpinner: false
    }
  }
};

export default config;
