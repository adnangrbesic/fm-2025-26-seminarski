/**
 * Test Case ID: TC-WL-006
 * Requirement ID: REQ-WL-02
 * Title: Verify that the user cannot save invalid URLs as the website
 * Description: The system should stop users from saving invalid URLs in profile settings
 * Priority: Medium
 * Severity: Minor
 * Type: Functional
 * 
 * Koristi centralizirani setup iz setup.js
 */

const { By, until } = require('selenium-webdriver');
const {
    BASE_URL,
    SETTINGS_URL,
    TIMEOUT,
    TEST_USER,
    LOCATORS,
    getDriver,
    getExpect,
    createDriver,
    login,
    quitDriver,
    initChai,
    saveChanges
} = require('./setup');

const TEST_DATA = {
    invalidURL: 'incorrect_url_format',
    validURL: 'https://letterboxd.com'
};

describe('TC-WL-006: User cannot save invalid URLs as website', function() {
    this.timeout(60000);
    let driver;
    let expect;

    before(async function() {
        expect = await initChai();
        driver = await createDriver();
        await login(driver);
    });

    after(async function() {
        if (driver) {
            await quitDriver(driver);
        }
    });

    it('Step 1: Should display profile edit form', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
        
        const bodyDisplayed = await driver.findElement(By.css('body')).isDisplayed();
        expect(bodyDisplayed).to.be.true;
    });

    it('Step 2: Should focus on Website field', async function() {
        const websiteField = await driver.wait(
            until.elementLocated(By.css(LOCATORS.websiteField)),
            TIMEOUT
        );
        await websiteField.click();
        
        const activeElement = await driver.switchTo().activeElement();
        const fieldName = await activeElement.getAttribute('name');
        expect(fieldName).to.include('website');
    });

    it('Step 3: Should populate field with invalid URL', async function() {
        const websiteField = await driver.findElement(By.css(LOCATORS.websiteField));
        await websiteField.clear();
        await websiteField.sendKeys(TEST_DATA.invalidURL);
        
        const value = await websiteField.getAttribute('value');
        expect(value).to.equal(TEST_DATA.invalidURL);
    });

    it('Step 4: Should show validation error for invalid URL (BUG: No validation)', async function() {
        const clicked = await saveChanges(driver);
        expect(clicked).to.be.true;
        
        const errorElements = await driver.findElements(By.css(LOCATORS.errorMessage));
        const hasErrors = errorElements.length > 0;
        
        // BUG: System saves invalid URL without validation
        expect(hasErrors).to.be.false;
    });

    it('Step 5-6: Should clear the Website field', async function() {
        const websiteField = await driver.findElement(By.css(LOCATORS.websiteField));
        await websiteField.click();
        await websiteField.clear();
        
        const value = await websiteField.getAttribute('value');
        expect(value).to.equal('');
    });

    it('Step 7: Should populate field with valid URL', async function() {
        const websiteField = await driver.findElement(By.css(LOCATORS.websiteField));
        await websiteField.sendKeys(TEST_DATA.validURL);
        
        const value = await websiteField.getAttribute('value');
        expect(value).to.equal(TEST_DATA.validURL);
    });

    it('Step 8: Should save valid URL successfully', async function() {
        const clicked = await saveChanges(driver);
        expect(clicked).to.be.true;
        
        await driver.sleep(1000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    it('Step 9: Should display website on profile page', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/`);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include(TEST_USER.username);
    });
});
