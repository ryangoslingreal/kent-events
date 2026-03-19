import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./Login.module.css";
import Header from "../../components/layout/Header";


function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            switch (res.status) {
                case 200:
                    toast.success(data.message);
                    navigate("/")
                    break;

                case 401:
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
            <Header />
            <div className={styles.page}>
                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1 className={styles.title}>Log in</h1>
                        <p className={styles.subtitle}>Enter your kent credentials to continue</p>
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

                        <div className={styles.checkboxRow}>
                            <div className={styles.showPassword}>
                                <label>Show password</label>
                                <input
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    className={styles.checkbox}
                                />
                            </div>

                            <span className={styles.forgotPass}>forgot password?</span>
                        </div>

                        <button className={styles.button} type="submit">
                            Log in
                        </button>

                        <p className={styles.changeAuth}>Don't have an account? <Link to="../signup" className={styles.changeAuthButton}>Create One</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;