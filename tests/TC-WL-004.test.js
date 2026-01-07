/**
 * Test Case ID: TC-WL-004
 * Requirement ID: REQ-WL-05
 * Title: Remove movie from Watchlist
 * Description: Verify user can remove a movie from their watchlist and list updates
 * Priority: High
 * Severity: Major
 * Type: Functional/State Transition
 * 
 * Koristi centralizirani setup iz setup.js
 */

const { By, until } = require('selenium-webdriver');
const {
    BASE_URL,
    TIMEOUT,
    TEST_USER,
    getDriver,
    getExpect,
    createDriver,
    login,
    quitDriver,
    initChai
} = require('./setup');

const TEST_MOVIE_SLUG = 'cars-2';
const TEST_MOVIE_URL = `${BASE_URL}/film/${TEST_MOVIE_SLUG}/`;

describe('TC-WL-004: Remove movie from Watchlist', function() {
    this.timeout(60000);
    let driver;
    let expect;

    before(async function() {
        expect = await initChai();
        driver = await createDriver();
        await login(driver);

        // Ensure movie is in watchlist first
        await driver.get(TEST_MOVIE_URL);
        const watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.watchlist, [data-action*="watchlist"]')),
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
            await quitDriver(driver);
        }
    });

    it('Step 1: Open Watchlist and verify movie present', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/watchlist/`);
        
        const moviePoster = await driver.wait(
            until.elementLocated(By.css(`[data-film-slug="${TEST_MOVIE_SLUG}"]`)),
            TIMEOUT
        );
        expect(await moviePoster.isDisplayed()).to.be.true;
    });

    it('Step 2: Remove movie from watchlist', async function() {
        await driver.get(TEST_MOVIE_URL);
        
        const watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.watchlist, [data-action*="watchlist"]')),
            TIMEOUT
        );
        
        await watchlistBtn.click();
        await driver.sleep(1000);
        
        const cls = await watchlistBtn.getAttribute('class');
        expect(cls).to.not.include('-added', 'Button should revert to not-added state');
    });

    it('Step 3: Return to Watchlist and verify removal', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/watchlist/`);
        
        const moviePosters = await driver.findElements(By.css(`[data-film-slug="${TEST_MOVIE_SLUG}"]`));
        
        expect(moviePosters.length).to.equal(0, 'Movie should not be present in watchlist grid');
    });
});
