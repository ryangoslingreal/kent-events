import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogo3.png";
import searchicon from "../../assets/searchIcon.png"

function Header() {


    return(
        <header className={styles.header}>
            <div className={styles.logoTitle}>
                <img className={styles.logo} src={kentlogo}></img>
                <h3 className={styles.title}>Student Events</h3>
            </div>
            <div className={styles.searchBar}>
                <input className={styles.searchInput} placeholder="Search events..."></input>
                <img className={styles.searchIcon} src={searchicon}></img>
            </div>
            <nav className={styles.actions}>
                <a className={styles.action}>My Tickets</a>
                <a className={styles.action}>Create Events</a>
                <a className={styles.action}>Log In</a>
                <a className={styles.action}>Sign Up</a>
            </nav>
        </header>
    )
}

export default Header;