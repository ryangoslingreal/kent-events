import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import searchicon from "../../assets/searchIcon.png";
import Header from "../../components/layout/Header.jsx";
import styles from "./EditEvent.module.css";
import toast from "react-hot-toast";

import { getEvent, deleteEvent, updateEvent } from "../../api";
import {
    Field,
    createInitialEventForm,
    applyEventInputChange,
    mapEventToEditForm,
    buildEventUpdatePayload,
} from "./shared/eventFormShared.jsx";

function EditEvent(){
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(createInitialEventForm());
    const [selectedFile, setSelectedFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);

    const baseHandleInputChange = applyEventInputChange(setFormData);

    const handleInputChange = (event) => {
        const selectedImage = baseHandleInputChange(event);

        if (event.target.name === "image") {
            setSelectedFile(selectedImage);
            setRemoveImage(false);
        }
    };

    const handleRemoveImage = () => {
        setRemoveImage(true);
        setSelectedFile(null);
    };

    const handleKeepCurrentImage = () => {
        setRemoveImage(false);
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        
        const payload = buildEventUpdatePayload(formData, selectedFile, removeImage);
        const result = await updateEvent(id, payload);

        if (result.error){
            toast.error(result.error);
            return;
        }

        const updatedEvent = result.event;

        // Refresh form
        if (updatedEvent && !updatedEvent.status) {
            setFormData(mapEventToEditForm(updatedEvent));
        } else {
            const refreshedEvent = await getEvent(id);

            if (!refreshedEvent.error) {
                setFormData(mapEventToEditForm(refreshedEvent));
            }
        }

        setSelectedFile(null);
        setRemoveImage(false);
        toast.success(result.message);
    };

    const handleDeleteEvent = async(e) => {
        const result = await deleteEvent(id);

        if (result.error) {
            toast.error(result.error);
            return;
        }
        
        toast.success(result.message);
        setTimeout(() => navigate("/"), 1000);
    };

    useEffect(() => {
        async function getEventData() {
            const data = await getEvent(id);

            if (data.error) {
                toast.error(data.error);
                return;
            }

            setFormData(mapEventToEditForm(data));
        }

        getEventData();
    }, [id]);

    return (
        <>
            <Header />
            <div className={styles.page}>
                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1 className={styles.title}>Edit Event</h1>
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
                                label="Select an image"
                                htmlFor="image"
                            >
                                <label htmlFor="image" className={styles.image}>
                                    {removeImage
                                        ? "Image will be removed"
                                        : selectedFile
                                            ? selectedFile.name
                                            : formData.image
                                                ? "Choose new image"
                                                : "Select Image"}
                                </label>
                                <div>
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg, image/png"
                                        name="image"
                                        onChange={handleInputChange}
                                        hidden // This is hidden due to me wanting to change the text next to the input image box
                                    />
                                </div>

                                {formData.image && !selectedFile && !removeImage && (
                                    <button
                                        type="button"
                                        className={styles.saveForm}
                                        onClick={handleRemoveImage}
                                    >
                                        Remove current image
                                    </button>
                                )}

                                {removeImage && (
                                    <button
                                        type="button"
                                        className={styles.saveForm}
                                        onClick={handleKeepCurrentImage}
                                    >
                                        Keep current image
                                    </button>
                                )}
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
                            <button type="button" className={styles.saveForm} onClick={handleDeleteEvent}>
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
    );
}

export default EditEvent;