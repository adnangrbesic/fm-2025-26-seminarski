/**
 * Test Case ID: TC-WL-001
 * Requirement ID: REQ-WL-01
 * Title: Add movie to Watchlist – logged in (happy path)
 * Description: Verify that a logged-in user can add a movie to their watchlist
 * Priority: High
 * Severity: Critical
 * Type: Functional
 * 
 * Koristi centralizirani setup iz setup.js
 */

const { By, until } = require('selenium-webdriver');
const {
    BASE_URL,
    TIMEOUT,
    getDriver,
    getExpect,
    createDriver,
    login,
    quitDriver,
    initChai
} = require('./setup');

const TEST_MOVIE_URL = `${BASE_URL}/film/the-spongebob-movie-search-for-squarepants/`;

describe('TC-WL-001: Add movie to Watchlist – logged in', function() {
    this.timeout(60000);
    let driver;
    let expect;

    before(async function() {
        expect = await initChai();
        driver = await createDriver();
        await login(driver);
    });

    after(async function() {
        if (driver) {
            try {
                await driver.get(TEST_MOVIE_URL);
                const watchlistBtn = await driver.wait(
                    until.elementLocated(By.css('.action-large.-watchlist a, .watchlist')),
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
            
            await quitDriver(driver);
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
        // Koristi relativni selektor za watchlist link
        let watchlistBtn = await driver.wait(
            until.elementLocated(By.css('.action-large.-watchlist a')),
            TIMEOUT
        );

        // Provjeri parent element za added stanje
        const parentEl = await watchlistBtn.findElement(By.xpath('./..'));
        let parentClass = await parentEl.getAttribute('class');
        let isAlreadyAdded = parentClass.includes('-added');

        if (isAlreadyAdded) {
            console.log('Movie was already in watchlist, removing first...');
            await watchlistBtn.click();
            await driver.sleep(2000);
            
            watchlistBtn = await driver.wait(
                until.elementLocated(By.css('.action-large.-watchlist a')),
                TIMEOUT
            );
        }

        await watchlistBtn.click();
        await driver.sleep(1500);

        // Ponovo dohvati parent i provjeri klasu
        const updatedParent = await watchlistBtn.findElement(By.xpath('./..'));
        const updatedClass = await updatedParent.getAttribute('class');
        const isAdded = updatedClass.includes('-added');
        
        expect(isAdded, 'Watchlist button should indicate added state').to.be.true;
    });
});
