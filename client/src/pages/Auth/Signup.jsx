import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api";

import toast from "react-hot-toast";
import styles from "./Login.module.css";
import Header from "../../components/layout/Header";

function Signup (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        const result = await register({ email, password });

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(result.message);
        navigate("/");
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
                            
                        <button className={styles.button} type="submit">
                            Sign up
                        </button>

                        <p className={styles.changeAuth}>
                            Have an account?
                            <Link to="../login" className={styles.changeAuthButton}>
                                Login
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;