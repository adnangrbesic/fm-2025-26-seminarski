/**
 * Test Case ID: TC-WL-005
 * Requirement ID: REQ-WL-02
 * Title: Verify that unauthenticated users cannot access profile settings
 * Description: Verify that unauthenticated users are redirected to login when accessing settings
 * Priority: High
 * Severity: Major
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

describe('TC-WL-005: Unauthenticated users cannot access profile settings', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    /**
     * Step 1: Open Letterboxd
     * Expected: Homepage is displayed
     */
    it('Step 1: Should display homepage when opening Letterboxd', async function() {
        await driver.get(BASE_URL);
        await driver.sleep(2000);
        
        const title = await driver.getTitle();
        expect(title.toLowerCase()).to.include('letterboxd');
    });

    /**
     * Step 2: Log in with valid credentials
     * Expected: User is logged in
     */
    it('Step 2: Should log in with valid credentials', async function() {
        // Click sign in link
        const signInLink = await driver.wait(
            until.elementLocated(By.css('a.sign-in-link, a[href="/sign-in/"]')),
            TIMEOUT
        );
        await signInLink.click();
        
        // Wait for login form
        await driver.wait(until.elementLocated(By.css('input[name="username"]')), TIMEOUT);
        
        // Enter credentials
        const usernameField = await driver.findElement(By.css('input[name="username"]'));
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css('input[name="password"]'));
        await passwordField.sendKeys(TEST_USER.password);
        
        // Submit
        const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
        await submitBtn.click();
        
        await driver.sleep(3000);
        
        // Verify logged in - profile element should be visible
        const profileElement = await driver.wait(
            until.elementLocated(By.css('.nav-profile, .avatar, [data-person]')),
            TIMEOUT
        );
        expect(await profileElement.isDisplayed()).to.be.true;
    });

    /**
     * Step 3: Navigate to the settings URL
     * Expected: Profile settings page displayed
     */
    it('Step 3: Should display settings page when logged in', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    /**
     * Step 4: Log out from letterboxd while on the settings page
     * Expected: Redirect to homepage
     */
    it('Step 4: Should redirect to homepage after logout', async function() {
        // Hover over profile/account icon to reveal menu
        const accountMenu = await driver.wait(
            until.elementLocated(By.css('.navitem.nav-account, .has-icon.toggle-menu')),
            TIMEOUT
        );
        
        const actions = driver.actions({ async: true });
        await actions.move({ origin: accountMenu }).perform();
        await driver.sleep(1000);
        
        // Click sign out link
        const signOutLink = await driver.wait(
            until.elementLocated(By.css('#sign-out, a[data-action*="logout"]')),
            TIMEOUT
        );
        await signOutLink.click();
        await driver.sleep(2000);
        
        // Verify logged out - check if login form is shown (Letterboxd shows modal instead of redirecting)
        const hasLoginForm = await driver.findElements(By.css('input[name="username"], input[name="password"]'));
        expect(hasLoginForm.length).to.be.greaterThan(0);
    });

    /**
     * Step 5: Navigate back to the settings URL
     * Expected: Redirect to login page
     */
    it('Step 5: Should redirect to login when accessing settings while logged out', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        // Letterboxd shows a login modal on the settings page instead of redirecting
        // Check for login form presence
        const hasLoginForm = await driver.findElements(By.css('input[name="username"], input[name="password"]'));
        expect(hasLoginForm.length).to.be.greaterThan(0);
    });

    /**
     * Step 6: Observe the page
     * Expected: The page is not accessible
     */
    it('Step 6: Should not allow access to settings page', async function() {
        // Check for login form or redirect indication
        const hasLoginForm = await driver.findElements(By.css('input[name="username"], input[name="password"]'));
        const currentUrl = await driver.getCurrentUrl();
        
        const isProtected = hasLoginForm.length > 0 || currentUrl.includes('sign-in') || !currentUrl.includes('settings');
        expect(isProtected).to.be.true;
    });
});
