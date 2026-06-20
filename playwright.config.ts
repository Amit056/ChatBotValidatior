import { defineConfig, devices } from '@playwright/test';
import { getEnv } from './src/helper/env/env';
import { invokeBrowser } from './src/helper/browsers/browserManager';
import os from 'os';
import { Status } from 'allure-js-commons'; 

getEnv(); // Load environment variables from .env file based on ENV value
invokeBrowser(); // Initialize browser based on BROWSER environment variable  
export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  workers: 1,
  timeout: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 30000,
  retries: process.env.RETRIES ? parseInt(process.env.RETRIES) : 0,
  // reporter: 'html',
  reporter: [
  ['html', { open: 'never' }],
    ['line'],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: true,
        suiteTitle: true,
        links: {
          issue: {
            nameTemplate: "Issue #%s",
            urlTemplate: "https://issues.example.com/%s",
          },
          tms: {
            nameTemplate: "TMS #%s",
            urlTemplate: "https://tms.example.com/%s",
          },
          jira: {
            urlTemplate: (v:any) => `https://jira.example.com/browse/${v}`,
          },
        },
        categories: [
          {
            name: "foo",
            messageRegex: "bar",
            traceRegex: "baz",
            matchedStatuses: [Status.FAILED, Status.BROKEN],
          },
        ],
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
          node_version: process.version,
        },
      },
    ],
  
  ],
  use: {
   screenshot: 'only-on-failure',
   video: 'retain-on-failure',
   trace: 'on', 
  }
});


