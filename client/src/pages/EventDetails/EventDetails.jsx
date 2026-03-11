import styles from "./EventDetails.module.css";
import homeStyles from "../Home/Home.module.css";
import Header from "../../components/layout/Header"
import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, getAllEvents } from "../../api";
import toast, { Toaster } from "react-hot-toast";
const API_BASE = "http://localhost:3001"

function EventDetails() {
    const [otherEvents, setOtherEvents] = useState([])
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const getEventData = async() => {
            
            const eventData = await getEvent(id)
            let date = new Date(eventData.event_date);
            console.log(eventData)
            eventData.event_date = date.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            let time = eventData.event_time;
            const [hours, minutes] = time.split(':');
            eventData.event_time = `${hours}:${minutes}`

            setFormData(eventData)
        }
        getEventData()

        //Get other events section
        const getOtherEvents = async() => {
            const data = await getAllEvents()
            console.log(data)
            let events = []
            let otherEventLen = 5
            if (5 > data.length){
                otherEventLen = data.length
            } 

            for (let i=0; i<otherEventLen; i++){
                let event = data[i]
                if (String(event.id) === String(id)){
                    console.log("Hitting")
                    continue
                }
                //formatting date and time
                const formattedDate = new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }).format(new Date(data[i].event_date));
                
                const [h, m] = data[i].event_time.split(":").map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                const formattedTime = new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",    
                    minute: "2-digit",
                    hour12: true,
                }).format(d);

                event.event_time = formattedTime
                event.event_date = formattedDate

                events.push(event)
            }
            setOtherEvents(events)
            
        }
        getOtherEvents()
    }, [])

    const eventDetail = (eventId) => {
        navigate(`/events/detail/${eventId}`)
        window.location.reload();
    }

    return(
        <>
            <Header /> 
            <div className={styles.page}>
                <Toaster 
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            fontFamily: "Overpass, Helvetica, Arial, sans-serif",
                        },
                    }}
                />
                <div className={styles.eventHeader}>
                    <img className={styles.eventHeaderImg} src={`${API_BASE}/api/events/${formData.imageUrl}`}></img>
                    <div className={styles.eventHeaderOverlay} />
                    <div className={styles.eventHeaderContent}>
                        <h2 className={styles.title}>{formData.title}</h2>
                        <p className={styles.eventOrganiser}>Organised by <span>Spanish Society</span> · University of Kent</p>
                    </div>
                </div>
                <div className={styles.informationWrapper}>
                    <div className={styles.centerInfo}>
                        <div className={styles.descriptionWrapper}>
                            <h3>About this event</h3>
                            <p>{formData.description}</p>
                        </div>
                        <div className={styles.tags}>
                            <h3>Tags</h3>
                            {/* <a>{formData.tags}</a> */}
                            <a>Food</a>
                            <a>Sports</a>
                            <a>Drinking</a>
                        </div>
                        {formData.available_contact === 1 ? (
                            <div className={styles.contact}>
                                <h3>Who to contact</h3>
                                <p>example@email.co.uk</p>
                            </div>
                        ) : (
                           null
                        )}
                        <div className={styles.otherEvents}>
                            <h3>Other events you may like</h3>
                            <div className={styles.otherEventsScroller}>
                                {otherEvents.map((event) => (
                                    <div className={styles.eventCard} onClick={() => eventDetail(event.id)}>
                                        <img className={styles.eventImage} src={`${API_BASE}/api/events/${event.imageUrl}`}/>
                                        <div className={styles.overlay} />
                                        <h4 className={styles.eventTitle}>{event.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                    </div>
                    
                    <div className={styles.ticketInformation}>
                        <div className={styles.infoHeader}>
                            <p className={styles.startingFrom}>starting from</p>
                            <p className={styles.price}>Free</p>
                            <h6> For UoK students</h6>
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <div className={styles.dtl_icon}>📅</div>
                            <div className={styles.dlt_text}>
                                <p className={styles.dtl_label}>Date</p>
                                <p className={styles.dtl_value}>{formData.event_date}</p>
                            </div>  
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <div className={styles.dtl_icon}>🕘</div>
                            <div className={styles.dlt_text}>
                                <p className={styles.dtl_label}>Time</p>    
                                <p className={styles.dtl_value}>{formData.event_time}</p>
                            </div>
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <div className={styles.dtl_icon}>📍</div>
                            <div className={styles.dlt_text}>
                                <p className={styles.dtl_label}>Location</p>
                                <p className={styles.dtl_value}>{formData.location}</p>
                            </div>
                        </div>
                        <div className={styles.spotsBar}>
                            <div className={styles.barTrack}>
                                <div className={styles.barFill} style={{ width: '74%' }}></div>
                            </div>
                            <div className={styles.spotsText}>
                                <p>178 registered</p>
                                <p>62 spots left</p>
                            </div>
                        </div>

                        <div className={styles.ticketType}>
                            <p className={styles.ticketTypeHeader}>Select Ticket type</p>
                            <div className={`${styles.ticketCard} ${selected === 'student' ? styles.selected : ''}`} onClick={() => setSelected('student')}>
                                <p className={styles.ticketTitle}>University of Kent students</p>
                                <p className={styles.ticketPrice}>£3</p>
                            </div>
                            <div className={`${styles.ticketCard} ${selected === 'member' ? styles.selected : ''}`} onClick={() => setSelected('member')}>
                                <p className={styles.ticketTitle}>Society Members</p>
                                <p className={styles.ticketPrice}>Free</p>
                            </div>
                            <button className={styles.register}>Register Now →</button>
                            <button className={styles.save}>Save event</button>
                        </div>
                        
                        <div className={styles.shareEvent}>
                            <p className={styles.shareLabel}>Share Event</p>
                            <button className={styles.shareButton} onClick={() => {
                                navigator.clipboard.writeText(window.location.href)
                                toast.success('Link Copied!', {style: {background: '#05345C', color: 'white'}})
                            }}>Copy Link</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EventDetails;