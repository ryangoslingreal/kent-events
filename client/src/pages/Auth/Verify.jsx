import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verify, requestVerification } from "../../api";

import toast from "react-hot-toast";
import styles from "./Auth.module.css";
import Header from "../../components/layout/Header";

function Verify() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || "");
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        if (!/^\d{6}$/.test(code)) {
            toast.error("Please enter the 6-digit verification code.");
            return;
        }

        setIsSubmitting(true);

        const result = await verify({ email, code });

        setIsSubmitting(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(result.message);
        setTimeout(() => navigate("/login"), 800);
    }

    async function handleResend() {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsResending(true);

        const result = await requestVerification(email);

        setIsResending(false);

        if (result.error) {
            toast.error(result.error);
            return;
        }

        toast.success(result.message);
    }

    return (
        <div className={styles.headerPage}>
            <Header />

            <div className={styles.page}>
                <div className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h1 className={styles.title}>Verify your email</h1>

                        <p className={styles.subtitle}>
                            Enter the 6-digit code sent to your email address
                        </p>

                        <input
                            id="email"
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            autoComplete="email"
                            required
                        />

                        <input
                            id="code"
                            className={styles.input}
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="Verification code"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            required
                        />

                        <button
                            className={styles.button}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Verify email"}
                        </button>

                        <button
                            className={styles.backButton}
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                        >
                            {isResending ? "Sending..." : "Resend code"}
                        </button>

                        <p className={styles.changeAuth}>
                            Already verified?
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

export default Verify;