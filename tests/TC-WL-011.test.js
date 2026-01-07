/**
 * Test Case ID: TC-WL-011
 * Requirement ID: REQ-WL-BUG-01
 * Title: List Notification Subscription Login Flow (Bug Reproduction)
 * Description: Verify that clicking the notification bell on a list while logged out prompts login and successfully redirects back to the list.
 * Note: This test is EXPECTED TO FAIL due to a known bug where the user gets stuck in the login loop.
 * Priority: High
 * Severity: Major
 * Type: Functional/Bug Verification
 */

const { createDriver, TEST_USER, TIMEOUT, By, until } = require('./helpers/test-helper');

let expect;
const TEST_LIST_URL = 'https://letterboxd.com/brazyben/list/japanuary-challenge-2026/';

describe('TC-WL-011: List Notification Subscription Login Flow (Bug Repro)', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await createDriver();
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
    });

    it('Step 2: Click notification bell and verify login prompt', async function() {
        const bellIcon = await driver.wait(
            until.elementLocated(By.css('.content-wrap .list-link .icon-notify, .icon-dontnotify, a[href*="settings/notifications"], .notification-icon')),
            TIMEOUT
        );

        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", bellIcon);
        await driver.sleep(1000);

        try {
            await bellIcon.click();
        } catch (e) {
            console.log('Standard click failed, attempting JS click...');
            await driver.executeScript("arguments[0].click();", bellIcon);
        }
        await driver.sleep(2000);

        const currentUrl = await driver.getCurrentUrl();
        const headerText = await driver.findElement(By.css('h1, h2')).getText().catch(() => '');
        
        const onLoginPage = currentUrl.includes('sign-in') || 
                           currentUrl.includes('login') || 
                           headerText.toLowerCase().includes('sign in');
                           
        expect(onLoginPage, 'Should be redirected to login page').to.be.true;
    });

    it('Step 3: Login and verify redirect back to list', async function() {
        const usernameField = await driver.wait(until.elementLocated(By.css('input[name="username"]')), TIMEOUT);
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css('input[name="password"]'));
        await passwordField.sendKeys(TEST_USER.password);
        
        const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
        await submitBtn.click();
        
        await driver.sleep(5000);

        const currentUrl = await driver.getCurrentUrl();
        console.log('Current URL after login attempt:', currentUrl);
        
        expect(currentUrl).to.include('japanuary-challenge-2026', 'System failed to redirect back to the list after login (Known Bug)');
    });
});
