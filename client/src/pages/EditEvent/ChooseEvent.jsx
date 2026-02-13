// ChooseEventPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header.jsx"
import styles from "./ChooseEvent.module.css";
import { getUserMadeEvents } from "../../api";

function ChooseEvent() {    
    const [selectedId, setSelectedId] = useState(null);
    const [events, setEvents] = useState([]);
    const [archivedEvents, setArchivedEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const navigate = useNavigate();

    const editEvent = () => {
        navigate(`/events/edit/${selectedId}`)
    }

    useEffect(() => {
        const getUsersEvents = async() => {
            
            const data = await getUserMadeEvents();

            const today = new Date().toISOString().split("T")[0];
            let userEvents = []
            let oldEvents = []
            if (data.error) {
                alert(data.error)
            }  else{
                for (let i=0; i<data.length; i++){
                    const formattedDate = data[i].event_date.split("T")[0];
                    console.log(today + "  " + formattedDate);
                    if (today > formattedDate){
                        let event = { id: data[i].id, name: data[i].title, date: formattedDate, dateCheck: data[i].event_date }
                        oldEvents.push(event);
                    } else{
                        let event = { id: data[i].id, name: data[i].title, date: formattedDate, dateCheck: data[i].event_date }
                        userEvents.push(event);
                    }
                    
                }
                userEvents.reverse();
                oldEvents.reverse();
                setEvents(userEvents)
                setArchivedEvents(oldEvents);
            }
        
        }
        getUsersEvents()

        const getCurrentDate = () => {
            // console.log(new Date());
            
            setCurrentDate(new Date());
        }
        getCurrentDate()

        
        // console.log(events[0].dateCheck, currentDate, events[0].dateCheck < currentDate);
        
    }, [])
    // console.log(currentDate);
    return (
        <div className={styles.page_header}>
        <Header />
        <div className={styles.page}>
            <div className={styles.container}>
                <h1 className={styles.title}>Choose what event you want to edit</h1>
                <p className={styles.subtitle}>Select an event below to continue.</p>

                <div className={styles.event_list}>
                    {events.map((event) => (
                        <button
                            key={event.id}
                            className={`${styles.event_item} ${selectedId === event.id ? styles.selected : ""}`}
                            onClick={() => setSelectedId(event.id)}
                        >
                            <div className={styles.event_name}>{event.name}</div>
                            <div className={styles.event_date}>{event.date}</div>
                            {/* <div>{event.dateCheck}</div>
                            <div>{currentDate}</div> */}
                        </button>
                    ))}
                </div>
                 <details className={styles.event_list}>    {/* Creates dropdown */}
                    <summary className={styles.archiveToggle}>
                        Archived ({archivedEvents.length})
                    </summary>
                    <div className={styles.event_list}>
                        {archivedEvents.map((event) => (
                            <button
                                key={event.id}
                                className={`${styles.event_item} ${selectedId === event.id ? styles.selected : ""}`}
                                onClick={() => setSelectedId(event.id)}
                            >
                                <div className={styles.event_name}>{event.name}</div>
                                <div className={styles.event_date}>{event.date}</div>
                                {/* <div>{event.dateCheck}</div>
                                <div>{currentDate}</div> */}
                            </button>
                        ))}
                    </div>
                </details>
               


                <button className={styles.edit_button} disabled={!selectedId} onClick={() => editEvent()}>
                    Edit selected event
                </button>
            </div>
        </div>
        </div>
    );
}

export default ChooseEvent;