const puppeteer = require('puppeteer');

const BASE_URL = 'https://ksu.co.uk';
const EVENTS_URL = `${BASE_URL}/events`;
const MAX_LOAD_MORE_CLICKS = 50;
const YEAR_ROLLOVER_DAYS = 30;
const DEFAULT_LOCATION = 'Location TBC';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const SELECTORS = {
    loadMoreButton: '#see-more',
    eventCard: '.col',
    cardLink: 'a',
    cardDateTime: '.fw-bold.mb-0',
    cardImage: '.w-100.border.rounded.ksu-aspect-1-1',
    cardTitle: '.h5',
    description: '#eventDescription',
    venue: '#eventVenue',
    backgroundImage: '.w-100.border.rounded.ku-aspect-16-9.shadow.mb-3',
    categories: '#eventCategories .badge',
    ticketButton: '.btn.ku-btn-green.p-4.mb-3'
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
                console.error('Could not close KSU browser:', err.message);
            });
        }
    }
}

async function scrapeListPage(browser, referenceDate = new Date()) {
    const page = await browser.newPage();
    attachPageLogging(page);

    try {
        await page.goto(EVENTS_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await loadAllEvents(page);

        const rawEvents = await page.evaluate((selectors) => {
            function textFrom(parent, selector) {
                return parent.querySelector(selector)?.innerText.trim() || null;
            }

            return Array.from(document.querySelectorAll(selectors.eventCard)).map(el => {
                const link = el.querySelector(selectors.cardLink);

                return {
                    href: link?.getAttribute('href') || null,
                    dateTime: textFrom(el, selectors.cardDateTime),
                    image_url: el.querySelector(selectors.cardImage)?.getAttribute('src') || null,
                    title: textFrom(el, selectors.cardTitle)
                };
            });
        }, SELECTORS);

        return rawEvents
            .map(rawEvent => normaliseListEvent(rawEvent, referenceDate))
            .filter(Boolean);
    } finally {
        await closePage(page, 'KSU list page');
    }
}

async function loadAllEvents(page) {
    for (let clickCount = 0; clickCount < MAX_LOAD_MORE_CLICKS; clickCount++) {
        const button = await page.$(SELECTORS.loadMoreButton);
        if (!button) return;

        const isClickable = await button.evaluate(el => {
            return !el.disabled && Boolean(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        }).catch(() => false);

        if (!isClickable) return;

        const beforeCount = await countEventCards(page);

        await button.click();
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 10000 }).catch(() => {});
        await page.waitForFunction(
            (cardSelector, loadMoreSelector, count) => {
                return document.querySelectorAll(cardSelector).length > count
                    || !document.querySelector(loadMoreSelector);
            },
            { timeout: 5000 },
            SELECTORS.eventCard,
            SELECTORS.loadMoreButton,
            beforeCount
        ).catch(() => {});

        const afterCount = await countEventCards(page);
        if (afterCount <= beforeCount) {
            console.log('KSU load more did not reveal new events; stopping');
            return;
        }
    }

    console.log(`KSU load more limit reached at ${MAX_LOAD_MORE_CLICKS} clicks; continuing with loaded events`);
}

async function countEventCards(page) {
    return await page.$$eval(SELECTORS.eventCard, els => els.length).catch(() => 0);
}

async function scrapeDetailPages(browser, events) {
    const detailPage = await browser.newPage();
    attachPageLogging(detailPage);

    try {
        const fullEvents = [];

        for (const [index, event] of events.entries()) {
            console.log(`KSU scraping ${index + 1}/${events.length} ${event.external_url}`);

            const details = await scrapeEventDetails(detailPage, event.external_url);
            fullEvents.push(toFullEvent(event, details));
        }

        return fullEvents;
    } finally {
        await closePage(detailPage, 'KSU detail page');
    }
}

