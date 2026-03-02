import { useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import styles from "./Login.module.css";
import Header from "../../components/layout/Header";

function Signup (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                    toast.success(data.message);
                    break;

                case 400:
                    toast.error(data.message)
                    break;

                case 403:
                    toast.error(data.message)
                    break;
                
                case 500:
                    console.error("Server error:", data);
                    toast.error(data.message)
                break;

                default:
                    console.error("Unexpected response:", res.status);
                    toast.error("Unexpected error")
            }
        } catch (err) {
        console.error("Network error:", err);
        }
    }

    return (
    <div className={styles.header_page}>
    <Toaster 
        position="top-center"
        toastOptions={{
            style: {
                fontFamily: "Overpass, Helvetica, Arial, sans-serif",
            },
        }}
    />
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
            <input
                id="password"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            <div className={styles.showPassword}>
                <label>Show password</label>
                <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className={styles.checkbox}
                />
            </div>
            <p className={styles.confMessage}>{confirmation}</p>
                
            <button className={styles.button} type="submit">
            Sign up
            </button>

            <p className={styles.changeAuth}>Have an account? <Link to="../login" className={styles.changeAuthButton}>Login</Link></p>
        </form>
        </div>
    </div>
    </div>
    );
}

export default Signup;