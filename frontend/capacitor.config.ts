import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.quickeye.app",
  appName: "QuickEye",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#09090b",
  },
};

export default config;
