import { describe, expect, it } from "vitest";

const { _private } = require("../../src/scrapers/scrapeUni.js");

describe("scrapeUni helpers", () => {
    it("normalises a valid list event", () => {
        const event = _private.normaliseListEvent({
            title: "  Public Lecture ",
            image_url: "/media/lecture.jpg",
            external_url: "/events/public-lecture"
        });

        expect(event).toMatchObject({
            title: "Public Lecture",
            image_url: "https://student.kent.ac.uk/media/lecture.jpg",
            external_url: "https://student.kent.ac.uk/events/public-lecture"
        });
    });

    it("skips list events without a title or URL", () => {
        expect(_private.normaliseListEvent({
            title: "Missing URL"
        })).toBeNull();

        expect(_private.normaliseListEvent({
            external_url: "/events/missing-title"
        })).toBeNull();
    });

    it("normalises detail fields for database saving", () => {
        const details = _private.normaliseDetails({
            description: " <p>Bring your questions.</p> ",
            ticket_url: "/events/public-lecture/book",
            contact_email: "mailto:events@example.ac.uk?subject=Lecture",
            tags: [" Academic ", "", "Open"],
            location: "  Grimond LT1 ",
            date: "2026-10-05 00:00:00",
            start_time: "18:30",
            end_time: "20:00"
        });

        expect(details).toMatchObject({
            description: "<p>Bring your questions.</p>",
            ticket_url: "https://student.kent.ac.uk/events/public-lecture/book",
            contact_email: "events@example.ac.uk",
            tags: ["Academic", "Open"],
            location: "Grimond LT1",
            background_image_url: null,
            date: "2026-10-05",
            start_time: "18:30:00",
            end_time: "20:00:00"
        });
    });

    it("defaults optional detail fields without inventing required dates", () => {
        expect(_private.normaliseDetails()).toMatchObject({
            description: null,
            ticket_url: null,
            contact_email: null,
            tags: [],
            location: "Location TBC",
            background_image_url: null,
            date: null,
            start_time: null,
            end_time: null
        });
    });

    it("parses common Kent date formats", () => {
        expect(_private.normaliseDate("2026-11-09T00:00:00+00:00")).toBe("2026-11-09");
        expect(_private.normaliseDate("09/11/2026")).toBe("2026-11-09");
        expect(_private.normaliseDate("Monday 9th November 2026")).toBe("2026-11-09");
    });

    it("parses 24-hour and meridiem times", () => {
        expect(_private.normaliseTime("09:05")).toBe("09:05:00");
        expect(_private.normaliseTime("14:15:30")).toBe("14:15:30");
        expect(_private.normaliseTime("2.30pm")).toBe("14:30:00");
        expect(_private.normaliseTime("12am")).toBe("00:00:00");
    });

    it("extracts email addresses from hrefs and visible text", () => {
        expect(_private.normaliseEmail("mailto:hello@example.ac.uk?subject=Hi")).toBe("hello@example.ac.uk");
        expect(_private.normaliseEmail("Contact hello@example.ac.uk.")).toBe("hello@example.ac.uk");
        expect(_private.normaliseEmail("not an email")).toBeNull();
    });

    it("builds full events only when required scraped fields are present", () => {
        const listEvent = {
            title: "Workshop",
            image_url: "https://student.kent.ac.uk/workshop.jpg",
            external_url: "https://student.kent.ac.uk/events/workshop"
        };

        expect(_private.toFullEvent(listEvent, {
            description: null,
            location: "Studio",
            tags: [],
            date: "2026-08-01",
            start_time: "10:00:00",
            end_time: "12:00:00"
        })).toMatchObject({
            title: "Workshop",
            image_url: "https://student.kent.ac.uk/workshop.jpg",
            external_url: "https://student.kent.ac.uk/events/workshop",
            description: null,
            location: "Studio",
            tags: [],
            date: "2026-08-01",
            start_time: "10:00:00",
            end_time: "12:00:00"
        });

        expect(_private.toFullEvent(listEvent, {
            location: "Studio",
            date: "2026-08-01",
            start_time: null
        })).toBeNull();
    });

    it("deduplicates by the provided key", () => {
        const events = _private.uniqueBy([
            { external_url: "https://student.kent.ac.uk/events/a" },
            { external_url: "https://student.kent.ac.uk/events/a" },
            { external_url: "https://student.kent.ac.uk/events/b" },
            { external_url: null }
        ], event => event.external_url);

        expect(events).toEqual([
            { external_url: "https://student.kent.ac.uk/events/a" },
            { external_url: "https://student.kent.ac.uk/events/b" }
        ]);
    });
});
