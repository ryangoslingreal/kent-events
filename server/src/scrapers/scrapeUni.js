const puppeteer = require('puppeteer');

const BASE_URL = 'https://student.kent.ac.uk';
const EVENTS_URL = `${BASE_URL}/events?count=250`;
const DEFAULT_LOCATION = 'Location TBC';

const SELECTORS = {
    eventCard: 'li.card',
    cardTitle: '[x-text="event.title"]',
    cardImage: '.card__image img',
    cardLink: '.card-subgrid.card-subgrid--span-3.card-subgrid--gap-20',
    description: '.text__body',
    ticketLink: '.alert.panel.panel--yellow-light a',
    contactLink: '.link.body--icon.body--16',
    tag: 'a.pill--14',
    keyPointHeading: '.event-key-points .heading--24'
};

const MONTHS = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11
};

async function scrape() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const events = await scrapeListPage(browser);
        const uniqueEvents = uniqueBy(events, event => event.external_url);

        return await scrapeDetailPages(browser, uniqueEvents);
    } finally {
        if (browser) {
            await browser.close().catch(err => {
                console.error('Could not close Kent Uni browser:', err.message);
            });
        }
    }
}

async function scrapeListPage(browser) {
    const page = await browser.newPage();
    attachPageLogging(page);

    try {
        await page.goto(EVENTS_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector(SELECTORS.eventCard, { timeout: 10000 }).catch(() => {
            console.log('Kent Uni event cards not found');
        });

        const rawEvents = await page.evaluate((selectors) => {
            return Array.from(document.querySelectorAll(selectors.eventCard)).map(el => {
                return {
                    title: el.querySelector(selectors.cardTitle)?.textContent.trim() || null,
                    image_url: el.querySelector(selectors.cardImage)?.getAttribute('src') || null,
                    external_url: el.querySelector(selectors.cardLink)?.getAttribute('href') || null
                };
            });
        }, SELECTORS);

        console.log('Kent Uni events found:', rawEvents.length);

        return rawEvents
            .map(normaliseListEvent)
            .filter(Boolean);
    } finally {
        await closePage(page, 'Kent Uni list page');
    }
}

async function scrapeDetailPages(browser, events) {
    const detailPage = await browser.newPage();
    attachPageLogging(detailPage);

    try {
        const fullEvents = [];

        for (const [index, event] of events.entries()) {
            console.log(`Kent Uni scraping ${index + 1}/${events.length}: ${event.external_url}`);

            const details = await scrapeEventDetails(detailPage, event.external_url);
            const fullEvent = toFullEvent(event, details);

            if (fullEvent) {
                fullEvents.push(fullEvent);
            } else {
                console.log('Kent Uni event skipped - missing required date or time:', event.external_url);
            }
        }

        return fullEvents;
    } finally {
        await closePage(detailPage, 'Kent Uni detail page');
    }
}

async function scrapeEventDetails(page, externalUrl) {
    try {
        await page.goto(externalUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector(SELECTORS.description, { timeout: 5000 }).catch(() => {
            console.log('Kent Uni description not found for:', externalUrl);
        });

        const rawDetails = await page.evaluate((selectors) => {
            function textFrom(parent, selector) {
                return parent.querySelector(selector)?.textContent.trim() || null;
            }

            function getKeyPointHeading(headingText) {
                const headings = document.querySelectorAll(selectors.keyPointHeading);
                return Array.from(headings).find(heading => heading.textContent.trim() === headingText) || null;
            }

            function getValueAfterHeading(headingText) {
                const heading = getKeyPointHeading(headingText);
                return heading?.nextElementSibling?.textContent.trim() || null;
            }

            function getDateTimeParts() {
                const heading = getKeyPointHeading('Dates and times');
                const dateContainer = heading?.nextElementSibling || null;
                const timeContainer = dateContainer?.nextElementSibling || null;
                const dateTime = dateContainer?.querySelector('time') || null;
                const times = timeContainer?.querySelectorAll('time') || [];

                return {
                    date: dateTime?.getAttribute('datetime') || dateTime?.textContent.trim() || null,
                    start_time: times[0]?.getAttribute('datetime') || times[0]?.textContent.trim() || null,
                    end_time: times[1]?.getAttribute('datetime') || times[1]?.textContent.trim() || null
                };
            }

            const textBody = document.querySelector(selectors.description);
            const tagRoot = textBody?.parentElement || document;
            const dateTime = getDateTimeParts();

            return {
                description: textBody?.innerHTML.trim() || null,
                ticket_url: document.querySelector(selectors.ticketLink)?.getAttribute('href') || null,
                contact_email: textFrom(document, selectors.contactLink)
                    || document.querySelector(selectors.contactLink)?.getAttribute('href')
                    || null,
                tags: Array.from(tagRoot.querySelectorAll(selectors.tag))
                    .map(el => el.textContent.trim())
                    .filter(Boolean),
                location: getValueAfterHeading('Where'),
                date: dateTime.date,
                start_time: dateTime.start_time,
                end_time: dateTime.end_time
            };
        }, SELECTORS);

        return normaliseDetails(rawDetails);
    } catch (err) {
        console.error(`Kent Uni event failed (${externalUrl}):`, err.message);
        return normaliseDetails();
    }
}

function normaliseListEvent(rawEvent) {
    const title = normaliseText(rawEvent?.title);
    const externalUrl = toAbsoluteUrl(rawEvent?.external_url);

    if (!title || !externalUrl) {
        return null;
    }

    return {
        title,
        image_url: toAbsoluteUrl(rawEvent?.image_url),
        external_url: externalUrl
    };
}

function normaliseDetails(rawDetails = {}) {
    return {
        description: normaliseHtml(rawDetails.description),
        ticket_url: toAbsoluteUrl(rawDetails.ticket_url),
        contact_email: normaliseEmail(rawDetails.contact_email),
        tags: normaliseTags(rawDetails.tags),
        location: normaliseText(rawDetails.location) || DEFAULT_LOCATION,
        background_image_url: null,
        date: normaliseDate(rawDetails.date),
        start_time: normaliseTime(rawDetails.start_time),
        end_time: normaliseTime(rawDetails.end_time)
    };
}

function toFullEvent(event, details) {
    if (!event?.title || !event?.external_url || !details?.date || !details?.start_time) {
        return null;
    }

    return {
        ...event,
        ...details
    };
}

function normaliseDate(value) {
    const text = normaliseText(value);
    if (!text) return null;

    const isoMatch = text.match(/(?:^|\D)((?:19|20)\d{2})-(\d{2})-(\d{2})(?=\D|$)/);
    if (isoMatch) {
        return formatDate(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }

    const ukSlashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/((?:19|20)\d{2})\b/);
    if (ukSlashMatch) {
        return formatDate(Number(ukSlashMatch[3]), Number(ukSlashMatch[2]) - 1, Number(ukSlashMatch[1]));
    }

    return parseDateText(text);
}

function parseDateText(dateText) {
    const cleanDate = stripWeekday(normaliseText(dateText))
        .replace(/,/g, ' ')
        .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

    if (!cleanDate) return null;

    const tokens = cleanDate.split(/\s+/);
    const monthPosition = tokens.findIndex(token => MONTHS[token.toLowerCase().slice(0, 3)] !== undefined);
    const monthIndex = monthPosition >= 0
        ? MONTHS[tokens[monthPosition].toLowerCase().slice(0, 3)]
        : null;
    const day = findDay(tokens, monthPosition);
    const year = findYear(tokens);

    if (monthIndex === null || !isValidDay(day) || !year) return null;

    return formatDate(year, monthIndex, day);
}

function normaliseTime(value) {
    const text = normaliseText(value);
    if (!text || text.toLowerCase() === 'null') return null;

    const timeMatch = text.match(/(?:^|\D)([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?(?=\D|$)/);
    if (timeMatch) {
        return `${pad(timeMatch[1])}:${timeMatch[2]}:${timeMatch[3] || '00'}`;
    }

    const meridiemMatch = text.match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)\b/i);
    if (!meridiemMatch) return null;

    let hour = Number(meridiemMatch[1]);
    const minute = Number(meridiemMatch[2] || 0);
    const meridiem = meridiemMatch[3].toLowerCase();

    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (meridiem === 'am' && hour === 12) hour = 0;
    if (meridiem === 'pm' && hour !== 12) hour += 12;

    return `${pad(hour)}:${pad(minute)}:00`;
}

function normaliseEmail(value) {
    const text = normaliseText(value).replace(/^mailto:/i, '').split('?')[0];
    const match = text.match(/[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+/);

    return match ? match[0].replace(/[.,;:]$/, '') : null;
}

function normaliseHtml(value) {
    return typeof value === 'string'
        ? value.trim() || null
        : null;
}

function normaliseTags(value) {
    return Array.isArray(value)
        ? value.map(normaliseText).filter(Boolean)
        : [];
}

function toAbsoluteUrl(value, baseUrl = BASE_URL) {
    if (!value) return null;

    try {
        return new URL(value, baseUrl).toString();
    } catch {
        return null;
    }
}

function uniqueBy(items, getKey) {
    const seen = new Set();

    return items.filter(item => {
        const key = getKey(item);
        if (!key || seen.has(key)) return false;

        seen.add(key);
        return true;
    });
}

function stripWeekday(text) {
    return text.replace(
        /^(mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?|sun(day)?)\s+/i,
        ''
    );
}

function findDay(tokens, monthPosition) {
    if (monthPosition < 0) return null;

    const beforeMonth = Number(tokens[monthPosition - 1]);
    const afterMonth = Number(tokens[monthPosition + 1]);

    if (isValidDay(beforeMonth)) return beforeMonth;
    if (isValidDay(afterMonth)) return afterMonth;

    return null;
}

function findYear(tokens) {
    const year = tokens.find(token => /^(19|20)\d{2}$/.test(token));
    return year ? Number(year) : null;
}

function formatDate(year, monthIndex, day) {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const isValidDate = date.getUTCFullYear() === year
        && date.getUTCMonth() === monthIndex
        && date.getUTCDate() === day;

    if (!isValidDate) return null;

    return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function isValidDay(day) {
    return Number.isInteger(day) && day >= 1 && day <= 31;
}

function normaliseText(value) {
    return typeof value === 'string'
        ? value.replace(/\s+/g, ' ').trim()
        : '';
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function attachPageLogging(page) {
    page.on('console', msg => console.log('Kent Uni browser:', msg.text()));
    page.on('pageerror', err => console.log('Kent Uni page error:', err.message));
}

async function closePage(page, label) {
    await page.close().catch(err => {
        console.error(`Could not close ${label}:`, err.message);
    });
}

module.exports = {
    scrape,
    _private: {
        normaliseDate,
        normaliseDetails,
        normaliseEmail,
        normaliseListEvent,
        normaliseTime,
        parseDateText,
        toAbsoluteUrl,
        toFullEvent,
        uniqueBy
    }
};
