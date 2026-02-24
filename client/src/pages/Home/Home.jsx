
import { useEffect, useState } from "react";
import { getAllEvents } from "../../api"
import Header from "../../components/layout/Header"
import styles from "./Home.module.css"
function Home(){
    const [activeFilter, setActiveFilter] = useState("All")
    const [allEvents, setAllEvents] = useState([])
    const API_BASE = "http://localhost:3001"
    let events = []
    useEffect (() => {
        
        const getHomeEvents = async() => {
            const data = await getAllEvents()
            console.log(data[0].event_time)
            
            for (let i=0; i<data.length; i++){
                //formatting date and time
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }).format(new Date(data[i].event_date));
                
                const [h, m] = data[0].event_time.split(":").map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                const formattedTime = new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                }).format(d);

                let event = { 
                    id: data[i].id,
                    image: data[i].image, 
                    imageUrl: data[i].imageUrl, 
                    time: formattedTime,
                    date: formattedDate,
                    location: data[i].location,
                    price: data[i].price,
                    title: data[i].title,
                    tags: data[i].tags,
                }
                events.push(event)
            }
            setAllEvents(events)
            console.log(data);
        }
        getHomeEvents()
    }, [])

    return(
        <>
            <Header/>
            <div className={styles.wrapper}>
                <div className={styles.page}>
                    <div className={styles.recommendedWrapper}>
                        <div className={styles.recommended}>
                            <div className={styles.discoverEvent}>
                                <h2>Discover <span className = {styles.gold}>events</span> on campus for you</h2>
                                <h4 className={styles.filterSubtitle}>Browse events, save you favourites, and share plans</h4>
                                <div className={styles.filterParent} >
                                    <a className={`${styles.eventFilter} ${activeFilter === "All" ? styles.active : ""}`} onClick={() => setActiveFilter("All")}>All</a>
                                    <a className={`${styles.eventFilter} ${activeFilter === "University" ? styles.active : ""}`} onClick={() => setActiveFilter("University")}>University events</a>
                                    <a className={`${styles.eventFilter} ${activeFilter === "Society" ? styles.active : ""}`} onClick={() => setActiveFilter("Society")}>Society events</a>
                                    <a className={`${styles.eventFilter} ${activeFilter === "Student" ? styles.active : ""}`} onClick={() => setActiveFilter("Student")}>Student ran events</a>
                                </div>
                            </div>
                            {allEvents[0] ? (
                                <div className={styles.featuredEvent} style={{
                                    //Fades background image at the bottom
                                    backgroundImage:`    
                                        linear-gradient(   
                                            to top,
                                            rgba(0,0,0,0.85) 0%,
                                            rgba(0,0,0,0.6) 40%,
                                            rgba(0,0,0,0.2) 70%,
                                            transparent 100%
                                        ),
                                        url(${API_BASE}/api/events/${allEvents[0].imageUrl})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center"
                                    }}>
                                    <h3>{allEvents[0].title}</h3>
                                    <p>{allEvents[0].date} - {allEvents[0].time} - {allEvents[0].location} - £{allEvents[0].price} </p>
                                    <button>View Details</button>
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
                            <select className={styles.select} defaultValue="any">
                                <option value="any">Anytime</option>
                                <option value="weekend">This weekend</option>
                                <option value="week">This week</option>
                                <option value="month">This month</option>
                            </select>

                            <label>Price</label>
                            <select className={styles.select} defaultValue="any">
                                <option value="any">Any</option>
                                <option value="free">Free</option>
                                <option value="paid">Paid</option>
                            </select>
                            <button>Clear filter</button>
                        </div>
                        <div className={styles.events}>
                            <h3>Popular events</h3>
                            <div className={styles.eventList}>
                                {allEvents.map((event) => (
                                    <div className={styles.eventCard}>
                                        <div className={styles.imageWrapper}>
                                            <img className={styles.eventImage} src={`${API_BASE}/api/events/${event.imageUrl}`}/>
                                            {event.id === allEvents[0].id && (
                                                <span className={styles.badge}>featured</span>
                                            )}
                                            
                                        </div>
                                        <div className={styles.eventContent}>
                                            <p className={styles.eventDetails}>{event.date} - {event.time} - {event.price === 0.00 ? "Free" : `£${event.price}`}</p>
                                            <h4 className={styles.eventTitle}>{event.title}</h4>
                                            <p className={styles.location_tag}>
                                                {event.location}
                                                {event.tags && (
                                                    <span className={styles.tag}>{event.tags}</span>
                                                )}
                                            </p>

                                        </div>
                                    </div>
                                    
                                    
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Home;  
