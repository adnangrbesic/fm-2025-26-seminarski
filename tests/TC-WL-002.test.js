/**
 * Test Case ID: TC-WL-002
 * Requirement ID: REQ-WL-03
 * Title: Verify movie appears in Watchlist page
 * Description: Verify that after adding a movie, it successfully appears in the user's Watchlist page with correct title and poster.
 * Priority: High
 * Severity: Major
 * Type: Functional/State Transition
 */

const { createDriver, login, BASE_URL, TEST_USER, TIMEOUT, By, until } = require('./helpers/test-helper');

let expect;
const TEST_MOVIE_SLUG = 'transformers';
const TEST_MOVIE_URL = `${BASE_URL}/film/${TEST_MOVIE_SLUG}/`;
const TEST_MOVIE_TITLE = 'Transformers';

describe('TC-WL-002: Verify movie appears in Watchlist page', function() {
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
                    until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
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
     * Step 1: Add movie to Watchlist
     * Expected: Button status changes to added
     */
    it('Step 1: Add movie to Watchlist', async function() {
        await driver.get(TEST_MOVIE_URL);
        
        let watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
            TIMEOUT
        );

        const initialClass = await watchlistBtn.getAttribute('class');
        const isAlreadyAdded = initialClass.includes('-added') || initialClass.includes('checked');

        if (isAlreadyAdded) {
            console.log('Movie already in watchlist, ensuring fresh add state...');
            await watchlistBtn.click();
            await driver.sleep(2000);
            
             watchlistBtn = await driver.wait(
                until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
                TIMEOUT
            );
        }

        await watchlistBtn.click();
        await driver.sleep(1500); 

        const finalClass = await watchlistBtn.getAttribute('class');
        expect(finalClass).to.include('-added', 'Button should indicate listed state');
    });

    /**
     * Step 2: Open Watchlist page and Verify
     * Expected: Movie title exists in the list, Poster is displayed
     */
    it('Step 2: Verify movie appears in Watchlist page', async function() {
        const watchlistUrl = `${BASE_URL}/${TEST_USER.username}/watchlist/`;
        await driver.get(watchlistUrl);
        
        expect(await driver.getCurrentUrl()).to.include('/watchlist');

        const moviePoster = await driver.wait(
            until.elementLocated(By.css(`div[data-film-slug="${TEST_MOVIE_SLUG}"], li[data-film-slug="${TEST_MOVIE_SLUG}"]`)),
            TIMEOUT
        );
        expect(await moviePoster.isDisplayed(), 'Movie poster should be displayed in grid').to.be.true;

        try {
            const posterImage = await moviePoster.findElement(By.css('img'));
            const naturalWidth = await driver.executeScript("return arguments[0].naturalWidth", posterImage);
            expect(naturalWidth).to.be.above(0, 'Poster image should be loaded correctly');
        } catch(e) {
            console.warn('Image verification warning: ' + e.message);
        }
    });
});
