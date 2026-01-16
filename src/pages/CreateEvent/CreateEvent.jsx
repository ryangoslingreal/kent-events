import { useState } from "react";
import Header from "../../components/layout/Header";
import styles from "./CreateEvent.module.css";
import searchicon from "../../assets/searchIcon.png";

function Field({ label, htmlFor, children }) {
    return (
        <div className={styles.fieldGroup}>
            <label htmlFor={htmlFor}>{label}</label>
            {children}
        </div>
    );
}

function CreateEvent() {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        date: "",
        time: "",
        location: "",
        tag: "",
        price: "",
        repeat: "never",
        contactInfo: false,
    });

    const handleInputChange = ({ target }) => {
        const { name, value, type, checked } = target;

        let nextValue = type === "checkbox" ? checked : value;

        if (name === "price") {
            nextValue = Math.max(0, Number(nextValue || 0));
        }

        setFormData(prev => ({
            ...prev,
            [name]: nextValue,
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        console.log("Form data:", formData);
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

                            <Field label="Title" htmlFor="title">
                                <input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
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

                            <Field label="Description" htmlFor="description">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </Field>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>When & Where</h3>

                            <div className={styles.dateTime}>
                                <Field label="Choose a date" htmlFor="date">
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                    />
                                </Field>

                                <Field label="Time" htmlFor="time">
                                    <input
                                        type="time"
                                        id="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                    />
                                </Field>
                            </div>

                            <Field label="Location" htmlFor="location">
                                <input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                />
                            </Field>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionHeader}>Tags & Pricing</h3>

                            <Field label="Choose tags" htmlFor="tag">
                                <div className={styles.searchBar}>
                                    <input
                                        id="tag"
                                        name="tag"
                                        value={formData.tag}
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

                            <Field label="Price" htmlFor="price">
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
                                    />
                                </div>
                            </Field>

                            <Field label="Repeat?" htmlFor="repeat">
                                <select
                                    id="repeat"
                                    name="repeat"
                                    value={formData.repeat}
                                    onChange={handleInputChange}
                                >
                                    <option value="never">Never</option>
                                    <option value="daily">Every day</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </Field>

                            <div className={styles.allowContactInfo}>
                                <label htmlFor="contactInfo">
                                    Have your contact information available?
                                </label>
                                <input
                                    type="checkbox"
                                    id="contactInfo"
                                    name="contactInfo"
                                    checked={formData.contactInfo}
                                    onChange={handleInputChange}
                                    style={{ width: "fit-content" }}
                                />
                            </div>
                        </section>

                        <div className={styles.formButton}>
                            <button type="button" className={styles.saveForm}>
                                Save
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