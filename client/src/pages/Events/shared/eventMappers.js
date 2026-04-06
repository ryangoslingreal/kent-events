function formatDateShort(dateValue) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        month: "short",
        day: "numeric"
    }).format(new Date(dateValue));
}

function formatDateLong(dateValue) {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date(dateValue));
}

function formatTime(timeValue) {
    if (timeValue == null){
        return null
    }
    const [h, m] = timeValue.split(":").map(Number);
    const date = new Date().setHours(h, m, 0, 0);

    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(date);
}

export function mapEventToCard(item) {
    return { 
        id: item.id,
        image: item.image, 
        internalImageUrl: item.internalImageUrl, 
        time: formatTime(item.event_time),
        date: formatDateShort(item.event_date),
        event_date: item.event_date,
        location: item.location,
        price: item.price,
        title: item.title,
        tags: item.tags,
        image_url: item.image_url,
        source: item.source
    };
}

export function mapEventToDetails(item) {
    const [h, m] = item.event_time.split(":");

    return {
        ...item,
        event_date: formatDateLong(item.event_date),
        event_time: `${h}:${m}`
    };
}

export function mapEventToRelatedCard(item) {
    return {
        ...item,
        event_time: formatTime(item.event_time),
        event_date: formatDateShort(item.event_date)
    };
}

export function mapEventToChoiceRow(item) {
    return {
        id: item.id,
        name: item.title,
        date: item.event_date.split("T")[0],
        dateCheck: item.event_date
    };
}

export function splitEventsByArchiveDate(events, today = new Date().toISOString().split("T")[0]) {
    const upcomingEvents = [];
    const archivedEvents = [];

    for (const e of events) {
        if (today > e.date) {
            archivedEvents.push(e);
        } else {
            upcomingEvents.push(e);
        }
    }

    return {
        upcomingEvents: upcomingEvents.reverse(),
        archivedEvents: archivedEvents.reverse()
    };
}