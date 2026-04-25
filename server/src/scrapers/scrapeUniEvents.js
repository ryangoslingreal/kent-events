const puppeteer = require('puppeteer');

const URL = 'https://student.kent.ac.uk/events?count=250'

async function scrape() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // needed for Docker
    });

    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER:', msg.text()));   //so console.logs actaully get logged
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForSelector('li.card', { timeout: 10000 });
    console.log('Found cards');

    const events = await page.evaluate(() => {
        const results = [];
        document.querySelectorAll('li.card').forEach(el => {
            const title = el.querySelector('[x-text="event.title"]')?.textContent.trim() || null;

            const image_url = el.querySelector('.card__image img')?.getAttribute('src') || null;

            const external_url = el.querySelector('.card-subgrid.card-subgrid--span-3.card-subgrid--gap-20')?.getAttribute('href') || null;

            results.push({ title, image_url, external_url });
        });
        return results
    })
    console.log('Events found:', events.length);
    
    await page.close();

    const seen = new Set();
    const uniqueEvents = events.filter(event => {
        if (!event.external_url || seen.has(event.external_url)) return false;
        seen.add(event.external_url);
        return true;
    })

    const detailPage = await browser.newPage();

    const fullEvents = [];

    // detailPage.on('console', msg => {
    //     const text = msg.text();
    //     if (text.startsWith('description') || text.startsWith('url') || text.startsWith("contact") || text.startsWith("tags") || text.startsWith("location") || text.startsWith("price") || text.startsWith("date") || text.startsWith("starttime") || text.startsWith("endtime")) {
    //         console.log('DETAIL:', text); // only log what you care about
    //     }
    // });
    let count = 0;
    for (const event of uniqueEvents) {
        count++;
        console.log(`scraping ${count}/${uniqueEvents.length}:`, event.external_url);
        if (!event.external_url) {
            console.log('skipping - no external_url');
            continue;
        }

        await detailPage.goto(event.external_url, { waitUntil: 'networkidle2', timeout: 60000 });

        await detailPage.waitForSelector('.text__body', { timeout: 5000 }); 
        
        const details = await detailPage.evaluate(() => {

            const description = document.querySelector('.text__body')?.innerHTML.trim();

            const ticket_url = document.querySelector('.alert.panel.panel--yellow-light a')?.getAttribute('href') || null;

            //ADD THIS INTO OBJECTS
            const available_contact = document.querySelector('.link.body--icon.body--16')?.getAttribute('href') || null;

            let tags = []
            const textBody = document.querySelector('.text__body');
            if (textBody) {
                const parent = textBody.parentElement;
                const pills = parent.querySelectorAll('a.pill--14');
                pills.forEach(pill => 
                    tags.push(pill.textContent.trim()
                ))
            }

            function getValueAfterHeading(headingText){
                const heading = document.querySelectorAll('.event-key-points .heading--24')
                for (const h of heading){
                    
                    if (h.textContent.trim() === headingText){
                        if (headingText === "Dates and times"){
                            const div = h.nextElementSibling;
                            const date =  div.querySelectorAll('time');
                            const properDate = date[0]?.getAttribute('datetime') || null;
                            const properDate2 = properDate.split(" ")

                            const div2 = div.nextElementSibling;
                            const times = div2.querySelectorAll('time');
                            const startTime = times[0]?.getAttribute('datetime') || null;
                            const endTime = times[1]?.getAttribute('datetime') || null;

                            return (properDate2[0] + " " + startTime + " " + endTime)
                        } else {
                            return h.nextElementSibling?.textContent.trim() || null
                        }
                    }
                }
            }

            const location = getValueAfterHeading('Where')
            const checkPrice = getValueAfterHeading('Pricing')
            let price;
            if (checkPrice === "Free"){
                price = 0
            }

            //turning into correct date and time formatted for db
            const dateTime = getValueAfterHeading('Dates and times')
            const dateAndTimes = dateTime.split(" ");
            const date = dateAndTimes[0];
            const time = !dateAndTimes[1] || dateAndTimes[1] === "null"
                ? null
                : dateAndTimes[1] + ":00"
            const end_time = !dateAndTimes[2] || dateAndTimes[2] === "null"
                ? null
                : dateAndTimes[2] + ":00";

            return { description, ticket_url, available_contact, tags, location, price, date, time, end_time }
        })

        fullEvents.push({
            ...event,
            ...details,
            source: 'kentUni',
        });
    }

    await detailPage.close();
    await browser.close();

    return fullEvents;

    
}

module.exports = { scrape } ;