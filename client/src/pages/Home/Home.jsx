import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../../components/layout/Header"
import styles from "./Home.module.css"
import toast from "react-hot-toast";


import { getAllEvents, getHeaderEventImageUrl, getPrimaryEventImageUrl } from "../../api"
import { mapEventToCard } from "../Events/shared/eventMappers";

function Home(){
    const [activeSourceFilter, setActiveSourceFilter] = useState("all");
    const [allEvents, setAllEvents] = useState([]);
    const [rawEvents, setRawEvents] = useState([]);
    const [featuredUrl, setFeaturedUrl] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const PAGE_SIZE = 15;

    useEffect (() => {
        async function getHomeEvents() {
            setLoading(true)
            const data = await getAllEvents(PAGE_SIZE, 0, activeSourceFilter, selectedDate);
    
            setHasMore(true)

            if (data.error) {
                toast.error("No events found. " + data.error)
                setAllEvents([]);
                setRawEvents([]);
                setFeaturedUrl("");
                setHasMore(false);
                setLoading(false);
                return;
            }

            if (data.length === 0) {
                toast.error("No events found. " + data.error)
                setAllEvents([]);
                setRawEvents([]);
                setFeaturedUrl("");
                setOffset(0);
                setHasMore(false);
                setLoading(false);
                return;
            }

            const events = data.map((event) => ({
                ...mapEventToCard(event),
                imageUrl: getPrimaryEventImageUrl(event),
                backgroundImageUrl: getHeaderEventImageUrl(event)
            }));

            setFeaturedUrl(events[0].backgroundImageUrl || events[0].imageUrl || "");
            setAllEvents(events);
            setRawEvents(events);
            setOffset(PAGE_SIZE);
            setLoading(false);

            if (data.length < PAGE_SIZE){
                setHasMore(false);
            }
        }
        getHomeEvents();
    }, [activeSourceFilter, selectedDate]);

    const loadMore = async() => {
        setLoading(true)
        const newEvents = await getAllEvents(PAGE_SIZE, offset, activeSourceFilter, selectedDate);
        
        if (newEvents.error) {
            setLoading(false)
            toast.error("No events found. " + newEvents.error)
            return;
        }
        
        if (newEvents.length < PAGE_SIZE) {
            setHasMore(false);
        }

        const events = newEvents.map((event) => ({
            ...mapEventToCard(event),
            imageUrl: getPrimaryEventImageUrl(event),
            backgroundImageUrl: getHeaderEventImageUrl(event)
        }));

        setAllEvents(prev => [...prev, ...events]);
        setRawEvents(prev => [...prev, ...events]);    //fixing issue of events not being filtered when load more
        setOffset(prev => prev + PAGE_SIZE);

        setLoading(false)
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
                                        className={`${styles.eventFilter} ${activeSourceFilter === "all" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("all")}
                                    >
                                        All
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "university" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("university")}
                                    >
                                        University events
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "society" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("society")}
                                    >
                                        Society events
                                    </a>
                                    <a
                                        className={`${styles.eventFilter} ${activeSourceFilter === "student" ? styles.active : ""}`}
                                        onClick={() => setActiveSourceFilter("student")}
                                    >
                                        Student events
                                    </a>
                                </div>
                            </div>
                            
                            {allEvents[0] ? (
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
                                        {allEvents[0].date} - {allEvents[0].time} - {allEvents[0].location}
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
                        <div className={styles.filter}>
                            <h3>Filters</h3>

                            <label>Date</label>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                placeholderText="Select a date"
                                dateFormat="dd/MM/yyyy"
                                isClearable
                            />
                        </div>

                        <div className={styles.events}>
                            <h3>Popular events</h3>
                            <div className={styles.eventList}>
                                {allEvents.map((event) => (
                                    <div key={event.id} className={styles.eventCard} onClick={() => eventDetail(event.id)}>
                                        <div className={styles.imageWrapper}>
                                            {event.imageUrl && (
                                                <img 
                                                    className={styles.eventImage}
                                                    src={event.imageUrl}
                                                    alt={event.title}
                                                />
                                            )}
                                            {event.id === allEvents[0].id && (
                                                <span className={styles.badge}>featured</span>
                                            )}
                                        </div>

                                        <div className={styles.eventContent}>
                                            <p className={styles.eventDetails}>
                                                {event.date} - {event.time}
                                            </p>
                                            <h4 className={styles.eventTitle}>{event.title}</h4>
                                            <p className={styles.location_tag}>
                                                {event.location}
                                                {event.tags.length != 0 && (
                                                    <span className={styles.tag}>{event.tags[0]}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            { loading ? (
                                <div className="spinnerWrapper">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <>
                                <div className={styles.loadMoreWrapper}>
                                    {hasMore && (
                                        <button onClick={() => loadMore()} className={styles.loadMoreBtn}>Load More</button>
                                    )}
                                </div>
                                </>
                            )}
                            
                                
                            
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;  