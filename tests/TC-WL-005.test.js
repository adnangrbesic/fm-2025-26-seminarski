/**
 * Test Case ID: TC-WL-005
 * Requirement ID: REQ-WL-02
 * Title: Verify that unauthenticated users cannot access profile settings
 * Description: Verify that unauthenticated users are redirected to login when accessing settings
 * Priority: High
 * Severity: Major
 * Type: Functional
 * 
 * Koristi centralizirani setup iz setup.js
 * NAPOMENA: Ovaj test NE koristi globalni login jer testira ponašanje za neprijavljene korisnike
 */

const { Builder, By, until } = require('selenium-webdriver');
const {
    BASE_URL,
    SETTINGS_URL,
    TIMEOUT,
    TEST_USER,
    initChai,
    LOCATORS
} = require('./setup');

describe('TC-WL-005: Unauthenticated users cannot access profile settings', function() {
    this.timeout(60000);
    let driver;
    let expect;

    before(async function() {
        expect = await initChai();
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Step 1: Should display homepage when opening Letterboxd', async function() {
        await driver.get(BASE_URL);
        await driver.sleep(2000);
        
        const title = await driver.getTitle();
        expect(title.toLowerCase()).to.include('letterboxd');
    });

    it('Step 2: Should log in with valid credentials', async function() {
        const signInLink = await driver.wait(
            until.elementLocated(By.css(LOCATORS.signInLink)),
            TIMEOUT
        );
        await signInLink.click();
        
        await driver.wait(until.elementLocated(By.css(LOCATORS.usernameField)), TIMEOUT);
        
        const usernameField = await driver.findElement(By.css(LOCATORS.usernameField));
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css(LOCATORS.passwordField));
        await passwordField.sendKeys(TEST_USER.password);
        
        const submitBtn = await driver.findElement(By.css(LOCATORS.submitButton));
        await submitBtn.click();
        
        await driver.sleep(3000);
        
        const profileElement = await driver.wait(
            until.elementLocated(By.css(LOCATORS.profileMenu)),
            TIMEOUT
        );
        expect(await profileElement.isDisplayed()).to.be.true;
    });

    it('Step 3: Should display settings page when logged in', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    it('Step 4: Should redirect to homepage after logout', async function() {
        const accountMenu = await driver.wait(
            until.elementLocated(By.css('.navitem.nav-account, .has-icon.toggle-menu')),
            TIMEOUT
        );
        
        const actions = driver.actions({ async: true });
        await actions.move({ origin: accountMenu }).perform();
        await driver.sleep(1000);
        
        const signOutLink = await driver.wait(
            until.elementLocated(By.css('#sign-out, a[data-action*="logout"]')),
            TIMEOUT
        );
        await signOutLink.click();
        await driver.sleep(2000);
        
        const hasLoginForm = await driver.findElements(By.css(LOCATORS.usernameField));
        expect(hasLoginForm.length).to.be.greaterThan(0);
    });

    it('Step 5: Should redirect to login when accessing settings while logged out', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const hasLoginForm = await driver.findElements(By.css(LOCATORS.usernameField));
        expect(hasLoginForm.length).to.be.greaterThan(0);
    });

    it('Step 6: Should not allow access to settings page', async function() {
        const hasLoginForm = await driver.findElements(By.css(LOCATORS.usernameField));
        const currentUrl = await driver.getCurrentUrl();
        
        const isProtected = hasLoginForm.length > 0 || currentUrl.includes('sign-in') || !currentUrl.includes('settings');
        expect(isProtected).to.be.true;
    });
});
