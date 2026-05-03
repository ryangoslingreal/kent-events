import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api";

import toast from "react-hot-toast";
import styles from "./Auth.module.css";
import Header from "../../components/layout/Header";

const ACCOUNT_TYPES = {
    STUDENT: "student",
    SOCIETY: "society"
};

function Signup (){
    const [accountType, setAccountType] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!accountType) {
            toast.error("Please choose an account type.");
            return;
        }

        const result = await register({
            email,
            password,
            account_type: accountType
        });

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success("Verification code sent.");
        navigate("/verify", {
            state: { email }
        });
    }

    function showAccountTypeSelection() {
        return (
            <form className={styles.form}>
                <h1 className={styles.title}>Sign up</h1>
                <p className={styles.subtitle}>Register as a:</p>

                            
                <button
                    className={styles.button}
                    type="button"
                    onClick={() => setAccountType(ACCOUNT_TYPES.STUDENT)}
                >
                    Student
                </button>

                <button
                    className={styles.button}
                    type="button"
                    onClick={() => setAccountType(ACCOUNT_TYPES.SOCIETY)}
                >
                    Society
                </button>

                <p className={styles.changeAuth}>
                    Have an account?
                    <Link to="../login" className={styles.changeAuthButton}>
                        Login
                    </Link>
                </p>
            </form>
        );
    }

    function showRegistrationForm() {
        const accountTypeLabel = accountType === ACCOUNT_TYPES.STUDENT
            ? "student"
            : "society";

        return (
            <form className={styles.form} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Sign up</h1>
                <p className={styles.subtitle}>
                    Create your {accountTypeLabel} account
                </p>

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
                    autoComplete="new-password"
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

                <button
                    className={styles.backButton}
                    type="button"
                    onClick={() => setAccountType(null)}
                >
                    Back
                </button>

                <p className={styles.changeAuth}>
                    Have an account?
                    <Link to="../login" className={styles.changeAuthButton}>
                        Login
                    </Link>
                </p>
            </form>
        );
    }

    return (
        <div className={styles.headerPage}>
            <Header/>
            <div className={styles.page}>
                <div className={styles.card}>
                    {accountType
                        ? showRegistrationForm()
                        : showAccountTypeSelection()}
                </div>
            </div>
        </div>
    );
}

export default Signup;