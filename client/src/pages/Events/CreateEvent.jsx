import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header";
import styles from "./CreateEvent.module.css";
import searchicon from "../../assets/searchIcon.png";
import toast from "react-hot-toast";

import { createEvent, getMe } from "../../api";
import {
    Field,
    createInitialEventForm,
    applyEventInputChange,
} from "./shared/eventFormShared.jsx";

const initialForm = {
    title: "",
    subtitle: "",
    description: "",
    image: null,
    image_mime: null,
    event_date: "",
    event_time: "",
    end_event_time: "",
    location: "",
    tags: [],
    ticket_url: "",
    available_contact: ""
}

function CreateEvent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(createInitialEventForm());
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        async function checkUserAuthentication() {
            const authenticated = await getMe();
            
            if (authenticated.error){
                toast.error("Please sign in to use this feature")
                setTimeout(() => navigate("/"), 1000);
            }
        };
        checkUserAuthentication()
    }, [navigate])

    const handleInputChange = applyEventInputChange(setFormData);

    const handleSubmit = async(e) => {
        e.preventDefault();

        const result = await createEvent(formData);

        if (result.error){
            toast.error(result.error);
            return;
        }

        toast.success(result.message);
    };

    const handleReset = () => {
        setFormData(createInitialEventForm());
        toast.success("Event form reset");
    };

    const handleRemoveTag = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== indexToRemove)
        }));
    
    };
    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !formData.tags.includes(newTag)) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
                setTagInput("");
            }
        }
    };


    return (
        <>
            <Header />
            <div className={styles.page}>
                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1 className={styles.title}>Create Event</h1>
                        <h2 className={styles.subtitle}>Fill in the details below</h2>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>Details</h3>

                            <Field
                                styles={styles}
                                label={<>Title <span className={styles.required}>*</span></>}
                                htmlFor="title"
                            >
                                <input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Field>

                            <Field
                                styles={styles}
                                label="Subtitle"
                                htmlFor="subtitle"
                            >
                                <input
                                    id="subtitle"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                />
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Description <span className={styles.required}>*</span></>}
                                htmlFor="description"
                            >
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Select an image</>}
                                htmlFor="image"
                            >
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    name="image"
                                    onChange={handleInputChange} 
                                />
                            </Field>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>When & Where</h3>

                            <div className={styles.dateTime}>
                                <Field
                                    styles={styles}
                                    label={<>Choose a date <span className={styles.required}>*</span></>}
                                    htmlFor="event_date"
                                >
                                    <input
                                        type="date"
                                        id="event_date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Field>

                                <Field
                                    styles={styles}
                                    label={<>Start Time <span className={styles.required}>*</span></>}
                                    htmlFor="event_time"
                                >
                                    <input
                                        type="time"
                                        id="event_time"
                                        name="event_time"
                                        value={formData.event_time}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Field>

                                <Field
                                    styles={styles}
                                    label={<>End Time </>}
                                    htmlFor="end_event_time"    
                                >
                                    <input
                                        type="time"
                                        id="end_event_time"
                                        name="end_event_time"
                                        value={formData.end_event_time}
                                        onChange={handleInputChange}
                                    />
                                </Field>
                            </div>

                            <Field
                                styles={styles}
                                label={<>Location <span className={styles.required}>*</span></>}
                                htmlFor="location"
                            >
                                <input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Field>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>Tags & Ticketing</h3>

                            <Field styles={styles} label="Choose tags" htmlFor="tags">
                                <div className={styles.tagInputWrapper}>
                                    <div className={styles.tagList}>
                                        <div className={styles.searchBar}>
                                            <input
                                                id="tags"
                                                name="tagInput"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                placeholder="Add a tag..."
                                                aria-label="Add tag"
                                            />
                                            <img className={styles.searchIcon} src={searchicon} alt="Search" />
                                        </div>
                                        {formData.tags.map((tag, index) => (
                                            <span key={index} className={styles.tagPill}>
                                                {tag}
                                                <button
                                                    type="button"
                                                    className={styles.tagRemove}
                                                    onClick={() => handleRemoveTag(index)}
                                                    aria-label={`Remove tag ${tag}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Ticket url</>}
                                htmlFor="ticket_url"
                            >
                                <div className={styles.ticket_url}>
                                    <input
                                        id="ticket_url"
                                        name="ticket_url"
                                        value={formData.ticket_url}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Who to Contact</>}
                                htmlFor="available_contact"
                            >
                                <input
                                    id="available_contact"
                                    name="available_contact"
                                    value={formData.available_contact}
                                    onChange={handleInputChange}
                                    placeholder="name@example.com"
                                />
                            </Field>
                        </section>

                        <div className={styles.formButton}>
                            <button type="button" className={styles.saveForm} onClick={handleReset}>
                                Delete
                            </button>
                            <button type="submit" className={styles.createForm}>
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateEvent; 