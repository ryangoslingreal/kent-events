const puppeteer = require('puppeteer');

const BASEURL = 'https://ksu.co.uk' 
const URL = 'https://ksu.co.uk/events';

async function scrape() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // needed for Docker
    });

    //----- all events list page -------
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle2' });

    //loading all events by clicking load more button
    while (true) {
        const loadMoreBtn = await page.$('#see-more'); 
        if (!loadMoreBtn) break;

        await loadMoreBtn.click();
        await page.waitForNetworkIdle(); // wait for new events to load
    }
   // page.on('console', msg => console.log('BROWSER:', msg.text()));  //so console logs actually get logged
    const events = await page.evaluate(() => {
        const results = [];
        
        document.querySelectorAll('.col').forEach(el => {
            
            //grabbing date and time
            const dateTime = el.querySelector('.fw-bold.mb-0')?.innerText.trim();
            let dt = dateTime.split(" | ");
            const dateStr = dt[0];
            const timeStr = dt[1];

            
            //Turning into correct time format for db
            const event_time = timeStr.split(' - ')
            const time = event_time[0].trim() + ':00';
            const end_event_time = event_time[1].trim() + ':00';

            //Turning into correct date formate for db
            const cleanDate = dateStr.replace(/^[A-Za-z]+\s/, ''); 
            const event_date = new Date(`${cleanDate} 2026`);
            const date = event_date.toISOString().split('T')[0];

            
            //grabbing imageURl
            const image_url = el.querySelector('.w-100.border.rounded.ksu-aspect-1-1')?.getAttribute('src');

            //grabbing title
            const title = el.querySelector('.h5')?.innerText.trim();


            const link = el.querySelector('a');
            if (!link) return;
            const href = link.getAttribute('href');
            
            results.push({ title, image_url, href, date, time, end_event_time });
        });
        return results;
    });
    await page.close();


    // -----------Stopping duplicate events--------------
    const seen = new Set();
    const uniqueEvents = events.filter(event => {
        if (!event.href || seen.has(event.href)) return false;
        seen.add(event.href);
        return true;
    })




    //------individual event details section ---------
    const detailPage = await browser.newPage();
    //detailPage.on('console', msg => console.log('BROWSER:', msg.text()));   //So that I can console log

    const fullEvents = [];

    for (const event of uniqueEvents) {
        const fullUrl = BASEURL + event.href;

        await detailPage.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const details = await detailPage.evaluate(() => {
            const description = document.querySelector('#eventDescription')?.innerHTML.trim();

            const location = document.querySelector('#eventVenue')?.innerText.trim();

            const background_event_image_url = document.querySelector('.w-100.border.rounded.ku-aspect-16-9.shadow.mb-3')?.getAttribute('src'); 

            return { description, location, background_event_image_url };
        });

        fullEvents.push({
            ...event,
            ...details,
            source: 'ksu',
            external_url: fullUrl
        });
    }

    await detailPage.close();
    await browser.close();

    return fullEvents;
}


module.exports = { scrape };
