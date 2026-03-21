// ChooseEventPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserMadeEvents } from "../../api";

import Header from "../../components/layout/Header.jsx"
import styles from "./ChooseEvent.module.css";
import toast from "react-hot-toast";

function ChooseEvent() {    
    const [selectedId, setSelectedId] = useState(null);
    const [events, setEvents] = useState([]);
    const [archivedEvents, setArchivedEvents] = useState([]);
    const navigate = useNavigate();

    const editEvent = () => {
        navigate(`/events/edit/${selectedId}`);
    };

    useEffect(() => {
        async function getUsersEvents() {
            const data = await getUserMadeEvents();

            if (data.error) {
                toast.error(data.error);
                setTimeout(() => navigate("/"), 1000);
                return;
            }

            const today = new Date().toISOString().split("T")[0];
            let userEvents = [];
            let oldEvents = [];

            for (let i = 0; i < data.length; i++){
                const formattedDate = data[i].event_date.split("T")[0];
                let event = {
                    id: data[i].id,
                    name: data[i].title,
                    date: formattedDate,
                    dateCheck: data[i].event_date
                };

                if (today > formattedDate) {
                    oldEvents.push(event);
                } else{
                    userEvents.push(event);
                }
            }

            userEvents.reverse();
            oldEvents.reverse();
            setEvents(userEvents);
            setArchivedEvents(oldEvents);
        }

        getUsersEvents();
        
    }, [navigate]);

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

                    <details className={styles.event_list}>
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
                                </button>
                            ))}
                        </div>
                    </details>

                    <button className={styles.edit_button} disabled={!selectedId} onClick={editEvent}>
                        Edit selected event
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChooseEvent;