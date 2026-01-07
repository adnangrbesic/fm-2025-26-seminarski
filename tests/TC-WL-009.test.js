/**
 * Test Case ID: TC-WL-009
 * Requirement ID: REQ-WL-02
 * Title: Verify that resizing the Bio field doesn't break the UI layout
 * Description: Bio field should snap back to maximum width to avoid UI problems
 * Priority: Low
 * Severity: Minor
 * Type: UI/Layout
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

describe('TC-WL-009: Resizing Bio field does not break UI layout', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        
        await driver.get(BASE_URL + '/sign-in/');
        
        await driver.wait(until.elementLocated(By.css('input[name="username"]')), TIMEOUT);
        const usernameField = await driver.findElement(By.css('input[name="username"]'));
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css('input[name="password"]'));
        await passwordField.sendKeys(TEST_USER.password);
        
        await driver.sleep(500);
        const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
        await driver.executeScript('arguments[0].click();', submitBtn);
        await driver.sleep(3000);
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Step 1: Should display profile edit form', async function() {
        await driver.get(SETTINGS_URL);
        await driver.sleep(2000);
        
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    it('Step 2: Should show resize cursor on Bio field edge', async function() {
        const bioField = await driver.wait(
            until.elementLocated(By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')),
            TIMEOUT
        );
        
        const resizeStyle = await bioField.getCssValue('resize');
        
        const initialWidth = await bioField.getCssValue('width');
        const initialHeight = await bioField.getCssValue('height');
        
        expect(await bioField.isDisplayed()).to.be.true;
        
        this.initialWidth = parseInt(initialWidth);
    });

    it('Step 3: Should allow resizing the Bio field', async function() {
        const bioField = await driver.findElement(
            By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')
        );
        
        const windowSize = await driver.manage().window().getRect();
        
        await driver.executeScript(`
            arguments[0].style.width = '${windowSize.width - 100}px';
            arguments[0].style.maxWidth = 'none';
        `, bioField);
        
        await driver.sleep(500);
        
        const newWidth = await bioField.getCssValue('width');
        expect(parseInt(newWidth)).to.be.greaterThan(500);
    });

    it('Step 4: Should snap back to maximum width to avoid UI overlap', async function() {
        const bioField = await driver.findElement(
            By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')
        );
        
        await driver.executeScript('arguments[0].blur();', bioField);
        await driver.sleep(1000);
        
        const currentWidth = await bioField.getCssValue('width');
        const currentWidthNum = parseInt(currentWidth);
        
        const favoriteFilms = await driver.findElements(
            By.css('.favourite-films, .favorite-films, .poster-list')
        );
        
        if (favoriteFilms.length > 0) {
            const favoriteFilmsRect = await favoriteFilms[0].getRect();
            const bioFieldRect = await bioField.getRect();
            
            const bioFieldRightEdge = bioFieldRect.x + bioFieldRect.width;
            const favoriteFilmsLeftEdge = favoriteFilmsRect.x;
            
            const hasOverlap = bioFieldRightEdge > favoriteFilmsLeftEdge && 
                              bioFieldRect.y < favoriteFilmsRect.y + favoriteFilmsRect.height &&
                              bioFieldRect.y + bioFieldRect.height > favoriteFilmsRect.y;
            
            expect(hasOverlap).to.be.false;
        } else {
            const maxExpectedWidth = 800;
            expect(currentWidthNum).to.be.lessThan(maxExpectedWidth);
        }
    });

    it('Should maintain proper page layout after resize attempt', async function() {
        await driver.executeScript('window.scrollTo(0, 0)');
        await driver.sleep(500);
        
        const hasHorizontalScroll = await driver.executeScript(`
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        `);
        
        expect(hasHorizontalScroll).to.be.false;
    });
});
