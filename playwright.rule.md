========================
1) TEST STRUCTURE
========================
- Always wrap all tests inside:
  test.describe('...', () => {
    // tests go here
  });

- Each test must be:
  - Self-contained
  - Independent

- Login must be performed ONLY if explicitly mentioned in the test steps.

- MANDATORY IMPORT:
  import { loginAsTeacher } from '../utils/login';

- If login is required:
  - You MUST use the predefined login methods based on user type:
    - Admin user → loginAsAdmin(page)
    - Faculty user → loginAsFaculty(page)
    - Student user → loginAsStudent(page)
    - Guest user → loginAsGuest(page)

- Do NOT assume:
  - Existing login sessions
  - Stored state
  - Data created by previous tests


========================
2) CONFIGURATION RULES
========================
- ALL required configuration MUST come from process.env

- Examples:
  process.env.BASEURL
  process.env.ADMINUSERNAME
  process.env.ADMINPASSWORD

- You MUST validate required environment variables BEFORE use.

- If any required variable is missing, throw an error:
  throw new Error('Missing required environment variable: VARIABLE_NAME');


========================
3) ASSERTION RULE (STRICT)
========================
- ALL validations MUST use Playwright expect:
  await expect(locator).toBeVisible();

- DO NOT use:
  - if (...) conditions for validation
  - manual boolean checks
  - custom validation logic

- DO NOT replace assertions with condition checks.

- throw is ONLY allowed for:
  - Missing configuration
  - Invalid environment setup

- throw MUST NOT be used for UI validation.


========================
4) TEST ISOLATION
========================
- Tests MUST NOT:
  - Depend on other tests
  - Share state

- Each test MUST:
  - Handle its own setup
  - Be independently executable


========================
5) SELECTOR STRATEGY
========================
- Prefer:
  - page.getByPlaceholder(...)
  - page.getByLabel(...)
  - page.getByRole(...)
  - page.getByTestId(...)

- Avoid:
  - XPath
  - Deep/nested CSS selectors
  -getByText(...)


- Use stable and readable selectors whenever possible.


========================
6) WAITING STRATEGY
========================
- Use Playwright auto-waiting via expect:
  await expect(...).toBeVisible();

- DO NOT use:
  waitForTimeout(...)

- Use explicit waits ONLY if absolutely necessary.


========================
7) OUTPUT REQUIREMENTS
========================
- Output ONLY Playwright test code.
- Do NOT include explanations.
- Ensure code is:
  - Clean
  - Readable
  - Ready to run


========================
8) EXPECTED RESULT VALIDATION
========================
- The agent MUST validate ALL expected results provided in the test case.

- Every expected result MUST have a corresponding assertion using:
  await expect(...)

- Do NOT skip any expected result.

- If multiple expected results are provided:
  - Each one MUST be validated with a separate assertion.

- Assertions MUST directly reflect the expected outcome described in the test case.

- Example:
  If expected result says:
    "User should see dashboard heading"

  Then assertion MUST be:
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

- DO NOT:
  - Combine multiple expected results into one assertion
  - Assume success without validation
  - Skip validations for minor UI elements

- If an expected result cannot be validated:
  - Attempt the closest meaningful assertion
  - NEVER omit validation entirely


========================
STRICT COMPLIANCE
========================
- If ANY rule is violated, regenerate the output.
- NEVER ignore these rules.