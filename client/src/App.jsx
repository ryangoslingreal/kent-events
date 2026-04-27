import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { healthCheck } from "./api.js";

import "./App.css";
import "./styles.css";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Auth/Login.jsx";
import Signup from "./pages/Auth/Signup.jsx";
import Verify from "./pages/Auth/Verify.jsx";
import CreateEvent from "./pages/Events/CreateEvent.jsx";
import ChooseEvent from "./pages/Events/ChooseEvent.jsx";
import EditEvent from "./pages/Events/EditEvent.jsx";
import EventDetails from "./pages/Events/EventDetails.jsx";

function App() {
	useEffect(() => {
		async function checkBackend() {
			const result = await healthCheck();

			if (result.error) {
				console.error("Backend error:", result.error);
				return;
			}

			console.log("Backend OK:", result);
		}

		checkBackend();
	}, []);

	return (
		<>
			<Toaster 
				position="bottom-right"
				toastOptions={{
					style: {
						fontFamily: "Overpass, Helvetica, Arial, sans-serif",
						background: "#05345C",
    					color: "white"
					},
				}}
			/>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/auth/verify/:token" element={<Verify />} />
				<Route path="/events/create" element={<CreateEvent />} />
				<Route path="/events/choose" element={<ChooseEvent />} />
				<Route path="/events/edit/:id" element={<EditEvent />} />
				<Route path="/events/detail/:id" element={<EventDetails />} />
			</Routes>
		</>
	);
}

export default App;