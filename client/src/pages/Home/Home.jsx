
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

            // const [h, m] = data[0].event_time.split(":").map(Number);
            // const d = new Date();
            // d.setHours(h, m, 0, 0);
            
            // const formattedTime = new Intl.DateTimeFormat("en-US", {
            //         hour: "numeric",
            //         minute: "2-digit",
            //         hour12: true,
            // }).format(d);

            // console.log(formattedTime)
            
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
                    image: data[i].image, 
                    imageUrl: data[i].imageUrl, 
                    time: formattedTime,
                    date: formattedDate,
                    location: data[i].location,
                    price: data[i].price,
                    title: data[i].title 
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
                    <div className={styles.recommended}>
                        <div className={styles.discoverEvent}>
                            <h2>Discover events on campus for you</h2>
                            <h4 className={styles.filterSubtitle}>Browse events, save you favourites, and share plans</h4>
                            <div className={styles.filterParent} >
                                <a className={`${styles.eventFilter} ${activeFilter === "All" ? styles.active : ""}`} onClick={() => setActiveFilter("All")}>All</a>
                                <a className={`${styles.eventFilter} ${activeFilter === "University" ? styles.active : ""}`} onClick={() => setActiveFilter("University")}>University events</a>
                                <a className={`${styles.eventFilter} ${activeFilter === "Society" ? styles.active : ""}`} onClick={() => setActiveFilter("Society")}>Society events</a>
                                <a className={`${styles.eventFilter} ${activeFilter === "Student" ? styles.active : ""}`} onClick={() => setActiveFilter("Student")}>Student ran events</a>
                            </div>
                        </div>
                        <div className={styles.featuredEvent}>
                            <p>checking</p>
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
                        </div>
                        <div className={styles.events}>
                            <h3>Popular events</h3>
                            {allEvents.map((event) => (
                                <div className={styles.eventList}>
                                    <div className={styles.eventCard}>
                                        <div className={styles.imageWrapper}>
                                            <img className={styles.eventImage} src={`${API_BASE}/api/events/${event.imageUrl}`}/>
                                            <span className={styles.price}>
                                                {event.price === 0 ? "Free" : `£${event.price}`}
                                            </span>
                                        </div>
                                        <div className={styles.eventContent}>
                                            <h3 className={styles.eventTitle}>{event.title}</h3>

                                            <div className={styles.eventDetails}>
                                                <p><strong>Date:</strong> {event.date}</p>
                                                <p><strong>Time:</strong> {event.time}</p>
                                                <p><strong>Location:</strong> {event.location}</p>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default Home;  
