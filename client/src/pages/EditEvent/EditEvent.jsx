import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { getEvent, deleteEvent, updateEvent } from "../../api";

import searchicon from "../../assets/searchIcon.png";
import Header from "../../components/layout/Header.jsx";
import styles from "./EditEvent.module.css";


function Field({ label, htmlFor, children }) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={htmlFor}>{label}</label>
            {children}
        </div>
    );
}

function EditEvent(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const [selectedFile, setSelectedFile] = useState();


    const handleInputChange = ({ target }) => {
        const { name, value, type, checked } = target;
        let nextValue = type === "checkbox" ? checked : value;

        if (name === "price") {
            nextValue = Math.max(0, Number(nextValue || 0));
        }

        if (name === "image"){
            setFormData(prev => ({
                ...prev,
                image: target.files[0]
            }));

            setSelectedFile(target.files[0] ?? null)
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
        // const result = await createEvent(formData.title, formData.subtitle, formData.description, formData.date, formData.time, formData.location, formData.tag, formData.price, formData.repeat, formData.contactInfo)
        const payload = {...formData};
        
        if (selectedFile) {
            payload.image = selectedFile;
        } else {
            delete payload.image;
            delete payload.image_mime;
        }
        
        const result = await updateEvent(id, payload);

        if (result.error){
            alert(result.error)
        } else{
            alert(result.message)
        }
        console.log("Form data:", formData);
    };

    const handleDeleteEvent = async(e) => {
        const result = await deleteEvent(id);

        if (result.error){
            alert(result.error);
        } else {
            alert("event deleted")
            navigate("/");
        }
    }



    //grabbing event data
    useEffect(() => {
        const getEventData = async() => {
            
            const eventData = await getEvent(id);
            // let eventData = data[0];

            //changing event date, time and contact info to conform with the HTML format
            eventData.event_time = eventData.event_time.toString().slice(0, 5);
            eventData.event_date = eventData.event_date.slice(0, 10);
            if (eventData.available_contact == 1){
                eventData.available_contact = true
            }  else {
                eventData.available_contact = false
            }

            setFormData(eventData);
            if (eventData.error) {
                alert(data.error)
            }  else{
                console.log(eventData);
            }
        
        }
        getEventData()
        
    }, [])

    return(
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

                            <Field label={<>Select an image</>}>
                                <label htmlFor="image" className={styles.image} value={formData.image}>
                                    {selectedFile ? selectedFile.name : formData.image ? "Choose new image" : "Select Image"}
                                </label>
                                {/* This is hidden due to me wanting to change the text next to the input image box ^  */}
                                <div>
                                    <input id="image" type="file" accept="image/jpeg, image/png" name="image" onChange={handleInputChange} hidden/>
                                </div>
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
                                    <option value="daily">Every day</option>
                                    <option value="weekly">Weekly</option>
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
                            <button type="button" className={styles.saveForm} onClick={() => handleDeleteEvent()}>
                                Delete Event
                            </button>
                            <button type="submit" className={styles.createForm}>
                                Update Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default EditEvent;