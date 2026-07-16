import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.cloudaif.app',
  appName: 'Cloud AIF',
  webDir: 'public',
  server: {
    url: 'https://cloud-aif.vercel.app',
    cleartext: true
  }
};

export default config;
