/**
 * Test Case ID: TC-WL-008
 * Requirement ID: REQ-WL-02
 * Title: Verify that the system doesn't redirect users to non-valid URLs
 * Description: System should warn users about malformed URLs before redirecting
 * Priority: High
 * Severity: Major
 * Type: Security
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
    invalidURL: 'incorrect_url_format'
};

describe('TC-WL-008: System does not redirect users to non-valid URLs', function() {
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
    });

    it('Step 2: Should focus on Website field', async function() {
        const websiteField = await driver.wait(
            until.elementLocated(By.css(LOCATORS.websiteField)),
            TIMEOUT
        );
        await websiteField.click();
        
        const activeElement = await driver.switchTo().activeElement();
        expect(await activeElement.isDisplayed()).to.be.true;
    });

    it('Step 3: Should populate field with invalid URL', async function() {
        const websiteField = await driver.findElement(By.css(LOCATORS.websiteField));
        await websiteField.clear();
        await websiteField.sendKeys(TEST_DATA.invalidURL);
        
        const value = await websiteField.getAttribute('value');
        expect(value).to.equal(TEST_DATA.invalidURL);
    });

    it('Step 4: Should save changes', async function() {
        const clicked = await saveChanges(driver);
        expect(clicked).to.be.true;
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    it('Step 5: Should display profile with website link', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/`);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include(TEST_USER.username);
    });

    it('Step 6: Should warn about malformed URL before redirect (BUG: No warning)', async function() {
        const websiteLinks = await driver.findElements(
            By.css('a[rel*="me"], a[rel="me nofollow"]')
        );
        
        if (websiteLinks.length > 0) {
            const originalWindowHandles = await driver.getAllWindowHandles();
            
            await websiteLinks[0].click();
            await driver.sleep(2000);
            
            const newWindowHandles = await driver.getAllWindowHandles();
            
            let warningDisplayed = false;
            
            try {
                const alert = await driver.switchTo().alert();
                warningDisplayed = true;
                await alert.dismiss();
            } catch (e) {}
            
            if (newWindowHandles.length > originalWindowHandles.length) {
                await driver.switchTo().window(newWindowHandles[newWindowHandles.length - 1]);
                await driver.close();
                await driver.switchTo().window(originalWindowHandles[0]);
            }
            
            // BUG: System redirects without warning
            expect(warningDisplayed).to.be.true;
        } else {
            expect(true).to.be.true;
        }
    });
});

