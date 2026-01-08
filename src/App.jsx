import './App.css'
import './styles.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx"
import Home from "./pages/Home/Home.jsx"
import Login from "./pages/Login/Login.jsx"
import Signup from "./pages/Signup/Signup.jsx"

function App() {

  return (
    
    <>
        {/* <Header />
        <h1>React app5</h1> */}
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
    </>
  )
}

export default App
