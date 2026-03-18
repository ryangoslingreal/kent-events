import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../../components/layout/Header";
import styles from "./CreateEvent.module.css";
import searchicon from "../../assets/searchIcon.png";
import { createEvent, getMe } from "../../api";
import toast from "react-hot-toast";

function Field({ label, htmlFor, children }) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={htmlFor}>{label}</label>
            {children}
        </div>
    );
}

function CreateEvent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        image: null,
        image_mime: null,
        event_date: "",
        event_time: "",
        location: "",
        tags: [],
        price: "",
        repeat_event: "never",
        available_contact: false,
    });

    useEffect(() => {
        const checkUserAuthentication = async() => {
            const authenticated = await getMe();
            console.log(authenticated)
            if (authenticated.message === "Not authenticated."){
                toast.error("Please sign in to use this feature")
                setTimeout(() => navigate("/"), 1000);
            }
           
        };
        checkUserAuthentication()

    }, [])

    const handleInputChange = ({ target }) => {
        const { name, value, type, checked } = target;

        let nextValue = type === "checkbox" ? checked : value;

        if (name === "price") {
            nextValue = Math.max(0, Number(nextValue || 0));
        }

        if (name === "image"){
            console.log(target.files[0].type)
            
            setFormData(prev => ({
                ...prev,
                image: target.files[0],
                image_mime: target.files[0].type
            }));

            return;
        }
        
        if (name === "tags") {
            setFormData(prev => ({
                ...prev,
                // tags: [...prev.tags, value],
                tags: value
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: nextValue,  
        }));
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            const result = await createEvent(updatedForm);
            
            if (result.error){
                alert(result.error)
            } else{
                alert(result.message)
            }
            console.log("Form data:", formData);
        } catch(error){
            console.error(error)
        }
    };

    const handleReset = () => {
        const initialForm = {
            title: "",
            subtitle: "",
            description: "",
            image: null,
            image_mime: null,
            event_date: "",
            event_time: "",
            location: "",
            tags: [],
            price: "",
            repeat_event: "never",
            available_contact: false,
        }
        setFormData(initialForm);

        alert("Page reset")
    }

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

                            <Field label={<>Title <span className={styles.required}>*</span></>} htmlFor="title">
                                <input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Field>

                            <Field label="Subtitle" htmlFor="subtitle">
                                <input
                                    id="subtitle"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleInputChange}
                                />
                            </Field>

                            <Field label={<>Description <span className={styles.required}>*</span></>} htmlFor="description">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Field>

                            <Field label={<>Select an image</>} htmlFor="image">
                                <input type="file" accept="image/jpeg, image/png" name="image" onChange={handleInputChange} />
                            </Field>

                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>When & Where</h3>

                            <div className={styles.dateTime}>
                                <Field label={<>Choose a date <span className={styles.required}>*</span></>} htmlFor="event_date">
                                    <input
                                        type="date"
                                        id="event_date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Field>

                                <Field label={<>Time <span className={styles.required}>*</span></>} htmlFor="event_time">
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

                            <Field label={<>Location <span className={styles.required}>*</span></>} htmlFor="location">
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

                            <Field label="Choose tags" htmlFor="tags">
                                <div className={styles.searchBar}>
                                    <input
                                        id="tags"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        aria-label="Search tags"
                                    />
                                    <img
                                        className={styles.searchIcon}
                                        src={searchicon}
                                        alt="Search"
                                    />
                                </div>
                            </Field>

                            <Field label={<>Price <span className={styles.required}>*</span></>} htmlFor="price">
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

                            <Field label={<>Repeat? <span className={styles.required}>*</span></>} htmlFor="repeat_event">
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
                            <button type="button" className={styles.saveForm} onClick={() => handleReset()}>
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