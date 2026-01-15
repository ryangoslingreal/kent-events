import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import Header from "../../components/layout/Header";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    // TODO: call the API here
    console.log("Login:", { email, password });
  }

  return (
    <>
    <Header/>
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
                    <label className={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <span>Show password</span>    
                    </label>
                    <span className={styles.forgotPass}>forgot password?</span>
                </div>
            
            <button className={styles.button} type="submit">
            Log in
            </button>

            <p className={styles.changeAuth}>Don't have an account? <Link to="../signup" className={styles.changeAuthButton}>Create One</Link></p>
        </form>
      </div>
    </div>
    </>
  );
}

export default Login;