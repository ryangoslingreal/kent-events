import Header from "../../components/layout/Header";
import styles from "./CreateEvent.module.css";
import searchicon from "../../assets/searchIcon.png"

function CreateEvent() {


    function handleSubmit(e) {
        e.preventDefault();

    // TODO: call the API here

    }

    return(
        <>
            <Header />
            <div className={styles.page}>
                <div className={styles.card}>  
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1 className={styles.title}>Create Event</h1>
                        <h2 className={styles.subtitle}>Fill in the details below</h2>

                        <div className={styles.details}>
                            <h3 className={styles.sectionHeader}>Details</h3>
                            <div>
                                <label htmlFor="formTitle">Title</label>
                                <input id="formTitle" className={styles.sub_title}></input>
                            </div>

                            <div>
                                <label htmlFor="formSubtitle">Subtitle</label>
                                <input id="formSubtitle" className={styles.sub_title}></input>
                            </div>

                            <div>
                                <label htmlFor="description">Description</label>
                                <textarea className={styles.description} id="description" cols={20} rows={5}></textarea>
                            </div>
                        </div>

                        <div className={styles.whenWhere}>
                            <h3 className={styles.sectionHeader}>When & Where</h3>
                            <div className={styles.dateTime}>
                                <div className={styles.field}>
                                    <label htmlFor="date">Choose a date</label>
                                    <input id="date" type="date"></input>
                                </div>

                                <div className={styles.field}>
                                    <label htmlFor="time">Time</label>
                                    <input id="time" type="time"></input>
                                </div>  
                            </div>

                            <div>
                                <label htmlFor="location">Location</label>
                                <input className={styles.location} id="location"></input>
                            </div>
                        </div>

                        <div className={styles.tagsPricing}>
                            <h3 className={styles.sectionHeader}>Tags & Pricing</h3>
                            <div className={styles.tags}>
                                <label htmlFor="tag">Choose tags</label>
                                <div className={styles.searchBar}>
                                    <input className={styles.searchInput} id="tag"></input>
                                    <img className={styles.searchIcon} src={searchicon}></img>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="price">Price</label>
                                <span className={styles.price}>£<input id="price" name="price" type="number"></input></span>
                            </div>
                            
                            <div>
                                <label htmlFor="repeat">Repeat?</label>
                                <select className={styles.repeat} id="repeat">
                                    <option>Never</option>
                                    <option>Everyday</option>
                                    <option>1 week</option>
                                </select>
                            </div>

                            <div className={styles.allowContactInfo}>
                                <label htmlFor="contactInfo">Have your contact information available?</label> 
                                <input type="checkbox" id="contactInfo"></input>
                            </div>
                        </div>

                        <div className={styles.formButton}>
                            <button className={styles.saveForm}>Save</button>
                            <button type="submit" className={styles.createForm}>Create Event</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default CreateEvent;