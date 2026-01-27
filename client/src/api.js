const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}

export async function createEvent(title, subtitle, description, date, time, location, tag, price, repeat, contactInfo){
  try{
    const res = await fetch(`${API_BASE}/api/events/create-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ title, subtitle, description, date, time, location, tag, price, repeat, contactInfo }),
    });
    
    const data = await res.json().catch(() => ({}));
    console.log("createEvent:", res.status, data);

    if (!res.ok) {
      return { error: data.message }
    }

    return data;
  } catch (error){
    console.error("createEvent:", error);
    return { error: "Network error: Failed to create event" };
  }
};