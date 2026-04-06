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
    EVENT_TOAST_STYLE
} from "./shared/eventFormShared.jsx";

function CreateEvent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(createInitialEventForm());

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
            toast.error(result.error, { style: EVENT_TOAST_STYLE });
            return;
        }

        toast.success(result.message, { style: EVENT_TOAST_STYLE });
    };

    const handleReset = () => {
        setFormData(createInitialEventForm());
        toast.success("Event form reset", { style: EVENT_TOAST_STYLE });
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
                                    label={<>Time <span className={styles.required}>*</span></>}
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
                            <h3 className={styles.sectionHeader}>Tags & Pricing</h3>

                            <Field
                                styles={styles}
                                label="Choose tags"
                                htmlFor="tags"
                            >
                                <div className={styles.searchBar}>
                                    <input
                                        id="tags"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        aria-label="Search tags"
                                    />
                                    <img className={styles.searchIcon} src={searchicon} alt="Search" />
                                </div>
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Price <span className={styles.required}>*</span></>}
                                htmlFor="price"
                            >
                                <div className={styles.price}>
                                    £
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </Field>

                            <Field
                                styles={styles}
                                label={<>Repeat? <span className={styles.required}>*</span></>}
                                htmlFor="repeat_event"
                            >
                                <select
                                    id="repeat_event"
                                    name="repeat_event"
                                    value={formData.repeat_event}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="never">Never</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </Field>

                            <div className={styles.allowContactInfo}>
                                <label htmlFor="available_contact">
                                    Have your contact information available?
                                </label>
                                <input
                                    type="checkbox"
                                    id="available_contact"
                                    name="available_contact"
                                    checked={formData.available_contact}
                                    onChange={handleInputChange}
                                    style={{ width: "fit-content" }}
                                />
                            </div>
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