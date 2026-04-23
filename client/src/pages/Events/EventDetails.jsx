import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import styles from "./EventDetails.module.css";
import Header from "../../components/layout/Header"
import toast from "react-hot-toast";

import { getEvent, getAllEvents, getHeaderEventImageUrl, getPrimaryEventImageUrl } from "../../api";
import { mapEventToDetails, mapEventToRelatedCard } from "./shared/eventMappers.js";
import { EVENT_TOAST_STYLE } from "./shared/eventFormShared.jsx";

function EventDetails() {
    const [otherEvents, setOtherEvents] = useState([])
    const [selected, setSelected] = useState(null);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        async function getEventData() {
            const eventData = await getEvent(id);

            if (eventData.error) {
                setFormData({});
                return;
            }

            setFormData({
                ...mapEventToDetails(eventData),
                imageUrl: getPrimaryEventImageUrl(eventData),
                backgroundImageUrl: getHeaderEventImageUrl(eventData)
            });
        }

        async function getOtherEvents() {
            const data = await getAllEvents(5, 0);  //5 events offset of 0

            if (data.error) {
                setOtherEvents([]);
                return;
            }

            const events = data
                .filter((event) => String(event.id) !== String(id))
                .slice(0, 5)
                .map((event) => ({
                    ...mapEventToRelatedCard(event),
                    imageUrl: getPrimaryEventImageUrl(event)
                }));

            setOtherEvents(events);
        }

        getEventData();
        getOtherEvents();
    }, [id]);

    const eventDetail = (eventId) => {
        navigate(`/events/detail/${eventId}`);
    }

    return (
        <>
            <Header /> 
            <div className={styles.page}>
                <div className={styles.eventHeader}>
                    {formData.backgroundImageUrl || formData.imageUrl ? (
                        <img
                            className={styles.eventHeaderImg}
                            src={formData.backgroundImageUrl || formData.imageUrl}
                            alt={formData.title}
                        />
                    ) : null}
                    <div className={styles.eventHeaderOverlay} />
                    <div className={styles.eventHeaderContent}>
                        <h2 className={styles.title}>{formData.title}</h2>
                        <p className={styles.eventOrganiser}>
                            Organised by <span>{formData.source === 'ksu' ? "KSU" : "individual"}</span> · University of Kent
                        </p>
                    </div>
                </div>
                <div className={styles.informationWrapper}>
                    <div className={styles.centerInfo}>
                        <div className={styles.descriptionWrapper}>
                            <h3>About this event</h3>
                            {formData.source === 'ksu' || formData.source === 'kentUni' ? (
                                <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                            ) : (
                                <p>{formData.description}</p>
                            )}
                        </div>
                        <div className={styles.tags}>
                            <h3>Tags</h3>
                            {(formData.tags ?? []).map((tag) => (
                                <a>{tag}</a>
                            ))}
                        </div>
                        {formData.available_contact ? (
                            <div className={styles.contact}>
                                <h3>Who to contact</h3>
                                <p>example@email.co.uk</p>
                            </div>
                        ) : null}
                        <div className={styles.otherEvents}>
                            <h3>Other events you may like</h3>
                            <div className={styles.otherEventsScroller}>
                                {otherEvents.map((event) => (
                                    <div key={event.id} className={styles.eventCard} onClick={() => eventDetail(event.id)}>
                                        {event.imageUrl && (
                                            <img
                                                className={styles.eventImage}
                                                src={event.imageUrl}
                                                alt={event.title}
                                            />
                                        )}
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
                        {formData.ticket_url ? (
                            <>
                            <div className={styles.spotsBar}>
                                <div className={styles.barTrack}>
                                    <div className={styles.barFill} style={{ width: "74%" }}></div>
                                </div>
                                <div className={styles.spotsText}>
                                    <p>178 registered</p>
                                    <p>62 spots left</p>
                                </div>
                            </div>

                            <div className={styles.ticketType}>
                                <p className={styles.ticketTypeHeader}>Select Ticket Type</p>
                                <div
                                    className={`${styles.ticketCard} ${selected === "student" ? styles.selected : ""}`}
                                    onClick={() => setSelected("student")}
                                >
                                    <p className={styles.ticketTitle}>University of Kent students</p>
                                    <p className={styles.ticketPrice}>£3</p>
                                </div>
                                <div
                                    className={`${styles.ticketCard} ${selected === "member" ? styles.selected : ""}`}
                                    onClick={() => setSelected("member")}
                                >
                                    <p className={styles.ticketTitle}>Society Members</p>
                                    <p className={styles.ticketPrice}>Free</p>
                                </div>
                                <button className={styles.register}>Register Now →</button>
                                <button className={styles.save}>Save event</button>
                            </div>
                            </>
                        ) : (
                            <></>
                        )}
                        
                        <div className={styles.shareEvent}>
                            <p className={styles.shareLabel}>Share Event</p>
                            <button
                                className={styles.shareButton}
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Link Copied!", { style: EVENT_TOAST_STYLE });
                                }}
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EventDetails;