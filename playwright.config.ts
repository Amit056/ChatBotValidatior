import { defineConfig, devices } from '@playwright/test';
import { getEnv } from './src/helper/env/env';
import { invokeBrowser } from './src/helper/browsers/browserManager';

getEnv(); // Load environment variables from .env file based on ENV value
invokeBrowser(); // Initialize browser based on BROWSER environment variable  
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  workers: 1,
  timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 30000,
  retries: process.env.RETRIES ? parseInt(process.env.RETRIES) : 0,
  reporter: 'html',
  use: {
   screenshot: 'only-on-failure',
   video: 'retain-on-failure',
   trace: 'on', 
  }
});


