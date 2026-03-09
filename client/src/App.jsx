import { useEffect } from 'react'
import './App.css'
import './styles.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx"
import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Login/Login.jsx"
import Signup from "./pages/Signup/Signup.jsx"
import CreateEvent from "./pages/CreateEvent/CreateEvent.jsx"
import ChooseEvent from "./pages/EditEvent/ChooseEvent.jsx"
import EditEvent from "./pages/EditEvent/EditEvent.jsx"
import EventDetails from "./pages/EventDetails/EventDetails.jsx"

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
        <Route path="/events/choose" element={<ChooseEvent />} />
        <Route path="/events/edit/:id" element={<EditEvent />} />
        <Route path="/events/detail" element={<EventDetails />} />
      </Routes>
    </>
  );
}


export default App