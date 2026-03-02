
import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogo.png";
import searchicon from "../../assets/searchIcon.png"

function Header() {


    return(
        <header className={styles.header}>
            <div className={styles.logoTitle}>
                <Link to="/" className={styles.homeLink}>
                    <img className={styles.logo} src={kentlogo}></img>
                </Link>
            </div>
            <div className={styles.searchBar}>
                <input className={styles.searchInput} placeholder="Find... new friends"></input>
                <img className={styles.searchIcon} src={searchicon}></img>
            </div>
            <nav className={styles.actions}>
                <div className={styles.eventDropdown}>
                    <button className={`${styles.action} ${styles.dropbtn}`}>
                        Events <span className={styles.chevron}>▾</span>
                    </button>
                    <div className={styles.eventDropdownContent}>
                        <Link to="/events/create" >Create Events</Link>
                        <a>My Tickets</a>
                        <Link to="/events/choose">Edit Events</Link>
                    </div>
                </div>

                <Link to="/login" className={styles.action}>Log In</Link>
                <Link to="/signup" className={styles.action}>Sign Up</Link>
            </nav>
        </header>
    )
}

export default Header;