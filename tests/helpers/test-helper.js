/**
 * Test Helper Module for Letterboxd Selenium Tests
 * Provides common utilities, constants, and helper functions
 */

const { Builder, By, until, Key } = require('selenium-webdriver');

// Constants
const BASE_URL = 'https://letterboxd.com';
const SETTINGS_URL = `${BASE_URL}/settings/`;
const TIMEOUT = 10000;

// Test credentials
const TEST_USER = {
    username: 'formal_methods',
    password: 'Formal_Methods2025'
};

/**
 * Creates and configures a new WebDriver instance
 * @returns {Promise<WebDriver>} Configured WebDriver instance
 */
async function createDriver() {
    console.log(' -> Initializing WebDriver...');
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: TIMEOUT });
    console.log(' -> WebDriver initialized successfully.');
    return driver;
}

/**
 * Performs login with provided credentials
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} username - Username to login with
 * @param {string} password - Password to login with
 */
async function login(driver, username = TEST_USER.username, password = TEST_USER.password) {
    console.log(' -> Starting Login process...');
    await driver.get(BASE_URL);
    
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
    await usernameField.clear();
    await usernameField.sendKeys(username);
    
    const passwordField = await driver.findElement(By.css('input[name="password"]'));
    await passwordField.clear();
    await passwordField.sendKeys(password);
    
    // Submit login form
    const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
    await submitBtn.click();
    
    // Wait for login to complete
    await driver.sleep(2000);
    console.log(' -> Login completed (waited 2s).');
}

/**
 * Performs logout from the application
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
async function logout(driver) {
    try {
        // Click on profile/avatar to open dropdown
        const profileMenu = await driver.wait(
            until.elementLocated(By.css('.nav-profile, .avatar, [href*="/settings/"]')),
            TIMEOUT
        );
        await profileMenu.click();
        await driver.sleep(500);
        
        // Click logout link
        const logoutLink = await driver.wait(
            until.elementLocated(By.css('a[href="/logout/"], .logout-link')),
            TIMEOUT
        );
        await logoutLink.click();
        await driver.sleep(1000);
    } catch (e) {
        console.log('Logout attempt - may already be logged out');
    }
}

/**
 * Navigates to the settings page
 * @param {WebDriver} driver - Selenium WebDriver instance
 */
async function navigateToSettings(driver) {
    await driver.get(SETTINGS_URL);
    await driver.sleep(1000);
}

/**
 * Clicks on a specific tab in the settings page
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} tabName - Name of the tab (profile, avatar, auth, etc.)
 */
async function clickSettingsTab(driver, tabName) {
    const tabSelector = `a[href="/settings/${tabName}/"], .sub-nav a:contains("${tabName}")`;
    try {
        const tab = await driver.wait(
            until.elementLocated(By.css(`a[href="/settings/${tabName}/"]`)),
            TIMEOUT
        );
        await tab.click();
        await driver.sleep(1000);
    } catch (e) {
        // Try alternative selector
        const tabs = await driver.findElements(By.css('.sub-nav a, .settings-nav a'));
        for (const tab of tabs) {
            const text = await tab.getText();
            if (text.toLowerCase().includes(tabName.toLowerCase())) {
                await tab.click();
                await driver.sleep(1000);
                return;
            }
        }
    }
}

/**
 * Waits for and clicks an element
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 */
async function waitAndClick(driver, locator) {
    const element = await driver.wait(until.elementLocated(locator), TIMEOUT);
    await driver.wait(until.elementIsVisible(element), TIMEOUT);
    await element.click();
}

/**
 * Waits for element and enters text
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @param {string} text - Text to enter
 */
async function waitAndType(driver, locator, text) {
    const element = await driver.wait(until.elementLocated(locator), TIMEOUT);
    await driver.wait(until.elementIsVisible(element), TIMEOUT);
    await element.clear();
    await element.sendKeys(text);
}

/**
 * Checks if an element is present on the page
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {By} locator - Element locator
 * @returns {Promise<boolean>} True if element exists
 */
async function isElementPresent(driver, locator) {
    try {
        await driver.findElement(locator);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Gets the current URL
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @returns {Promise<string>} Current URL
 */
async function getCurrentUrl(driver) {
    return await driver.getCurrentUrl();
}

/**
 * Waits for URL to contain specific text
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} urlPart - Part of URL to check for
 */
async function waitForUrlContains(driver, urlPart) {
    await driver.wait(until.urlContains(urlPart), TIMEOUT);
}

/**
 * Takes a screenshot
 * @param {WebDriver} driver - Selenium WebDriver instance
 * @param {string} filename - Screenshot filename
 */
async function takeScreenshot(driver, filename) {
    const screenshot = await driver.takeScreenshot();
    const fs = require('fs');
    fs.writeFileSync(filename, screenshot, 'base64');
}

module.exports = {
    BASE_URL,
    SETTINGS_URL,
    TIMEOUT,
    TEST_USER,
    createDriver,
    login,
    logout,
    navigateToSettings,
    clickSettingsTab,
    waitAndClick,
    waitAndType,
    isElementPresent,
    getCurrentUrl,
    waitForUrlContains,
    takeScreenshot,
    By,
    until,
    Key
};
