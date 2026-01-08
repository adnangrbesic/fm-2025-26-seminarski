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
            await driver.wait(async () => {
                const c = await watchlistBtn.getAttribute('class');
                return c.includes('-added');
            }, TIMEOUT);
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
        console.log('Step 1 Passed: Movie present in watchlist.');
    });

    it('Step 2: Remove movie from watchlist', async function() {
        await driver.get(TEST_MOVIE_URL);
        
        let links = await driver.findElements(By.css('.action-large.-watchlist a'));
        expect(links.length).to.be.greaterThan(0, 'Watchlist link should exist');
        
        // Should be "remove-from-watchlist" link since movie is added
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", links[0]);
        await driver.sleep(300);
        await driver.executeScript(`
            var event = new MouseEvent('click', {bubbles: true, cancelable: true});
            arguments[0].dispatchEvent(event);
        `, links[0]);
        
        // Wait and verify state changed to "add"
        await driver.sleep(1500);
        links = await driver.findElements(By.css('.action-large.-watchlist a'));
        const finalClass = await links[0].getAttribute('class');
        const isRemoved = !finalClass.includes('-on') && !finalClass.includes('remove-from-watchlist');
        
        expect(isRemoved, 'Link should indicate film is NOT in watchlist (should be add-to-watchlist)').to.be.true;
        console.log('Step 2 Passed: Movie removed via button.');
    });

    it('Step 3: Return to Watchlist and verify removal', async function() {
        await driver.get(`${BASE_URL}/${TEST_USER.username}/watchlist/`);
        
        const moviePosters = await driver.findElements(By.css(`[data-film-slug="${TEST_MOVIE_SLUG}"]`));
        
        expect(moviePosters.length).to.equal(0, 'Movie should not be present in watchlist grid');
        console.log('Step 3 Passed: Movie absent from watchlist.');
    });
});
