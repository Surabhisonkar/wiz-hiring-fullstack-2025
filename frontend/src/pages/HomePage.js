import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/events/")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  return (
    <div>
      <h2>All Events</h2>
      {events.length === 0 && <p>No events found.</p>}
      <ul>
        {events.map((event) =>
          event.id ? (
            <li key={event.id} style={{ marginBottom: 12 }}>
              <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                <strong>{event.title}</strong>
              </Link>
              <br />
              <span>{event.description}</span>
              <br />
              <span>
                {new Date(event.start_time).toLocaleString()} -{" "}
                {new Date(event.end_time).toLocaleString()}
              </span>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

export default HomePage;