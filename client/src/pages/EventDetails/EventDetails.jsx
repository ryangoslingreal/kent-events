import styles from "./EventDetails.module.css";
import Header from "../../components/layout/Header"


function EventDetails() {

    return(
        <>
            <Header /> 
            <div className={styles.page}>
                <div className={styles.eventHeader}>
                    <h2 className={styles.title}>Random, random</h2>
                </div>
                <div className={styles.informationWrapper}>
                    <div className={styles.descriptionWrapper}>
                        <h3>About this event</h3>
                        <p>jsdkfnsdfnjksdfnndskfdsnksdjfnkjfnskfjdnfskdjfndkjsdfnkjfsnfksdjnfskfj</p>
                    </div>
                    <div className={styles.ticketInformation}>
                        <p>starting from</p>
                        <p className={styles.price}>Free</p>
                        <h6>For UoK students</h6>
                        <div className={styles.dateTimeLocation}>
                            <img></img>
                            <p>Date</p>
                            <h5>Thursday 12 June 2025</h5>
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <img></img>
                            <p>Time</p>
                            <h5>09:00 - 18:00</h5>
                        </div>
                        <div className={styles.dateTimeLocation}>
                            <img></img>
                            <p>Location</p>
                            <h5>sibson Building, University of Kent</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EventDetails;