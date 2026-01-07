/**
 * Test Case ID: TC-WL-004
 * Requirement ID: REQ-WL-05
 * Title: Remove movie from Watchlist
 * Description: Verify user can remove a movie from their watchlist and list updates
 * Priority: High
 * Severity: Major
 * Type: Functional/State Transition
 */

const { createDriver, login, BASE_URL, TEST_USER, TIMEOUT, By, until } = require('./helpers/test-helper');

let expect;
const TEST_MOVIE_SLUG = 'cars-2';
const TEST_MOVIE_URL = `${BASE_URL}/film/${TEST_MOVIE_SLUG}/`;

describe('TC-WL-004: Remove movie from Watchlist', function() {
    this.timeout(60000);
    let driver;

    before(async function() {
        const chai = await import('chai');
        expect = chai.expect;
        driver = await createDriver();
        await login(driver);

        await driver.get(TEST_MOVIE_URL);
        const watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
            TIMEOUT
        );
        const cls = await watchlistBtn.getAttribute('class');
        if (!cls.includes('-added')) {
            await watchlistBtn.click();
            await driver.sleep(1000);
        }
    });

    after(async function() {
        if (driver) {
            await driver.quit();
        }
    });

    it('Step 1: Open Watchlist and verify movie present', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/watchlist/`);
        
        const moviePoster = await driver.wait(
            until.elementLocated(By.css(`div[data-film-slug="${TEST_MOVIE_SLUG}"]`)),
            TIMEOUT
        );
        expect(await moviePoster.isDisplayed()).to.be.true;
    });

    it('Step 2: Remove movie from watchlist', async function() {
        await driver.get(TEST_MOVIE_URL);
        
        const watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.sidebar-user-actions .watchlist, .actions-panel .watchlist, a.add-to-watchlist')),
            TIMEOUT
        );
        
        await watchlistBtn.click();
        await driver.sleep(1000);
        
        const cls = await watchlistBtn.getAttribute('class');
        expect(cls).to.not.include('-added', 'Button should revert to not-added state');
    });

    it('Step 3: Return to Watchlist and verify removal', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/watchlist/`);
        
        const moviePosters = await driver.findElements(By.css(`div[data-film-slug="${TEST_MOVIE_SLUG}"]`));
        
        expect(moviePosters.length).to.equal(0, 'Movie should not be present in watchlist grid');
    });
});
