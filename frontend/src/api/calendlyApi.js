const API_URL = "http://localhost:8000"; // Change if your backend runs elsewhere

export async function fetchEvents() {
  const res = await fetch(`${API_URL}/events/`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

export async function fetchEventBookings(eventId) {
  const res = await fetch(`${API_URL}/events/${eventId}/bookings/`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function createEvent(event) {
  const res = await fetch(`${API_URL}/events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function createBooking(booking) {
  const res = await fetch(`${API_URL}/bookings/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}