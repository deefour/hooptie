declare module "*/firebase.client.js" {
  interface Configuration {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }

  const config: Configuration;

  export = config;
}
