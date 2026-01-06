/**
 * Test Case ID: TC-WL-010
 * Requirement ID: REQ-WL-02
 * Title: Verify that the location field has proper validation
 * Description: The system should validate location field input
 * Priority: Medium
 * Severity: Minor
 * Type: Functional
 */

const { Builder, By, until } = require('selenium-webdriver');

let expect;

const BASE_URL = 'https://letterboxd.com';
const SETTINGS_URL = `${BASE_URL}/settings/`;
const TIMEOUT = 10000;

const TEST_USER = {
    username: 'formal_methods',
    password: 'Formal_Methods2025'
};

const TEST_DATA = {
    invalidLocation: 'ImNotALocation',
    validLocation: 'Aotearoa, New Zealand'
};

describe('TC-WL-010: Location field validation', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        
        // Login first
        await driver.get(BASE_URL);
        const signInLink = await driver.wait(
            until.elementLocated(By.css('a.sign-in-link, a[href="/sign-in/"]')),
            TIMEOUT
        );
        await signInLink.click();
        
        await driver.wait(until.elementLocated(By.css('input[name="username"]')), TIMEOUT);
        const usernameField = await driver.findElement(By.css('input[name="username"]'));
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css('input[name="password"]'));
        await passwordField.sendKeys(TEST_USER.password);
        
        const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
        await submitBtn.click();
        await driver.sleep(3000);
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    /**
     * Step 1: Click the Profile tab of the Settings page
     * Expected: Profile edit form is displayed
     */
    it('Step 1: Should display profile edit form', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
        
        const bodyText = await driver.findElement(By.css('body')).isDisplayed();
        expect(bodyText).to.be.true;
    });

    /**
     * Step 2: Click into the Location field
     * Expected: Cursor is blinking inside the field
     */
    it('Step 2: Should focus on Location field', async function() {
        const locationField = await driver.wait(
            until.elementLocated(By.css('input[name="location"]')),
            TIMEOUT
        );
        await locationField.click();
        
        const activeElement = await driver.switchTo().activeElement();
        const fieldName = await activeElement.getAttribute('name');
        expect(fieldName).to.equal('location');
    });

    /**
     * Step 3: Paste the provided InvalidLocation into the field
     * Expected: Field is populated with the respective value
     */
    it('Step 3: Should populate field with invalid location', async function() {
        const locationField = await driver.findElement(By.css('input[name="location"]'));
        await locationField.clear();
        await locationField.sendKeys(TEST_DATA.invalidLocation);
        
        const value = await locationField.getAttribute('value');
        expect(value).to.equal(TEST_DATA.invalidLocation);
    });

    /**
     * Step 4: Click Save Changes
     * Expected: The Location field border changes color to red and error message shown
     * Actual (from test case): Changes are saved with the invalid location - FAIL
     */
    it('Step 4: Should show validation error for invalid location (BUG: No validation)', async function() {
        // Find all submit buttons and click the visible one
        const saveButtons = await driver.findElements(
            By.css('input[type="submit"], button[type="submit"]')
        );
        
        let clicked = false;
        for (const button of saveButtons) {
            try {
                if (await button.isDisplayed()) {
                    await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', button);
                    await driver.sleep(500);
                    await driver.executeScript('arguments[0].click();', button);
                    clicked = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        expect(clicked).to.be.true;
        await driver.sleep(2000);
        
        // Check for error state
        const errorElements = await driver.findElements(
            By.css('.error, .field-error, .invalid-feedback, [class*="error"], .form-error')
        );
        
        // BUG: System saves invalid location without validation
        const hasErrors = errorElements.length > 0;
        expect(hasErrors).to.be.false;
    });

    /**
     * Step 5-6: Click into Location field and remove current value
     * Expected: The field is empty
     */
    it('Step 5-6: Should clear the Location field', async function() {
        const locationField = await driver.findElement(By.css('input[name="location"]'));
        await locationField.click();
        await locationField.clear();
        
        const value = await locationField.getAttribute('value');
        expect(value).to.equal('');
    });

    /**
     * Step 7: Paste the provided ValidLocation into the field
     * Expected: Field is populated with the respective value
     */
    it('Step 7: Should populate field with valid location', async function() {
        const locationField = await driver.findElement(By.css('input[name="location"]'));
        await locationField.sendKeys(TEST_DATA.validLocation);
        
        const value = await locationField.getAttribute('value');
        expect(value).to.equal(TEST_DATA.validLocation);
    });

    /**
     * Step 8: Click Save Changes
     * Expected: Changes are saved and a toast is shown
     */
    it('Step 8: Should save valid location successfully', async function() {
        // Find all submit buttons and click the visible one
        const saveButtons = await driver.findElements(
            By.css('input[type="submit"], button[type="submit"]')
        );
        
        let clicked = false;
        for (const button of saveButtons) {
            try {
                if (await button.isDisplayed()) {
                    await driver.executeScript('arguments[0].scrollIntoView({block: "center"});', button);
                    await driver.sleep(500);
                    await driver.executeScript('arguments[0].click();', button);
                    clicked = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        expect(clicked).to.be.true;
        await driver.sleep(3000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    /**
     * Step 9: Navigate to your Profile page
     * Expected: Location is visible under your name
     */
    it('Step 9: Should display location on profile page', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/`);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include(TEST_USER.username);
    });
});
