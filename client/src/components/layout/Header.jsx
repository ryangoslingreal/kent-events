
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styles from "./Header.module.css";
import kentlogo from "../../assets/kentlogoblue.png";
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
            try{
                const data = await getMe()
                if (data.message == "Authenticated."){
                    setSignedIn(true)
                    setInitial(data.user.email[0].toUpperCase())
                    setUserEmail(data.user.email)
                }
            } catch(error){
            
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