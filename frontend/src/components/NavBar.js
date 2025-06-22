import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: 16, borderBottom: '1px solid #eee', marginBottom: 24 }}>
      <Link to="/events" style={{ marginRight: 16 }}>Events</Link>
      <Link to="/create-event">Create Event</Link>
      <a href="/my-bookings">My Bookings</a>
      {/* Add more links as needed */}
    </nav>
  );
}