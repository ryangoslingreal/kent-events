import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Login/Login.module.css";
import Header from "../../components/layout/Header";

function Signup (){
    const [email, setEmail] = useState("");
    const [confirmation, setConfirmation] = useState("");

    function handleSubmit(e) {
    e.preventDefault();

        // TODO: call the API here
        setConfirmation("An confirmation email has been sent too your email address")
        console.log("Login:", { email, password });
    }

    return (
    <div className={styles.header_page}>
    <Header/>
    <div className={styles.page}>
        <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
            <h1 className={styles.title}>Sign up</h1>
            <p className={styles.subtitle}>Enter your kent email to continue</p>
            <input
                id="email"
                className={styles.input}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <p className={styles.confMessage}>{confirmation}</p>
                
            <button className={styles.button} type="submit">
            Log in
            </button>

            <p className={styles.changeAuth}>Have an account? <Link to="../login" className={styles.changeAuthButton}>Login</Link></p>
        </form>
        </div>
    </div>
    </div>
    );
}

export default Signup;