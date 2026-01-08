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
        console.log('=== STEP 2: Starting Watchlist Add Test ===');
        
        // Find the watchlist button parent container
        let watchlistContainer = await driver.wait(
            until.elementLocated(By.css('.action-large.-watchlist')),
            TIMEOUT
        );
        console.log('✓ Found watchlist container');

        // Check current state
        let currentClass = await watchlistContainer.getAttribute('class');
        console.log('Current container class:', currentClass);
        let isAlreadyAdded = currentClass.includes('-added');
        console.log('Is already added?', isAlreadyAdded);

        if (isAlreadyAdded) {
            console.log('Movie was already in watchlist, removing first...');
            const removeBtn = await watchlistContainer.findElement(By.css('a'));
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", removeBtn);
            await driver.sleep(300);
            await driver.executeScript("arguments[0].click();", removeBtn);
            console.log('Clicked remove button, waiting for state change...');
            await driver.sleep(2000);
            
            watchlistContainer = await driver.findElement(By.css('.action-large.-watchlist'));
            currentClass = await watchlistContainer.getAttribute('class');
            console.log('After removal, container class:', currentClass);
            console.log('Movie removed from watchlist, ready to add again.');
        }

        // Re-locate the container
        watchlistContainer = await driver.findElement(By.css('.action-large.-watchlist'));
        
        // Debug: Print HTML structure
        const containerHTML = await watchlistContainer.getAttribute('outerHTML');
        console.log('Container HTML:', containerHTML.substring(0, 300));
        
        // Find ALL links inside - there should be 2 (add and remove)
        const allLinks = await watchlistContainer.findElements(By.css('a'));
        console.log('Number of links found:', allLinks.length);
        
        // Find the ADD link (should NOT have 'remove-from-watchlist' class)
        let addLink = null;
        for (let link of allLinks) {
            const linkClass = await link.getAttribute('class');
            console.log('Link class:', linkClass);
            
            // The ADD link typically has 'add-to-watchlist' or doesn't have 'remove'
            if (!linkClass.includes('remove-from-watchlist')) {
                addLink = link;
                console.log('Found ADD link!');
                break;
            }
        }
        
        if (!addLink) {
            // Fallback: use the first visible link
            for (let link of allLinks) {
                if (await link.isDisplayed()) {
                    addLink = link;
                    console.log('Using first visible link as fallback');
                    break;
                }
            }
        }
        
        console.log('About to click ADD element...');
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", addLink);
        await driver.sleep(500);
        
        // Use JavaScript to trigger click with event that bubbles and is cancelable
        // This ensures event handlers are triggered properly
        await driver.executeScript(`
            var element = arguments[0];
            var event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(event);
        `, addLink);
        console.log('Dispatched click event, waiting for state change...');
        
        // Wait longer and poll for class change
        let stateChanged = false;
        for (let i = 0; i < 10; i++) {
            await driver.sleep(500);
            
            // Re-find the link to get updated state
            const links = await driver.findElements(By.css('.action-large.-watchlist a'));
            if (links.length > 0) {
                const linkClass = await links[0].getAttribute('class');
                const linkText = await links[0].getText();
                console.log(`After ${(i+1)*500}ms, link class is: ${linkClass}`);
                console.log(`After ${(i+1)*500}ms, link text is: ${linkText}`);
                
                // Check if it has -on class (added state) or remove-from-watchlist
                if (linkClass.includes('-on') || linkClass.includes('remove-from-watchlist')) {
                    stateChanged = true;
                    console.log('✓ State changed - film is now in watchlist!');
                    break;
                }
            }
        }
        
        // Verify added state by checking the link
        const finalLinks = await driver.findElements(By.css('.action-large.-watchlist a'));
        expect(finalLinks.length).to.be.greaterThan(0, 'Watchlist link should exist');
        
        const finalLink = finalLinks[0];
        const finalLinkClass = await finalLink.getAttribute('class');
        const finalLinkText = await finalLink.getText();
        
        console.log('Final link class:', finalLinkClass);
        console.log('Final link text:', finalLinkText);
        console.log('Does it include -on or remove-from-watchlist?', 
                    finalLinkClass.includes('-on') || finalLinkClass.includes('remove-from-watchlist'));
        
        // Verify the film is in watchlist (link should have -on class or be remove-from-watchlist)
        const isInWatchlist = finalLinkClass.includes('-on') || finalLinkClass.includes('remove-from-watchlist');
        expect(isInWatchlist, 'Film should be added to watchlist (link should have -on or remove-from-watchlist class)').to.be.true;
        console.log('✓ Step 2 Passed: Movie successfully added to watchlist.');
    });
});
