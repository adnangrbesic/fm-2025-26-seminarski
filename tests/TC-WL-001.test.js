/**
 * Test Case ID: TC-WL-001
 * Requirement ID: REQ-WL-01
 * Title: Add movie to Watchlist – logged in (happy path)
 * Description: Verify that a logged-in user can add a movie to their watchlist
 * Priority: High
 * Severity: Critical
 * Type: Functional
 */

const { createDriver, login, BASE_URL, TIMEOUT, By, until } = require('./helpers/test-helper');

let expect;

const TEST_MOVIE_URL = `${BASE_URL}/film/the-spongebob-movie-search-for-squarepants/`;

describe('TC-WL-001: Add movie to Watchlist – logged in', function() {
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
                const watchlistBtn = await driver.wait(
                    until.elementLocated(By.css('.sidebar-user-actions .watchlist, a.watchlist, [data-action="remove-from-watchlist"]')),
                    5000
                );
                const classAttr = await watchlistBtn.getAttribute('class');
                if (classAttr.includes('-added') || classAttr.includes('checked')) {
                    await watchlistBtn.click();
                    await driver.sleep(1000);
                }
            } catch (e) {
                console.log('Cleanup warning: ' + e.message);
            }
            await driver.quit();
        }
    });

    /**
     * Step 1: Navigate to valid movie page
     * Expected: Movie page loads
     */
    it('Step 1: Open valid movie page', async function() {
        await driver.get(TEST_MOVIE_URL);
        const title = await driver.getTitle();
        expect(title).to.have.lengthOf.above(0);
    });

    /**
     * Step 2: Click Add to Watchlist
     * Expected: Button indicates "In Watchlist" or film appears in watchlist
     */
    it('Step 2: Click Add to Watchlist and verify change', async function() {
        let watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist, .action-large.-watchlist a')),
            TIMEOUT
        );

        const initialClass = await watchlistBtn.getAttribute('class');
        let isAlreadyAdded = initialClass.includes('-added') || initialClass.includes('checked');
        
        if (!isAlreadyAdded) {
            try {
                const parent = await watchlistBtn.findElement(By.xpath('./..'));
                const parentClass = await parent.getAttribute('class');
                isAlreadyAdded = parentClass.includes('checked') || parentClass.includes('-added');
            } catch (e) {
            }
        }

        if (isAlreadyAdded) {
            console.log('Movie was already in watchlist, removing first...');
            await watchlistBtn.click();
            await driver.sleep(2000);
            
             watchlistBtn = await driver.wait(
                until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist, .action-large.-watchlist a')),
                TIMEOUT
            );
        }

        await watchlistBtn.click();
        await driver.sleep(1000);

        const updatedClass = await watchlistBtn.getAttribute('class');
        
        const isAdded = updatedClass.includes('-added') || updatedClass.includes('checked');
        
        expect(isAdded, 'Watchlist button should indicate added state').to.be.true;
    });
});
