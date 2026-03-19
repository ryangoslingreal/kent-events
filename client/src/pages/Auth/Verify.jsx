import { useParams, useNavigate } from 'react-router-dom';
import { verify } from "../../api"
import toast from "react-hot-toast";
import styles from "./Verify.module.css"

function Verify() {
    const { token } = useParams();
    const navigate = useNavigate();

    const getUser = async() => {
        const data = await verify(token);
        if (data.error) {
            toast.error(data.message, {style: {background: '#ffffff', color: '#05345C'}})
        } else{
            toast.success(data.message, {style: {background: '#ffffff', color: '#05345C'}})
            setTimeout(() => navigate("/"), 800);
        }
        
    }
    return(
        <>
            <div className={styles.verify_root}>
                <div className={styles.verify_card}>
                    <h1>Verify your email</h1>
                    <p>Click below to confirm your email address and activate your account.</p>
                    <button className={styles.verify_button} onClick={() => getUser()}>Verify email address</button>
                    <div className={styles.verify_divider}></div>
                    <p className={styles.verify_footer_note}>This link is single-use and will expire after verification.</p>
                </div>
            </div>
           
        </>
    )
}

export default Verify;