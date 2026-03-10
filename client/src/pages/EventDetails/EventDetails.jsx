import styles from "./EventDetails.module.css";
import Header from "../../components/layout/Header"
import { useEffect, useState } from "react";

function EventDetails() {

    const [selected, setSelected] = useState(null);

    return(
        <>
            <Header /> 
            <div className={styles.page}>
                <div className={styles.eventHeader}>
                    <h2 className={styles.title}>Random, random</h2>
                </div>
                <div className={styles.informationWrapper}>
                    <div className={styles.centerInfo}>
                        <div className={styles.descriptionWrapper}>
                            <h3>About this event</h3>
                            <p>jsdkfnsdfnjksdfnndskfdsnksdjfnkjfnskfjdnfskdjfndkjsdfnkjfsnfksdjnfskfj sdf sdf sdf sd s fsdfsdfsfss fd sdf dfsdf sf sdfsfsfsdfsfsdfsfsf  sdf sdfsdfs    fsd fsdfsfsf   sdfsfsf
                                sfsdf 
                            </p>
                            <p>Hello dfgfdg</p>
                        </div>
                        <div className={styles.tags}>
                            <h3>Tags</h3>
                            <a>Food</a>
                            <a>Sports</a>
                            <a>Drinking</a>
                        </div>
                        <div className={styles.otherEvents}>
                            <h3>Other events you may like</h3>
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
                                <p className={styles.dtl_value}>Thursday 12 June 2025</p>
                            </div>  
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <div className={styles.dtl_icon}>🕘</div>
                            <div className={styles.dlt_text}>
                                <p className={styles.dtl_label}>Time</p>    
                                <p className={styles.dtl_value}>09:00 - 18:00</p>
                            </div>
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <div className={styles.dtl_icon}>📍</div>
                            <div className={styles.dlt_text}>
                                <p className={styles.dtl_label}>Location</p>
                                <p className={styles.dtl_value}>Sibson Building, University of Kent</p>
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
                            <button className={styles.shareButton}>Copy Link</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EventDetails;