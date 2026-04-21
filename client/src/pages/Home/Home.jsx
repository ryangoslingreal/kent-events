import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header"
import styles from "./Home.module.css"

import { getAllEvents, getEventImageUrl } from "../../api"
import { mapEventToCard } from "../Events/shared/eventMappers";

function Home(){
    const [activeSourceFilter, setActiveSourceFilter] = useState("All")
    const [allEvents, setAllEvents] = useState([])
    const [rawEvents, setRawEvents] = useState([])
    const [featuredUrl, setFeaturedUrl] = useState([])
    const [filters, setFilters] = useState({
        filterDate: "any",
        filterPrice: "any"
    });
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const PAGE_SIZE = 15;


    useEffect (() => {
        async function getHomeEvents() {
            const data = await getAllEvents(PAGE_SIZE, 0, activeSourceFilter);

            const url = data[0].source === 'ksu' || data[0].source === 'kentUni'
                ? data[0].image_url
                : `${API_BASE}/api/events/${allEvents[0].internalImageUrl}`
            setFeaturedUrl(url);

            if (data.error) {
                setAllEvents([]);
                setRawEvents([]);
                return;
            }
            
            const events = data.map(mapEventToCard);
            setAllEvents(events);
            setRawEvents(events);
            setOffset(PAGE_SIZE)
        }
        
        getHomeEvents();
    }, [activeSourceFilter]);

    const loadMore = async() => {
        const newEvents = await getAllEvents(PAGE_SIZE, offset, activeSourceFilter)
        console.log(newEvents)
        if (newEvents.length < PAGE_SIZE){
            setHasMore(false)
        }

        const events = newEvents.map(mapEventToCard);
        setAllEvents(prev => [...prev, ...events])
        setRawEvents(prev => [...prev, ...events])    //fixing issue of events not being filtered when load more
        setOffset(prev => prev + PAGE_SIZE)
    }

    function handleChange(e){
        const {name, value} = e.target; 
        setFilters((prev) => ({...prev, [name]: value }))
    }

    function handleSubmit(e){
        e.preventDefault();

        const now = new Date(); 

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);

        const endOfMonth = new Date(Date.now())
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999)

        const weekendStart = new Date(now);
        weekendStart.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7)); // 0=Sun, 6=Sat
        weekendStart.setHours(0, 0, 0, 0);

        const weekendEnd = new Date(weekendStart);
        weekendEnd.setDate(weekendStart.getDate() + 1);
        weekendEnd.setHours(23, 59, 59, 999);

        const filteredEvents = rawEvents.filter((event) => {
            const eventDate = new Date(event.event_date);
            const isFree = Number(event.price) === 0;

            const matchesDate = 
                filters.filterDate === "week"
                    ? eventDate <= endOfWeek
                    : filters.filterDate === "month"
                        ? eventDate <= endOfMonth
                        : filters.filterDate === "weekend"
                            ? eventDate >= weekendStart && eventDate <= weekendEnd
                            : true;

            const matchesPrice = 
                filters.filterPrice === "free"
                    ? isFree
                    : filters.filterPrice === "paid"
                        ? !isFree
                        : true;

            return matchesDate && matchesPrice;
        });

        setAllEvents(filteredEvents);
    }

    function eventDetail(eventId) {
        navigate(`/events/detail/${eventId}`);
    }

    return(
        <>
            <Header/>
            <div className={styles.wrapper}>
                <div className={styles.page}>
                    <div className={styles.recommendedWrapper}>
                        <div className={styles.recommended}>
                            <div className={styles.discoverEvent}>
                                <h2>
                                    Discover <span className = {styles.gold}>events</span> on campus for you
                                </h2>
                                <h4 className={styles.filterSubtitle}>
                                    Browse events, save you favourites, and share plans
                                </h4>
                                <div className={styles.filterParent} >
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "All" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("All")}
                                    >
                                        All
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "University" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("University")}
                                    >
                                        University events
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "Society" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("Society")}
                                    >
                                        Society events
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "Student" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("Student")}
                                    >
                                        Student ran events
                                    </a>
                                </div>
                            </div>
                            
                            { allEvents[0] ? (
                                <div className={styles.featuredEvent}
                                    style={{ // Fades background image at the bottom
                                    backgroundImage: `
                                        linear-gradient(
                                            to top,
                                            rgba(0,0,0,0.85) 0%,
                                            rgba(0,0,0,0.6) 40%,
                                            rgba(0,0,0,0.2) 70%,
                                            transparent 100%
                                        ),
                                        url(${featuredUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}
                                >
                                    <h3>{allEvents[0].title}</h3>
                                    <p>
                                        {allEvents[0].date} - {allEvents[0].time} - {allEvents[0].location} - £{allEvents[0].price}
                                    </p>

                                    <button onClick={() => navigate(`/events/detail/${allEvents[0].id}`)}>
                                        View Details
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.featuredEvent}>
                                    <p style={{ padding: 20 }}>Loading featured event…</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.filter_Events}>
                        <form onSubmit={handleSubmit} className={styles.filter}>
                            <h3>Filters</h3>

                            <label>Date</label>
                            <select className={styles.select} name="filterDate" onChange={handleChange}>
                                <option value="any">Anytime</option>
                                <option value="weekend">This weekend</option>
                                <option value="week">This week</option>
                                <option value="month">This month</option>
                            </select>

                            <label>Price</label>
                            <select className={styles.select} name="filterPrice" onChange={handleChange}>
                                <option value="any">Any</option>
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>

                            <button type="submit">Submit</button>
                        </form>

                        <div className={styles.events}>
                            <h3>Popular events</h3>
                            <div className={styles.eventList}>
                                {allEvents.map((event) => (
                                    <div key={event.id} className={styles.eventCard} onClick={() => eventDetail(event.id)}>
                                        <div className={styles.imageWrapper}>
                                            { event.source === 'ksu' || event.source === 'kentUni' ? (
                                                <img className={styles.eventImage} src={event.image_url}></img>
                                            ) : (
                                                <img 
                                                    className={styles.eventImage}
                                                    src={getEventImageUrl(event.imageUrl)}
                                                    alt={event.title}
                                                />
                                            )}
                                            { event.id === allEvents[0].id && (
                                                <span className={styles.badge}>featured</span>
                                            )}
                                        </div>

                                        <div className={styles.eventContent}>
                                            <p className={styles.eventDetails}>
                                                {event.date} - {event.time} - {Number(event.price) === 0.00 ? "Free" : `£${event.price}`}
                                            </p>
                                            <h4 className={styles.eventTitle}>{event.title}</h4>
                                            <p className={styles.location_tag}>
                                                {event.location}
                                                { event.tags.length != 0 && (
                                                    <span className={styles.tag}>{event.tags[0]}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.loadMoreWrapper}>
                                { hasMore && (
                                    <button onClick={() => loadMore()} className={styles.loadMoreBtn}>Load More</button>
                                )}
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;  