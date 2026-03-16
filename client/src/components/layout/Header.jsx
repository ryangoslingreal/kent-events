
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogo3.png";
import searchicon from "../../assets/searchIcon.png"
import logoutImg from "../../assets/logout.png"
import createImg from "../../assets/create.png"
import editImg from "../../assets/edit2.png"
import ticketImg from "../../assets/ticket.png"
import { getMe, logout } from "../../api"


function Header() {
    const [ signedIn, setSignedIn ] = useState(false)
    const [ initial, setInitial ] = useState("")
    const [ userEmail, setUserEmail ] = useState("")
    
    const navigate = useNavigate();

    useEffect(() => {
        const getUser = async() => {
            const data = await getMe()
            console.log(data)
            if (data.message == "Authenticated."){
                setSignedIn(true)
                setInitial(data.user.email[0].toUpperCase())
                setUserEmail(data.user.email)
            }
        }
        getUser();
    }, [])

    const logoutUser = async() => {
        const res = await logout()
        setSignedIn(false);
        navigate("/")
        toast.success(res.message, {style: {background: '#05345C', color: '#ffffff'}})
    }

    return(
        <>
        {/* <Toaster 
            position="bottom-right"
            toastOptions={{
                style: {
                    fontFamily: "Overpass, Helvetica, Arial, sans-serif",
                },
            }}
        /> */}
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
                            <Link to="/tickets"><img className={styles.dropdownIcon} src={ticketImg}></img>My Tickets</Link>
                            <div className={styles.dropdownDivider} />
                            <Link to="/events/create"><img className={styles.dropdownIcon} src={createImg}></img>Create Events</Link>
                            <Link to="/events/choose"><img className={styles.dropdownIcon} src={editImg}></img>Edit Events</Link>
                            <div className={styles.dropdownDivider} />
                            <button onClick={() => logoutUser()} className={styles.dropdownLogout}><img className={styles.dropdownIcon} src={logoutImg}></img>Log Out</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className={styles.action}>Log In</Link>
                        <Link to="/signup" className={styles.action}>Sign Up</Link>
                    </>
                )}
            </nav>
        </header>
        </>
    )
}

export default Header;