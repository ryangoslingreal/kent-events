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

function resolveImage(item) {
    const primary = item?.image?.url ?? null;
    const background = item?.backgroundImageUrl ?? null;

    return {
        imageUrl: primary,
        backgroundImageUrl: background || primary
    };
}

export function mapEventToCard(item) {
    const { imageUrl } = resolveImage(item);

    return {
        id: item.id,
        imageUrl,
        time: formatTime(item.start_time),
        date: formatDateShort(item.date),
        location: item.location,
        title: item.title,
        tags: item.tags
    };
}

export function mapEventToDetails(item) {
    const { imageUrl, backgroundImageUrl } = resolveImage(item);

    const [start_h, start_m] = item.start_time.split(":");  
    const [end_h, end_m] = item.end_time ? item.end_time.split(":") : ["", ""];
    
    return {
        ...item,
        imageUrl,
        backgroundImageUrl,
        date: formatDateLong(item.date),
        start_time: `${start_h}:${start_m}`,
        end_time: item.end_time ? `${end_h}:${end_m}` : ""
    };
}

export function mapEventToRelatedCard(item) {
    const { imageUrl } = resolveImage(item);

    return {
        ...item,
        imageUrl,
        date: formatDateShort(item.date),
        start_time: formatTime(item.start_time)
    };
}

export function mapEventToChoiceRow(item) {
    return {
        id: item.id,
        name: item.title,
        date: item.date.split("T")[0]
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
