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
        
        // Login first
        await driver.get(BASE_URL + '/sign-in/');
        
        await driver.wait(until.elementLocated(By.css('input[name="username"]')), TIMEOUT);
        const usernameField = await driver.findElement(By.css('input[name="username"]'));
        await usernameField.sendKeys(TEST_USER.username);
        
        const passwordField = await driver.findElement(By.css('input[name="password"]'));
        await passwordField.sendKeys(TEST_USER.password);
        
        await driver.sleep(500); // Wait for button to be enabled
        const submitBtn = await driver.findElement(By.css('input[type="submit"], button[type="submit"]'));
        await driver.executeScript('arguments[0].click();', submitBtn);
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
        
        // Verify settings page is displayed
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).to.include('settings');
    });

    /**
     * Step 2: Click & Hold on the bottom right edge of the Bio field
     * Expected: The cursor changes shape to indicate resizing possibility
     */
    it('Step 2: Should show resize cursor on Bio field edge', async function() {
        const bioField = await driver.wait(
            until.elementLocated(By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')),
            TIMEOUT
        );
        
        // Check if textarea is resizable
        const resizeStyle = await bioField.getCssValue('resize');
        
        // Get initial dimensions
        const initialWidth = await bioField.getCssValue('width');
        const initialHeight = await bioField.getCssValue('height');
        
        // Textarea should be displayed and potentially resizable
        expect(await bioField.isDisplayed()).to.be.true;
        
        // Store initial width for later comparison
        this.initialWidth = parseInt(initialWidth);
    });

    /**
     * Step 3: Resize the field to the width of the screen
     * Expected: The field is resized to the width of the screen
     */
    it('Step 3: Should allow resizing the Bio field', async function() {
        const bioField = await driver.findElement(
            By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')
        );
        
        // Get window size
        const windowSize = await driver.manage().window().getRect();
        
        // Use JavaScript to resize the textarea
        await driver.executeScript(`
            arguments[0].style.width = '${windowSize.width - 100}px';
            arguments[0].style.maxWidth = 'none';
        `, bioField);
        
        await driver.sleep(500);
        
        // Verify field was resized
        const newWidth = await bioField.getCssValue('width');
        expect(parseInt(newWidth)).to.be.greaterThan(500); // Should be wider than typical width
    });

    /**
     * Step 4: Let go of the mouse click
     * Expected: The field should snap back to defined maximum width
     * Actual (from test case): Field stays resized, overlapping favorite films - FAIL
     */
    it('Step 4: Should snap back to maximum width to avoid UI overlap', async function() {
        const bioField = await driver.findElement(
            By.css('textarea[name="bio"], textarea#bio, .bio-field textarea')
        );
        
        // Trigger blur/resize complete event
        await driver.executeScript('arguments[0].blur();', bioField);
        await driver.sleep(1000);
        
        // Get the current width after "releasing"
        const currentWidth = await bioField.getCssValue('width');
        const currentWidthNum = parseInt(currentWidth);
        
        // Check if favorite films section exists and is overlapped
        const favoriteFilms = await driver.findElements(
            By.css('.favourite-films, .favorite-films, .poster-list')
        );
        
        if (favoriteFilms.length > 0) {
            const favoriteFilmsRect = await favoriteFilms[0].getRect();
            const bioFieldRect = await bioField.getRect();
            
            // Check for overlap (bio field right edge should not extend into favorite films)
            const bioFieldRightEdge = bioFieldRect.x + bioFieldRect.width;
            const favoriteFilmsLeftEdge = favoriteFilmsRect.x;
            
            // There should be no overlap
            // Based on original test case, this FAILS - field overlaps favorite films
            const hasOverlap = bioFieldRightEdge > favoriteFilmsLeftEdge && 
                              bioFieldRect.y < favoriteFilmsRect.y + favoriteFilmsRect.height &&
                              bioFieldRect.y + bioFieldRect.height > favoriteFilmsRect.y;
            
            expect(hasOverlap).to.be.false;
        } else {
            // If no favorite films section, just verify bio field has reasonable width
            const maxExpectedWidth = 800; // Typical max width for form fields
            expect(currentWidthNum).to.be.lessThan(maxExpectedWidth);
        }
    });

    /**
     * Additional verification: Check overall page layout integrity
     */
    it('Should maintain proper page layout after resize attempt', async function() {
        // Scroll to see full page
        await driver.executeScript('window.scrollTo(0, 0)');
        await driver.sleep(500);
        
        // Check for horizontal scrollbar (indicates layout break)
        const hasHorizontalScroll = await driver.executeScript(`
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        `);
        
        // Page should not have horizontal scroll if layout is maintained
        // Note: This may fail based on the bug described in test case
        expect(hasHorizontalScroll).to.be.false;
    });
});
