import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "jp.medirealize.kiduki",
  appName: "ほんね。",
  webDir: "out",
  ios: {
    contentInset: "automatic",
    scrollEnabled: false,
  },
};

export default config;
