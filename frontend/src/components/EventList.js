import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000/events/';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!events.length) return <div>No events found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>All Events</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(event => (
          <li key={event.id} style={{ marginBottom: 20, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
            <h3>
              <Link to={`/events/${event.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
                {event.title}
              </Link>
            </h3>
            <p>{event.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}