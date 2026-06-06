const { scrape: scrapeKSU } = require("../scrapers/scrapeKSU");
const { scrape: scrapeUni } = require("../scrapers/scrapeUni");
const eventsRepo = require("../repos/eventsRepo");

const SCRAPE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 day

const scrapeSources = [
    {
        name: "Kent Uni",
        source: "kentUni",
        scrape: scrapeUni
    },
    {
        name: "KSU",
        source: "ksu",
        scrape: scrapeKSU
    }
];

function shouldScrape(lastScrape) {
    if (!lastScrape) return true;

    const oneDayAgo = new Date(Date.now() - SCRAPE_INTERVAL_MS);
    return new Date(lastScrape) < oneDayAgo;
}

async function runScrapers() {
    let lastScrape;

    try {
        lastScrape = await eventsRepo.lastScrapeTime();
    } catch (err) {
        console.error("Could not check last scrape time:", err.message);
        return;
    }

    if (!shouldScrape(lastScrape)) {
        console.log("Scrape skipped - ran recently");
        return;
    }

    for (const { name, source, scrape } of scrapeSources) {
        try {
            console.log(`Scrape ${name} starting...`);

            const events = await scrape();

            await eventsRepo.saveScrapedEvents(events, source); // TODO: Delegate to scrapeRepo?

            console.log(`Scrape ${name} done - saved ${events.length} events`);
        } catch (err) {
            console.error(`Scrape ${name} failed:`, err.message);
        }
    }
}

function runScrapersOnStartup() {
    if (process.env.NODE_ENV === "test") return;

    runScrapers();
}

module.exports = {
    runScrapersOnStartup
};