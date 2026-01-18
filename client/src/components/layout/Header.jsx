
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogo3.png";
import searchicon from "../../assets/searchIcon.png"

function Header() {


    return(
        <header className={styles.header}>
            <div className={styles.logoTitle}>
                <img className={styles.logo} src={kentlogo}></img>
                <Link to="/" className={styles.homeLink}>
                    <h3 className={styles.title}>Student Events</h3>
                </Link>
            </div>
            <div className={styles.searchBar}>
                <input className={styles.searchInput} placeholder="Search events..."></input>
                <img className={styles.searchIcon} src={searchicon}></img>
            </div>
            <nav className={styles.actions}>
                <div className={styles.eventDropdown}>
                    <button className={`${styles.action} ${styles.dropbtn}`}>Events ˅</button>
                    <div className={styles.eventDropdownContent}>
                        <Link to="/events/create" >Create Events</Link>
                        <a>My Tickets</a>
                        <a>Edit Events</a>
                    </div>
                </div>

                <Link to="/login" className={styles.action}>Log In</Link>
                <Link to="/signup" className={styles.action}>Sign Up</Link>
            </nav>
        </header>
    )
}

export default Header;