import { useEffect } from 'react'
import './App.css'
import './styles.css'
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Auth/Login.jsx"
import Signup from "./pages/Auth/Signup.jsx"
import Verify from "./pages/Auth/Verify.jsx"
import CreateEvent from "./pages/Events/CreateEvent.jsx"
import ChooseEvent from "./pages/Events/ChooseEvent.jsx"
import EditEvent from "./pages/Events/EditEvent.jsx"

function App() {

  useEffect(() => {
    fetch("/api/health")
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
        <Route path="/auth/verify/:token" element={<Verify />} />
        <Route path="/events/create" element={<CreateEvent />} />
        <Route path="/events/choose" element={<ChooseEvent />} />
        <Route path="/events/edit/:id" element={<EditEvent />} />
      </Routes>
    </>
  );
}


export default App