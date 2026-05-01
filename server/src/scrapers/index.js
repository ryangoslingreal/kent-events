const { scrape: scrapeKSU } = require('./scrapeKSU.js');
const { scrape: scrapeUniEvents} = require('./scrapeUniEvents.js')
const eventsRepo = require('../repos/eventsRepo');

async function runScrape(){
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastScrape = await eventsRepo.lastScrapeTime();

    if (!lastScrape || lastScrape < oneDayAgo){
        try {
            console.log('Initial scrape Kent Uni starting...');
            const uniEvents = await scrapeUniEvents();
            await eventsRepo.saveScrapedEvents(uniEvents, "kentUni");
            console.log(`Initial scrape done - saved ${uniEvents.length} events`);
        } catch (err) {
            console.error('Initial scrape failed:', err.message);
        }

        try {
            console.log('Initial scrape KSU starting...');
            const ksuEvents = await scrapeKSU();
            await eventsRepo.saveScrapedEvents(ksuEvents, "ksu");
            console.log(`Initial scrape done - saved ${ksuEvents.length} events`);
        } catch (err) {
            console.error('Initial scrape failed:', err.message);
        }
    } else {
        console.log('Scrape skipped - ran recently')
    }
}

module.exports = { runScrape };