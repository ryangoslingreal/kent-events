import './App.css'
import './styles.css'
import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header.jsx"
import Home from "./pages/Home.jsx"

function App() {

  return (
    
    <>
        {/* <Header />
        <h1>React app5</h1> */}
        
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
    </>
  )
}

export default App