async function scrapeEventDetails(page, externalUrl) {
    try {
        await page.goto(externalUrl, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForSelector(SELECTORS.description, { timeout: 10000 }).catch(() => {
            console.log('KSU description not found for:', externalUrl);
        });

        const rawDetails = await page.evaluate((selectors) => {
            const description = document.querySelector(selectors.description)?.innerHTML.trim() || null;
            const location = document.querySelector(selectors.venue)?.innerText.trim() || null;
            const background_image_url = document
                .querySelector(selectors.backgroundImage)
                ?.getAttribute('src') || null;
            const tags = Array.from(document.querySelectorAll(selectors.categories))
                .map(el => el.innerText.trim())
                .filter(Boolean);
            const ticket_url = document.querySelector(selectors.ticketButton)?.getAttribute('href') || null;

            return { description, location, background_image_url, tags, ticket_url };
        }, SELECTORS);

        return normaliseDetails(rawDetails);
    } catch (err) {
        console.error(`KSU event failed (${externalUrl}):`, err.message);
        return normaliseDetails();
    }
}

function toFullEvent(event, details) {
    return {
        ...event,
        ...details
    };
}

function normaliseListEvent(rawEvent, referenceDate = new Date()) {
    const title = normaliseText(rawEvent?.title);
    const externalUrl = toAbsoluteUrl(rawEvent?.href);
    const { date, start_time, end_time } = parseDateTimeText(rawEvent?.dateTime, referenceDate);

    if (!title || !externalUrl || !date || !start_time) {
        return null;
    }

    return {
        title,
        image_url: toAbsoluteUrl(rawEvent?.image_url),
        date,
        start_time,
        end_time,
        external_url: externalUrl
    };
}

function normaliseDetails(rawDetails = {}) {
    const description = typeof rawDetails.description === 'string'
        ? rawDetails.description.trim() || null
        : null;

    const tags = Array.isArray(rawDetails.tags)
        ? rawDetails.tags.map(normaliseText).filter(Boolean)
        : [];

    return {
        description,
        location: normaliseText(rawDetails.location) || DEFAULT_LOCATION,
        background_image_url: toAbsoluteUrl(rawDetails.background_image_url),
        tags,
        ticket_url: toAbsoluteUrl(rawDetails.ticket_url),
        contact_email: null
    };
}

function parseDateTimeText(dateTimeText, referenceDate = new Date()) {
    const [datePart, ...timeParts] = String(dateTimeText || '').split('|');
    const date = parseDateText(datePart, referenceDate);
    const { start, end } = parseTimeRange(timeParts.join('|'));

    return {
        date,
        start_time: start,
        end_time: end
    };
}

function parseDateText(dateText, referenceDate = new Date()) {
    const cleanDate = stripWeekday(normaliseText(dateText))
        .replace(/,/g, ' ')
        .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1');

    if (!cleanDate) return null;

    const tokens = cleanDate.split(/\s+/);
    const monthIndex = findMonthIndex(tokens);
    const monthPosition = tokens.findIndex(token => MONTHS[token.toLowerCase().slice(0, 3)] !== undefined);
    const day = findDay(tokens, monthPosition);
    const explicitYear = findYear(tokens);

    if (monthIndex === null || !isValidDay(day)) return null;

    const year = explicitYear || inferYear(monthIndex, day, referenceDate);
    return formatDate(year, monthIndex, day);
}

function parseTimeRange(timeRangeText) {
    const cleanTimeRange = normaliseText(timeRangeText);
    if (!cleanTimeRange) return { start: null, end: null };

    const [startText, endText] = cleanTimeRange.split(/\s*(?:-|\u2013|\u2014|to)\s*/i);
    const startParts = readTimeParts(startText);
    const endParts = readTimeParts(endText);
    const startMeridiem = inferStartMeridiem(startParts, endParts);

    return {
        start: formatTime(startParts, startMeridiem),
        end: formatTime(endParts, endParts?.meridiem)
    };
}

function inferStartMeridiem(startParts, endParts) {
    if (!startParts || startParts.meridiem || !endParts?.meridiem) {
        return startParts?.meridiem;
    }

    if (endParts.meridiem === 'pm') {
        if (startParts.hour === 12) return 'pm';
        return startParts.hour > endParts.hour ? 'am' : 'pm';
    }

    return 'am';
}

function readTimeParts(timeText) {
    const match = normaliseText(timeText).match(/\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    const meridiem = match[3]?.toLowerCase() || null;

    if (minute > 59) return null;
    if (meridiem && (hour < 1 || hour > 12)) return null;
    if (!meridiem && hour > 23) return null;

    return { hour, minute, meridiem };
}

function formatTime(parts, meridiem = parts?.meridiem) {
    if (!parts) return null;

    let hour = parts.hour;
    if (meridiem === 'am' && hour === 12) {
        hour = 0;
    } else if (meridiem === 'pm' && hour !== 12) {
        hour += 12;
    }

    return `${pad(hour)}:${pad(parts.minute)}:00`;
}

function stripWeekday(text) {
    return text.replace(
        /^(mon(day)?|tue(s(day)?)?|wed(nesday)?|thu(r(s(day)?)?)?|fri(day)?|sat(urday)?|sun(day)?)\s+/i,
        ''
    );
}

function findMonthIndex(tokens) {
    for (const token of tokens) {
        const monthIndex = MONTHS[token.toLowerCase().slice(0, 3)];
        if (monthIndex !== undefined) return monthIndex;
    }

    return null;
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

function inferYear(monthIndex, day, referenceDate = new Date()) {
    const referenceYear = referenceDate.getFullYear();
    const referenceDay = Date.UTC(
        referenceYear,
        referenceDate.getMonth(),
        referenceDate.getDate()
    );
    const eventDay = Date.UTC(referenceYear, monthIndex, day);
    const daysFromReference = (eventDay - referenceDay) / MS_PER_DAY;

    return daysFromReference < -YEAR_ROLLOVER_DAYS
        ? referenceYear + 1
        : referenceYear;
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

function normaliseText(value) {
    return typeof value === 'string'
        ? value.replace(/\s+/g, ' ').trim()
        : '';
}

function pad(value) {
    return String(value).padStart(2, '0');
}

function attachPageLogging(page) {
    page.on('console', msg => console.log('KSU browser:', msg.text()));
    page.on('pageerror', err => console.log('KSU page error:', err.message));
}

async function closePage(page, label) {
    await page.close().catch(err => {
        console.error(`Could not close ${label}:`, err.message);
    });
}

module.exports = {
    scrape,
    _private: {
        inferYear,
        normaliseDetails,
        normaliseListEvent,
        parseDateText,
        parseDateTimeText,
        parseTimeRange,
        toAbsoluteUrl,
        uniqueBy
    }
};
