/**
 * Globalni Setup i Teardown za sve Letterboxd testove
 * Koristi Mocha root hooks za dijeljeni driver i login
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ============== KONSTANTE ==============
const BASE_URL = 'https://letterboxd.com';
const SETTINGS_URL = `${BASE_URL}/settings/`;
const TIMEOUT = 30000;

// Test kredencijali
const TEST_USER = {
    username: 'formal_methods',
    password: 'Formal_Methods2025'
};

// ============== LOKATORI (relativni CSS selektori) ==============
const LOCATORS = {
    // Navigacija
    signInLink: 'a[href*="sign-in"]',
    profileMenu: '.nav-profile, .avatar',
    logoutLink: 'a[href*="logout"]',
    
    // Login forma
    usernameField: 'input[name="username"]',
    passwordField: 'input[name="password"]',
    submitButton: 'input[type="submit"], button[type="submit"]',
    
    // Settings stranica
    profileTab: 'a[href*="settings/profile"]',
    authTab: 'a[href*="settings/auth"]',
    avatarTab: 'a[href*="settings/avatar"]',
    
    // Polja forme
    locationField: 'input[name="location"]',
    websiteField: 'input[name="website"]',
    emailField: 'input[name="email"]',
    bioField: 'textarea[name="bio"]',
    
    // Gumbi
    saveButton: 'input[type="submit"], button[type="submit"]',
    
    // Poruke
    errorMessage: '.error, .field-error, [class*="error"]',
    successMessage: '.success, .toast, [role="alert"]'
};

// ============== GLOBALNE VARIJABLE ==============
let driver = null;
let expect = null;

// ============== SETUP FUNKCIJE ==============

/**
 * Kreira novi WebDriver instance
 */
async function createDriver() {
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Odkomentiraj za headless mode
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--ignore-certificate-errors');
    options.addArguments('--log-level=3');
    options.addArguments('--disable-logging');
    // options.addArguments('--blink-settings=imagesEnabled=false');
    // options.setPageLoadStrategy('eager'); // Reverted to normal strategy to ensure JS loads
    
    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: 2000 });
    
    return driver;
}

/**
 * Izvršava login na stranicu
 */
async function login(customDriver = null) {
    const d = customDriver || driver;
    
    // Navigiraj na sign-in stranicu
    await d.get(`${BASE_URL}/sign-in/`);
    
    // Unesi kredencijale
    await d.wait(until.elementLocated(By.css(LOCATORS.usernameField)), TIMEOUT);
    const usernameField = await d.findElement(By.css(LOCATORS.usernameField));
    await usernameField.clear();
    await usernameField.sendKeys(TEST_USER.username);
    
    const passwordField = await d.findElement(By.css(LOCATORS.passwordField));
    await passwordField.clear();
    await passwordField.sendKeys(TEST_USER.password);
    
    // Čekaj dok se gumb ne omogući (poll svake sekunde)
    let attempts = 0;
    let submitBtn;
    
    // Wait for button to be clickable
    try {
        submitBtn = await d.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
        await d.wait(until.elementIsEnabled(submitBtn), 5000);
    } catch (e) {
         // Fallback selectors
         submitBtn = await d.findElement(By.css('input[type="submit"]'));
    }
    
    // Scroll i klik putem JavaScript-a
    await d.executeScript('arguments[0].scrollIntoView({block: "center"});', submitBtn);
    await d.sleep(200);
    await d.executeScript('arguments[0].click();', submitBtn);
    
    // Wait for login to complete (check for user menu or nav profile)
    try {
        await d.wait(until.elementLocated(By.css('.nav-profile, .avatar, .profile-link')), 10000);
    } catch(e) {
        console.warn('Warning: Login validation timed out, but proceeding...');
    }
}

/**
 * Navigira na settings stranicu
 */
async function navigateToSettings(customDriver = null) {
    const d = customDriver || driver;
    await d.get(SETTINGS_URL);
    await d.sleep(2000);
}

/**
 * Navigira na profil stranicu
 */
async function navigateToProfile(customDriver = null) {
    const d = customDriver || driver;
    await d.get(`${BASE_URL}/${TEST_USER.username}/`);
    await d.sleep(2000);
}

// ============== TEARDOWN FUNKCIJE ==============

