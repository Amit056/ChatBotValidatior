export { }

/**
 * Type definitions for raw process.env variables (always strings)
 * For properly typed environment config, use getEnv() from src/helper/env/env.ts
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Environment Selection
            ENV: 'dev' | 'qa' | 'prod' | 'aci' | 'production' | 'staging';
            
            // API Configuration
            API_BASE_TEACHER_URL: string;
            API_BASE_REPORTS_URL: string;
            API_BASE_MASTERY_URL: string;
            
            // Authentication
            ORGANIZATION_ID: string;
            TEACHER_ID: string;
            API_TOKEN: string;
            TEACHER_USERNAME: string;
            TEACHER_PASSWORD: string;
            
            // Application URLs
            BASEURL: string;
            URL: string;
            
            // Playwright Configuration (raw strings - parsed in env.ts)
            BROWSER: 'chromium' | 'firefox' | 'webkit' | 'chrome' | 'edge';
            SLOW_MO: string; // milliseconds as string
            TIMEOUT: string; // milliseconds as string
            WORKERS: string; // number as string
            RETRIES: string; // number as string            SCREENSHOT?: 'on' | 'off' | 'only-on-failure';
            // Legacy Auth (deprecated)
            Teacher: string;
            Password: string;
            AdminUserName: string;
            AdminPassWord: string;
            LearnerPassWord: string;
        }
    }
}