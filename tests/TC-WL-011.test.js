/**
 * Test Case ID: TC-WL-011
 * Requirement ID: REQ-WL-BUG-01
 * Title: List Notification Subscription Login Flow (Bug Reproduction)
 * Description: Verify that clicking the notification bell on a list while logged out prompts login and redirects back
 * Note: This test is EXPECTED TO FAIL due to a known bug
 * Priority: High
 * Severity: Major
 * Type: Functional/Bug Verification
 * 
 * Koristi centralizirani setup iz setup.js
 * NAPOMENA: Ovaj test NE koristi globalni login jer testira ponašanje za neprijavljene korisnike
 */

const { Builder, By, until } = require('selenium-webdriver');
const {
    TIMEOUT,
    TEST_USER,
    LOCATORS,
    initChai
} = require('./setup');

const TEST_LIST_URL = 'https://letterboxd.com/brazyben/list/japanuary-challenge-2026/';

describe('TC-WL-011: List Notification Subscription Login Flow (Bug Repro)', function() {
    this.timeout(60000);
    let driver;
    let expect;

    before(async function() {
        expect = await initChai();
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        await driver.manage().deleteAllCookies();
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Step 1: Open list page as guest', async function() {
        await driver.get(TEST_LIST_URL);
        const title = await driver.getTitle();
        expect(title).to.include('Japanuary Challenge 2026');
        console.log('Step 1 Passed: Guest accessed list page.');
    });

    it('Step 2: Click notification bell and verify login prompt', async function() {
        const bellIcon = await driver.wait(
            until.elementLocated(By.css('.icon-notify, .icon-dontnotify, .notification-icon')),
            TIMEOUT
        );

        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", bellIcon);
        // Short sleep for scroll stability
        await driver.sleep(500);

        try {
            await bellIcon.click();
        } catch (e) {
            console.log('Standard click failed, attempting JS click...');
            await driver.executeScript("arguments[0].click();", bellIcon);
        }
        
        // Wait for login page
        await driver.wait(until.urlContains('sign-in'), TIMEOUT);

        const currentUrl = await driver.getCurrentUrl();
        const headerText = await driver.findElement(By.css('h1, h2')).getText().catch(() => '');
        
        const onLoginPage = currentUrl.includes('sign-in') || 
                           currentUrl.includes('login') || 
                           headerText.toLowerCase().includes('sign in');
                           
        expect(onLoginPage, 'Should be redirected to login page').to.be.true;
        console.log('Step 2 Passed: Redirected to login page.');
    });

    it('Step 3: Login and verify redirect back to list (BUG: Fails to redirect)', async function() {
        const usernameField = await driver.wait(until.elementLocated(By.css(LOCATORS.usernameField)), TIMEOUT);
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css(LOCATORS.passwordField));
        await passwordField.sendKeys(TEST_USER.password);
        
        const submitBtn = await driver.findElement(By.css(LOCATORS.submitButton));
        await submitBtn.click();
        
        // Wait for redirect back to the list
        try {
            await driver.wait(until.urlContains('japanuary-challenge-2026'), TIMEOUT);
        } catch (e) {
            console.log('Redirect wait timed out (Likely Bug Present)');
        }

        const currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after login attempt:', currentUrl);
        
        // BUG: User gets stuck in login loop instead of being redirected back
        // We verify correct behavior here, so the test will FAIL if the bug exists.
        console.log('Verifying if user is redirected back to the list...');
        expect(currentUrl).to.include('japanuary-challenge-2026', 'System failed to redirect back to the list after login (Known Bug)');
        console.log('Step 3 Passed: Redirect successful (Bug Fixed?)');
    });
});
