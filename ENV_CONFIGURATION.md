# Environment Configuration Guide

Your project is now fully configured to control settings from environment files (`.env.*`).

## Available Environments

- **dev** - Development environment (`.env.dev`)
- **qa** - QA environment (`.env.qa`)
- **prod** - Production environment (`.env.prod`)

## How to Use

### Running tests with different environments

```bash
# Run with dev environment (default)
npm run test/api

# Run with QA environment
cross-env ENV=qa npm run test/api

# Run with production environment
cross-env ENV=prod npm run test/e2e
```

## Environment File Variables

### API Configuration
```
API_BASE_TEACHER_URL      - Base URL for teacher API
API_BASE_REPORTS_URL      - Base URL for reports API
API_BASE_MASTERY_URL      - Base URL for mastery API
```

### Authentication
```
ORGANIZATION_ID           - Organization ID
TEACHER_ID                - Teacher ID
API_TOKEN                 - Bearer token for API requests
TEACHER_USERNAME          - Username for login
TEACHER_PASSWORD          - Password for login
BASEURL                   - Base URL for web application
```

### Playwright Configuration
```
BROWSER                   - Browser to use: chromium, firefox, or webkit (default: chromium)
HEADED                    - Run in headed mode: true or false (default: true)
SLOW_MO                   - Slow down test execution by N ms (default: 0)
TIMEOUT                   - Timeout for actions in ms (default: 60000)
WORKERS                   - Number of parallel workers (default: 1)
RETRIES                   - Number of retries for failed tests (default: 0)
```

## Examples

### Example 1: Change browser to Firefox for dev environment
Edit `.env.dev`:
```
BROWSER=firefox
```

Then run:
```bash
npm run test/e2e
```

### Example 2: Run with multiple workers in QA
Edit `.env.qa`:
```
WORKERS=4
BROWSER=chromium
HEADED=false
```

Then run:
```bash
cross-env ENV=qa npm run test/api
```

### Example 3: Production with slow motion debugging
Edit `.env.prod`:
```
BROWSER=chromium
HEADED=true
SLOW_MO=500
```

Then run:
```bash
cross-env ENV=prod npm run test/e2e
```

## Using Environment Variables in Tests

```typescript
import { getEnv } from '../helper/env/env';

// Get all environment configuration
const config = getEnv();

// Access specific values
console.log(config.BASEURL);           // Get base URL
console.log(config.API_TOKEN);         // Get API token
console.log(config.BROWSER);           // Get browser type
console.log(config.WORKERS);           // Get number of workers
```

## Adding New Environment Variables

1. Add the variable to all `.env.*` files
2. Add the property to the `EnvConfig` interface in `src/helper/env/env.ts`
3. Add the parsing logic in the `getEnv()` function
4. Use it in your tests or config

Example:
```typescript
// In env.ts
export interface EnvConfig {
  // ... existing properties
  MY_NEW_VAR: string;
}

export const getEnv = (): EnvConfig => {
  // ... existing code
  return {
    // ... existing returns
    MY_NEW_VAR: process.env.MY_NEW_VAR || 'default-value',
  };
};
```

## Tips

- The `playwright.config.ts` automatically loads the browser specified in the env file
- Only the specified browser will run - others are disabled
- `WORKERS=1` is recommended for e2e tests to avoid race conditions
- Use `HEADED=false` for CI/CD pipelines
- Different environments can have different `TIMEOUT` and `RETRIES` settings
