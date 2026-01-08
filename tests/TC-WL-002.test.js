/**
 * Test Case ID: TC-WL-002
 * Requirement ID: REQ-WL-03
 * Title: Verify movie appears in Watchlist page
 * Description: Verify that after adding a movie, it successfully appears in the user's Watchlist page
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

const TEST_MOVIE_SLUG = 'transformers';
const TEST_MOVIE_URL = `${BASE_URL}/film/${TEST_MOVIE_SLUG}/`;

describe('TC-WL-002: Verify movie appears in Watchlist page', function() {
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
                    until.elementLocated(By.css('.watchlist, [data-action*="watchlist"]')),
                    TIMEOUT
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
     * Step 1: Add movie to Watchlist
     * Expected: Button status changes to added
     */
    it('Step 1: Add movie to Watchlist', async function() {
        await driver.get(TEST_MOVIE_URL);
        
        // Find all links in watchlist container
        let links = await driver.findElements(By.css('.action-large.-watchlist a'));
        
        if (links.length > 0) {
            const initialClass = await links[0].getAttribute('class');
            const isAlreadyAdded = initialClass.includes('-on') || initialClass.includes('remove-from-watchlist');

            if (isAlreadyAdded) {
                console.log('Movie already in watchlist, removing first...');
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", links[0]);
                await driver.sleep(300);
                await driver.executeScript(`
                    var event = new MouseEvent('click', {bubbles: true, cancelable: true});
                    arguments[0].dispatchEvent(event);
                `, links[0]);
                await driver.sleep(1500);
                console.log('Movie removed, proceeding to add.');
            }
        }

        // Find the ADD link (not remove-from-watchlist)
        links = await driver.findElements(By.css('.action-large.-watchlist a'));
        let addLink = null;
        for (let link of links) {
            const cls = await link.getAttribute('class');
            if (!cls.includes('remove-from-watchlist')) {
                addLink = link;
                break;
            }
        }
        if (!addLink && links.length > 0) addLink = links[0];
        
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", addLink);
        await driver.sleep(300);
        await driver.executeScript(`
            var event = new MouseEvent('click', {bubbles: true, cancelable: true});
            arguments[0].dispatchEvent(event);
        `, addLink);
        
        // Wait and verify
        await driver.sleep(1500);
        links = await driver.findElements(By.css('.action-large.-watchlist a'));
        const finalClass = await links[0].getAttribute('class');
        const isAdded = finalClass.includes('-on') || finalClass.includes('remove-from-watchlist');
        expect(isAdded, 'Link should indicate film is in watchlist').to.be.true;
        console.log('Step 1 Passed: Movie added to watchlist.');
    });

    /**
     * Step 2: Open Watchlist page and Verify
     * Expected: Movie title exists in the list, Poster is displayed
     */
    it('Step 2: Verify movie appears in Watchlist page', async function() {
        const watchlistUrl = `${BASE_URL}/${TEST_USER.username}/watchlist/`;
        await driver.get(watchlistUrl);
        
        const moviePoster = await driver.wait(
            until.elementLocated(By.css(`[data-film-slug="${TEST_MOVIE_SLUG}"]`)),
            TIMEOUT
        );
        expect(await moviePoster.isDisplayed()).to.be.true;
        console.log('Step 2 Passed: Movie found on Watchlist page.');
    });
});
