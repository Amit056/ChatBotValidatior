import { expect, TestInfo } from '@playwright/test';
import { Locator, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import logger from '../logger';
import { PDFParse } from 'pdf-parse';



let element: Locator;


export class CommonUtils {
    static readonly MAX_TIMEOUT = 1 * 60 * 1000;

    readonly page: Page;

    constructor(page: Page, testInfo?: TestInfo) {
        this.page = page;
    }

    /**
     * 
     * @param url - URL to navigate to
     */
    async navigateToUrl(url: string) {
        await this.page.goto(url);
    }

    /**
     * method to click on an element
     * @param locator - Locator of the element to be clicked
     */
    async clickElement(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeVisible({ timeout: CommonUtils.MAX_TIMEOUT });
        await this.page.waitForLoadState('load', { timeout: CommonUtils.MAX_TIMEOUT });
        await element.click();
        await this.page.waitForLoadState('load', { timeout: CommonUtils.MAX_TIMEOUT });
        logger.info(`Clicked on element: ${element}`);
    }

    /** 
     * method to fill text in an input field
     */

    async fillInputField(element: Locator, text: string) {
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeVisible({ timeout: CommonUtils.MAX_TIMEOUT });
        await element.fill(text);
        logger.info(`Filled input field: ${element} with text: ${text}`);
    }

    /**
     *  method to clear field 
     */

    async clearInputField(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeVisible({ timeout: CommonUtils.MAX_TIMEOUT });
        await element.clear();
        logger.info(`Cleared input field: ${element}`);
    }

    /**
     * method to hover over an element
     */
    async hoverOverElement(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeVisible({ timeout: CommonUtils.MAX_TIMEOUT });
        await element.hover();
        logger.info(`Hovered over element: ${element}`);
    }

    /**
     * method to validate element is visible
     */
    async validateElementIsVisible(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeVisible({ timeout: CommonUtils.MAX_TIMEOUT });
        logger.info(`Element is visible: ${element}`);
    }
    /**
     * method to validate element is displayed
     */
    async validateElementIsDisplayed(element: Locator) {
        await element.waitFor({ state: 'attached', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeAttached({ timeout: CommonUtils.MAX_TIMEOUT });
        logger.info(`Element is displayed: ${element}`);
    }

    /**
     * 
     * Validate that checkbox is selected
     */
    async validateCheckboxIsChecked(element: Locator) {
        logger.info(`Validating checkbox is selected: ${element}`);
        await element.waitFor({ state: 'visible', timeout: CommonUtils.MAX_TIMEOUT });
        await expect(element).toBeChecked({ timeout: 5000 });
        logger.info(`Checkbox is selected: ${element}`);

    }

    /**
* 
* Validate that checkbox is selected
*/
    async validateCheckboxIsUnChecked(element: Locator) {
        logger.info(`Validating checkbox is selected: ${element}`);
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).not.toBeChecked({ timeout: 5000 });
        logger.info(`Checkbox is selected: ${element}`);

    }




    /**
     * method to select a checkbox
     */
    async selectCheckbox(element: Locator) {
        await element.evaluate((e1) => e1.style.display = "inline");// Force the element to be visible
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toBeVisible({ timeout: 5000 });
        await element.check();
        this.validateCheckboxIsChecked(element);
        logger.info(`Selected checkbox: ${element}`);
    }
    /**
     * method to select a UnCheckbox
     */
    async UnCheckbox(element: Locator) {
        await element.evaluate((e1) => e1.style.display = "inline");// Force the element to be visible
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toBeVisible({ timeout: 5000 });
        await element.uncheck();
        this.validateCheckboxIsUnChecked(element);
        logger.info(`Unselected checkbox: ${element}`);
    }

    /**
     * method to validate element is not visible
     */
    async validateElementIsNotVisible(element: Locator) {
        await element.waitFor({ state: 'hidden', timeout: 5000 });
        await expect(element).toBeHidden({ timeout: 5000 });
        await expect(element).not.toBeVisible({ timeout: 5000 });
        logger.info(`Element is not visible: ${element}`);
    }

    /**
     * 
     * method to press keyboard keys like Enter,Tab,delete,pageup,pagedown ,ArrowDown ,arrowup etc
     */
    async pressKey(key: string) {
        await this.page.keyboard.press(key);
        logger.info(`Pressed key: ${key}`);
    }


    /**
     * method for the element to be enabled
     */
    async validateElementIsEnabled(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toBeEnabled({ timeout: 5000 });
        logger.info(`Element is enabled: ${element}`);
    }

    /**
     * method for the element to be disabled
     */
    async validateElementIsDisabled(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toBeDisabled({ timeout: 5000 });
        logger.info(`Element is disabled: ${element}`);
    }

    /**
     * element to have text
     */
    async validateElementHasText(element: Locator, text: string) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toHaveText(text, { timeout: 5000 });
        logger.info(`Element has text: ${text}`);
    }

    /**
     * element have attribute
     */
    async validateElementHasAttribute(element: Locator, attribute: string, value: string) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toHaveAttribute(attribute, value, { timeout: 5000 });
        logger.info(`Element has attribute: ${attribute} with value: ${value}`);
    }


    /**
     * validate page title
     * @param expectedTitle - expected title of the page
     */
    async validatePageTitle(expectedTitle: string) {
        await this.page.waitForLoadState('load', { timeout: 5000 });
        const actualTitle = await this.page.title();
        expect(actualTitle).toBe(expectedTitle);
        logger.info(`Page title is as expected: ${expectedTitle}`);
    }

    /**
     * method to get input field value
     */
    async getInputFieldValue(element: Locator): Promise<string> {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toBeVisible({ timeout: 5000 });
        const value = await element.inputValue();
        logger.info(`Got input field value: ${value} from element: ${element}`);
        return value;
    }

    /**
     * valiadate two arrays
     */
    async validateTwoArrays(arr1: any[], arr2: any[]): Promise<boolean> {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }

        }
        logger.info(`Validated two arrays are equal: ${arr1} and ${arr2}`);
        return true;


    }


    /**
     * generate charcter by size for a string
     */
    async generateRandomString(stringToBeRepeated: string, size: string): Promise<string> {
        let result = '';
        let j = 0;
        while (j <= Number(size)) {

            if (result.length === Number(size)) {
                break;
            }

            if (j == stringToBeRepeated.length) {
                j = 0;
            }

            result += stringToBeRepeated.charAt(j);
            j++;
        }

        return result;
    }


    /**
     * fill field Sequentially
     */
    async fillFieldSequentially(element: Locator, value: string, delay?: number) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await this.clickElement(element);
        await element.pressSequentially(value, { delay });
        logger.info(`Filled field sequentially with value: ${value}`);

    }


    /**
     * navigate back
     */
    async navigatedBack() {
        await this.page.goBack({ waitUntil: 'load', timeout: 5000 });
        logger.info(`Navigated back to previous page`);
    }

    /**
     * Filed is editable
     */
    async validateFieldIsEditable(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).not.toHaveAttribute('readonly', '', { timeout: 5000 });
        logger.info(`Field is editable: ${element}`);
    }
    /**
     * Filed is Not editable
     */
    async validateFieldIsNotEditable(element: Locator) {
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await expect(element).toHaveAttribute('readonly', '', { timeout: 5000 });
        logger.info(`Field is editable: ${element}`);
    }


    /**
     * pause page for given time
     */
    async pausePage(timeout: number) {
        await new Promise<void>(resolve => setTimeout(resolve, timeout));
        await this.page.pause();
        logger.info(`Paused page for ${timeout} milliseconds`);
    }

    /**
     * wait for element to be Disappeared
     */
    async waitForElementToBeDisappeared(element: Locator) {
        await element.waitFor({ state: 'hidden', timeout: 5000 });
        logger.info(`Element has disappeared: ${element}`);
    }


    /**
     * read json file
     * @param filePath - path of the json file
     */
    async readJsonFile(filePath: string): Promise<any> {
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
        const fileContent = fs.readFileSync(absolutePath, 'utf-8');
        return JSON.parse(fileContent);


    }

    /**
     * get column index by column label of table
     * 
     */
    async getColumnIndexByLabel(columnLabel: string): Promise<number> {
        const columnHeaders = this.page.locator('table thead tr th');
        let index = 0;

        for (let i = 0; i < await columnHeaders.count(); i++) {
            const headerText = await columnHeaders.nth(i).innerText();
            if (headerText.trim() === columnLabel) {
                index = i + 1;
                break;
            }
        }
        return index;
    }
    /**
     * get cell webelement by filtering row Text and column index
     */

    async getCellWebelement(filterRowText: string, columnIndex: number): Promise<Locator> {
        const table = await this.page.locator('table');
        const rows = table.locator(`tbody tr`);
        const matchedRow = rows.filter({
            has: this.page.locator(`td`),
            hasText: filterRowText
        })
        const cell = matchedRow.locator(`td:nth-child(${columnIndex})`);
        return cell;
    }


    /**
     * pagination logic
     */
    async navigateToPageInPagination(pageNumber: number) {
        let count1 = 0;
        let hasNextPage = true;
        while (hasNextPage && count1 < Number(pageNumber)) {
            // get the data in current page
        }

        if (await this.page.getByLabel(">").isVisible()) {
            await this.clickElement(this.page.getByLabel(">"));
            count1++;
        }

        else
            hasNextPage = false;
    }

    /**
     * Using the nullish coalescing operator (??) 
     * const targetPage = page ?? this.page;
     *  OR
     * Using a ternary operator
     * const targetPage = page ? page : this.page;
     */
    async getScreenshot(pageName: string, testInfo: TestInfo, page?: Page) {

        const targetPage = page ?? this.page;
        await testInfo.attach(`page Screenshot : ${pageName}`, {
            body: await targetPage.screenshot({ fullPage: true }),
            contentType: 'image/png',
        });
    }
    async downloadFile(downloadButton: Locator, downloadDir: string, page?: Page): Promise<string> {
        const targetPage = page ?? this.page;
        const [download] = await Promise.all([
            targetPage.waitForEvent('download'),
            downloadButton.click()
        ]);

        // Verify download completed successfully
        expect(await download.failure()).toBeNull();

        const fileName = download.suggestedFilename();
        const localWorkspacePath = path.join(downloadDir, fileName);

        await download.saveAs(localWorkspacePath);

        logger.info(`Downloaded file: ${fileName}`);
        // Verify file name
        expect(download.suggestedFilename()).toContain('.pdf');

        // Get the temporary file path
        const filePath = await download.path();

        //reads the downloaded PDF into memory as a Buffer.
        const buffer = fs.readFileSync(filePath!);

        /**
         * creates a PDF parser instance from a Node Buffer containing the downloaded PDF bytes.
         *  loads the PDF bytes into the parser
         */
        const parser = new PDFParse({ data: buffer });

        //extracts the readable text content
        const pdfData = await parser.getText();

        //console.log(pdfData.text);

        // Always clean up
        await parser.destroy();

        // Validate the PDF content
        expect(pdfData.text).toContain('Teacher: Tom Gates');

        return filePath;
    }
}


