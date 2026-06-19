import { describe, expect, it } from "vitest";

const { _private } = require("../../src/scrapers/scrapeKSU.js");

describe("scrapeKSU helpers", () => {
    it("normalises a valid list event", () => {
        const referenceDate = new Date("2026-06-19T12:00:00Z");

        const event = _private.normaliseListEvent({
            title: "  Big Night   Out ",
            href: "/events/big-night-out",
            image_url: "/assets/big-night.jpg",
            dateTime: "Sunday 21 June | 20:00 - 23:00"
        }, referenceDate);

        expect(event).toMatchObject({
            title: "Big Night Out",
            image_url: "https://ksu.co.uk/assets/big-night.jpg",
            date: "2026-06-21",
            start_time: "20:00:00",
            end_time: "23:00:00",
            external_url: "https://ksu.co.uk/events/big-night-out"
        });
    });

    it("infers next year for early-year events scraped late in the year", () => {
        const referenceDate = new Date("2026-12-20T12:00:00Z");

        expect(_private.parseDateTimeText("Friday 10 January | 7 - 9pm", referenceDate)).toEqual({
            date: "2027-01-10",
            start_time: "19:00:00",
            end_time: "21:00:00"
        });
    });

    it("keeps same-year dates when a date is only recently past", () => {
        const referenceDate = new Date("2026-06-19T12:00:00Z");

        expect(_private.parseDateText("Friday 12 June", referenceDate)).toBe("2026-06-12");
    });

    it("handles noon-crossing shorthand time ranges", () => {
        expect(_private.parseTimeRange("11 - 1pm")).toEqual({
            start: "11:00:00",
            end: "13:00:00"
        });
    });

    it("skips list events that cannot satisfy required database fields", () => {
        const event = _private.normaliseListEvent({
            title: "Incomplete Event",
            href: "/events/incomplete",
            dateTime: "Date TBC"
        });

        expect(event).toBeNull();
    });

    it("normalises detail defaults and URLs", () => {
        const details = _private.normaliseDetails({
            description: " <p>Hello</p> ",
            location: "   ",
            background_image_url: "/images/banner.jpg",
            tags: [" Music ", "", "Social"],
            ticket_url: "/tickets/123"
        });

        expect(details).toMatchObject({
            description: "<p>Hello</p>",
            location: "Location TBC",
            background_image_url: "https://ksu.co.uk/images/banner.jpg",
            tags: ["Music", "Social"],
            ticket_url: "https://ksu.co.uk/tickets/123",
            contact_email: null
        });
    });

    it("deduplicates by the provided key", () => {
        const events = _private.uniqueBy([
            { external_url: "https://ksu.co.uk/events/a" },
            { external_url: "https://ksu.co.uk/events/a" },
            { external_url: "https://ksu.co.uk/events/b" },
            { external_url: null }
        ], event => event.external_url);

        expect(events).toEqual([
            { external_url: "https://ksu.co.uk/events/a" },
            { external_url: "https://ksu.co.uk/events/b" }
        ]);
    });
});
