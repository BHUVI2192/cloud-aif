import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.ogenzo.app',
  appName: 'Ogenzo',
  webDir: 'public',
  server: {
    url: 'https://cloud-aif.vercel.app',
    allowNavigation: [
      'cloud-aif.vercel.app',
      '*.vercel.app'
    ],
    cleartext: true
  }
};

export default config;
