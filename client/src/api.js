const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

//This function takes all the create event fields given by CreateEvent.jsx, and passes them to the backend and then waits for a response
export async function createEvent(data){

  //FormData is being used to pass the image to the backen/db, doing it with FormData instead of json is a lot more efficient
  let formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  })

  try{
    const res = await fetch(`${API_BASE}/api/events/create-event`, {
      method: "POST",
      // headers: { "Content-Type": "application/json"},
      // body: JSON.stringify({ title, subtitle, description, date, time, location, tag, price, repeat, contactInfo }),
      body: formData,
    });
    
    //As I don't return anything from inserting an event, await res.json (below) throws an error, the catch is there to prevent the frontend from thinking it failed
    const data = await res.json().catch(() => ({}));     
    console.log("createEvent:", res.status, data);

    if (!res.ok) {
      return { error: data.message }
    }

    return data;
  } catch (error){
    //Only happens with network errors (like if your not connected to the VPN so can't access dragon)
    return { error: "Network error: Failed to create event" };
  }
};

export async function getUserMadeEvents() {
  try{
    const res = await fetch(`${API_BASE}/api/events/get-user-made-events`, {
      method: "GET",
      headers: { "Content-Type": "application/json"},
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.message }
    }

    return data;
  } catch(error){
    return { error: "Network error: Failed to grab users events"}
  }
}

//gets data from one specific event
export async function getEvent(eventId) {
  try{
    const res = await fetch(`${API_BASE}/api/events/get-event?eventId=${encodeURIComponent(eventId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json"},
    })

    const data = await res.json();

    if (!res.ok){
      return {error: data.message}
    }

    return data
  } catch(error){
    return {error : "Network error: Failed to grab event"}
  }
} 
