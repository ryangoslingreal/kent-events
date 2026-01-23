// ChooseEventPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header.jsx"
import styles from "./ChooseEvent.module.css";


const events = [
{ id: 1, name: "Winter Makers Market", date: "Feb 7, 2026" },
{ id: 2, name: "Studio Open Night", date: "Feb 12, 2026" },
{ id: 3, name: "Product Launch Showcase", date: "Feb 24, 2026" },
{ id: 4, name: "Coffee & Code Meetup", date: "Mar 1, 2026" },
];





function ChooseEvent() {    
    const [selectedId, setSelectedId] = useState(null);
    const navigate = useNavigate();

    const editEvent = () => {
        navigate(`/edit/event/${selectedId}`)
    }

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
                        </button>
                    ))}
                </div>


                <button className={styles.edit_button} disabled={!selectedId} onClick={() => editEvent()}>
                    Edit selected event
                </button>
            </div>
        </div>
        </div>
    );
}

export default ChooseEvent;