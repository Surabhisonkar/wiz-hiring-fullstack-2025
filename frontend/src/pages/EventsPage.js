import React, { useEffect, useState } from "react";
import { fetchEvents, createEvent } from "../api/calendlyApi";
import EventList from "../components/EventList";
import EventForm from "../components/EventForm";
import CreateEventForm from "../components/CreateEventForm"; // Add this import

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  async function loadEvents() {
    try {
      setEvents(await fetchEvents());
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  async function handleCreate(eventData) {
    try {
      await createEvent(eventData);
      loadEvents();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{padding: "1em"}}>
      {error && <div style={{color: "red"}}>{error}</div>}
      {/* Replace or add CreateEventForm here */}
      <CreateEventForm />
      <EventList events={events} />
    </div>
  );
}

