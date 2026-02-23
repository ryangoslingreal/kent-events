import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import Header from "../../components/layout/Header";

function Signup (){
    const [email, setEmail] = useState("");
    const [confirmation, setConfirmation] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {"Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            switch (res.status) {
                case 200:
                    window.alert(data.message);
                    // TODO: Handle 200.
                    break;

                    case 400:
                    window.alert(data.message);
                    // TODO: Handle 400.
                    break;

                    case 403:
                    window.alert(data.message);
                    // TODO: Handle 403.
                    break;
                    
                    case 500:
                    console.error("Server error:", data);
                    break;

                    default:
                    console.error("Unexpected response:", res.status);
            }
        } catch (err) {
        console.error("Network error:", err);
        }
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