/**
 * Izvršava logout
 */
async function logout(customDriver = null) {
    const d = customDriver || driver;
    try {
        // Brišemo cookie za odjavu
        await d.manage().deleteCookie('letterboxd.user.CURRENT');
        await d.sleep(500);
    } catch (e) {
        // Ignoriraj greške pri odjavi
    }
}

/**
 * Zatvara WebDriver
 */
async function quitDriver(customDriver = null) {
    const d = customDriver || driver;
    if (d) {
        await d.quit();
        driver = null;
    }
}

// ============== HELPER FUNKCIJE ==============

/**
 * Čeka i klikne element koristeći JavaScript (pouzdanije)
 */
async function clickElement(selector, customDriver = null) {
    const d = customDriver || driver;
    const elements = await d.findElements(By.css(selector));
    
    for (const element of elements) {
        try {
            if (await element.isDisplayed()) {
                await d.executeScript('arguments[0].scrollIntoView({block: "center"});', element);
                await d.sleep(500);
                await d.executeScript('arguments[0].click();', element);
                return true;
            }
        } catch (e) {
            continue;
        }
    }
    return false;
}

/**
 * Čeka dok element postane vidljiv
 */
async function waitForElement(selector, customDriver = null, timeout = TIMEOUT) {
    const d = customDriver || driver;
    return await d.wait(until.elementLocated(By.css(selector)), timeout);
}

/**
 * Unosi tekst u polje
 */
async function enterText(selector, text, customDriver = null) {
    const d = customDriver || driver;
    const field = await waitForElement(selector, d);
    await field.clear();
    await field.sendKeys(text);
    return field;
}

/**
 * Dohvaća vrijednost polja
 */
async function getFieldValue(selector, customDriver = null) {
    const d = customDriver || driver;
    const field = await d.findElement(By.css(selector));
    return await field.getAttribute('value');
}

/**
 * Provjerava postoji li element
 */
async function elementExists(selector, customDriver = null) {
    const d = customDriver || driver;
    const elements = await d.findElements(By.css(selector));
    return elements.length > 0;
}

/**
 * Sprema promjene na settings stranici (pouzdana metoda)
 */
async function saveChanges(customDriver = null) {
    const d = customDriver || driver;
    const saveButtons = await d.findElements(By.css(LOCATORS.saveButton));
    
    for (const button of saveButtons) {
        try {
            if (await button.isDisplayed()) {
                await d.executeScript('arguments[0].scrollIntoView({block: "center"});', button);
                await d.sleep(500);
                await d.executeScript('arguments[0].click();', button);
                await d.sleep(2000);
                return true;
            }
        } catch (e) {
            continue;
        }
    }
    return false;
}

/**
 * Inicijalizira Chai expect
 */
async function initChai() {
    const chai = await import('chai');
    expect = chai.expect;
    return expect;
}

// ============== MOCHA ROOT HOOKS ==============

/**
 * Mocha Root Hooks - automatski se izvršavaju za sve testove
 * Koristi se sa: --require tests/setup.js
 */
const mochaHooks = {
    async beforeAll() {
        // Globalni setup prije svih testova
        console.log('\n========== GLOBAL SETUP ==========');
        await initChai();
        await createDriver();
        await login();
        console.log('========== SETUP COMPLETE ==========\n');
    },
    
    async afterAll() {
        // Globalni teardown nakon svih testova
        console.log('\n========== GLOBAL TEARDOWN ==========');
        await logout();
        await quitDriver();
        console.log('========== TEARDOWN COMPLETE ==========\n');
    }
};

// ============== EXPORTS ==============

module.exports = {
    // Konstante
    BASE_URL,
    SETTINGS_URL,
    TIMEOUT,
    TEST_USER,
    LOCATORS,
    
    // Getteri za globalne varijable
    getDriver: () => driver,
    getExpect: () => expect,
    
    // Setup funkcije
    createDriver,
    login,
    navigateToSettings,
    navigateToProfile,
    initChai,
    
    // Teardown funkcije
    logout,
    quitDriver,
    
    // Helper funkcije
    clickElement,
    waitForElement,
    enterText,
    getFieldValue,
    elementExists,
    saveChanges,
    
    // Mocha hooks
    mochaHooks
};
