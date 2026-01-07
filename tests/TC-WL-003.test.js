/**
 * Test Case ID: TC-WL-003
 * Requirement ID: REQ-WL-04
 * Title: Add same movie twice → already in Watchlist
 * Description: Verify system behavior when attempting to add an already watchlisted movie
 * Priority: Low
 * Severity: Low
 * Type: Negative/Stability
 */

const { createDriver, login, BASE_URL, TIMEOUT, By, until } = require('./helpers/test-helper');

let expect;
const TEST_MOVIE_URL = `${BASE_URL}/film/pulp-fiction/`;

describe('TC-WL-003: Add same movie twice', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await createDriver();
        await login(driver);
    });

    after(async function() {
        if (driver) {
            try {
                await driver.get(TEST_MOVIE_URL);
                const btn = await driver.findElement(By.css('.sidebar-user-actions .watchlist'));
                const cls = await btn.getAttribute('class');
                if (cls.includes('-added')) {
                    await btn.click();
                }
            } catch(e) {}
            await driver.quit();
        }
    });

    /**
     * Step 1: Ensure movie is in Watchlist first
     */
    it('Step 1: Add movie to watchlist initially', async function() {
        await driver.get(TEST_MOVIE_URL);
        const watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
            TIMEOUT
        );

        const initialClass = await watchlistBtn.getAttribute('class');
        if (!initialClass.includes('-added')) {
            await watchlistBtn.click();
            await driver.sleep(1000);
        }
        
        const updatedClass = await watchlistBtn.getAttribute('class');
        expect(updatedClass).to.include('-added', 'Movie should be in watchlist before negative test');
    });

    /**
     * Step 2: Click Add to Watchlist AGAIN
     * Expected: Button disabled OR State unchanged OR Warning message
     * Note: On Letterboxd, this actually toggles (Removes), so this test might fail if the Requirement is strict.
     * We follow the user's designated scenario assertions.
     */
    it('Step 2: Attempt to add same movie again and verify response', async function() {
        const watchlistBtn = await driver.findElement(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist'));
        
        await watchlistBtn.click();
        await driver.sleep(1000);

        const finalClass = await watchlistBtn.getAttribute('class');
        const isEnabled = await watchlistBtn.isEnabled();
        
        let messageVisible = false;
        try {
            const message = await driver.findElement(By.xpath("//*[contains(text(), 'Already in')]"));
            messageVisible = await message.isDisplayed();
        } catch(e) {}

        const isStateUnchanged = finalClass.includes('-added'); 
        const isDisabled = !isEnabled; 

        if (!isStateUnchanged && !isDisabled && !messageVisible) {
            console.warn('NOTE: System toggled the state (Removed movie) instead of blocking duplicate add.');
            console.warn('This behavior deviates from the strict "Negative Test" expectation but is common in UI.');
        }

        expect(isStateUnchanged || isDisabled || messageVisible, 
            'System should prevent adding twice OR warn OR keep state').to.be.true;
    });
});
