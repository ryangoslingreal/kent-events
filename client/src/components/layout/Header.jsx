
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMe, logout } from "../../api"

import toast from "react-hot-toast";
import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogoblue.png";
import searchicon from "../../assets/searchIcon.png"
import logoutImg from "../../assets/logout.png"
import createImg from "../../assets/create.png"
import editImg from "../../assets/edit2.png"
import ticketImg from "../../assets/ticket.png"

function Header() {
    const [ signedIn, setSignedIn ] = useState(false);
    const [ initial, setInitial ] = useState("");
    const [ userEmail, setUserEmail ] = useState("");
    
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const data = await getMe();

            if (data.error || !data.user?.email) {
                setSignedIn(false);
                setInitial("");
                setUserEmail("");
                return;
            }

            setSignedIn(true);
            setInitial(data.user.email[0].toUpperCase());
            setUserEmail(data.user.email);
        }

        loadUser();
    }, []);

    const logoutUser = async() => {
        const result = await logout();

        if (result.error) {
            toast.error(result.error, {style: {background: '#05345C', color: '#ffffff'}})
            return;
        }

        setSignedIn(false);
        setInitial("");
        setUserEmail("");
        navigate("/")
        toast.success(result.message, {style: {background: '#05345C', color: '#ffffff'}})
    }

    return (
        <>
            <header className={styles.header}>
                <div className={styles.logoTitle}>
                    <Link to="/" className={styles.homeLink}>
                        <img className={styles.logo} src={kentlogo} alt="University of Kent"></img>
                    </Link>
                </div>
                <div className={styles.searchBar}>
                    <input className={styles.searchInput} placeholder="Find... new friends"></input>
                    <img className={styles.searchIcon} src={searchicon} alt="Search"></img>
                </div>
                <nav className={styles.actions}>
                    {signedIn ? (
                        <div className={styles.eventDropdown}>
                            <div className={styles.userAvatar}>
                                <span>{initial}</span>
                            </div>
                            <div className={styles.eventDropdownContent}>
                                <div className={styles.dropdownHeader}>
                                    <div className={styles.dropdownAvatar}>{initial}</div>
                                    <div>
                                        <p className={styles.dropdownEmail}>{userEmail}</p>
                                    </div>
                                </div>
                                <a>View Profile</a>
                                <a>Settings</a>
                                <div className={styles.dropdownDivider} />
                                <Link to="/tickets">
                                    <img className={styles.dropdownIcon} src={ticketImg} alt="" />
                                    My Tickets
                                </Link>
                                <div className={styles.dropdownDivider} />
                                <Link to="/events/create">
                                    <img className={styles.dropdownIcon} src={createImg} alt="" />
                                    Create Events
                                </Link>
                                <Link to="/events/choose">
                                    <img className={styles.dropdownIcon} src={editImg} alt="" />
                                    Edit Events
                                </Link>
                                <div className={styles.dropdownDivider} />
                                <button onClick={logoutUser} className={styles.dropdownLogout}>
                                    <img className={styles.dropdownIcon} src={logoutImg} alt="" />
                                    Log Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={styles.action}>
                                Log In
                            </Link>
                            <Link to="/signup" className={styles.action}>
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </header>
        </>
    );
}

export default Header;