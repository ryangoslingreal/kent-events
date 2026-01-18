import { useEffect } from 'react'
import './App.css'
import './styles.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx"
import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Login/Login.jsx"
import Signup from "./pages/Signup/Signup.jsx"
import CreateEvent from "./pages/CreateEvent/CreateEvent.jsx"

function App() {

  useEffect(() => {
    fetch("http://localhost:3001/api/health")
      .then(res => res.json())
      .then(data => {
        console.log("Backend OK:", data);
      })
      .catch(err => {
        console.error("Backend error:", err);
      });
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events/create" element={<CreateEvent />} />
      </Routes>
    </>
  );
}


export default App