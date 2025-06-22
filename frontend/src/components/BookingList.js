import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000/bookings/'; // Update if your backend URL is different

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Fetch all bookings
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, []);

  async function fetchBookings() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // Delete a booking
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete booking');
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <div>Loading bookings...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!bookings.length) return <div>No bookings found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>All Bookings</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {bookings.map(booking => (
          <li key={booking.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
            <div>
              <strong>Event ID:</strong> {booking.event_id}
            </div>
            <div>
              <strong>Name:</strong> {booking.name}
            </div>
            <div>
              <strong>Email:</strong> {booking.email}
            </div>
            <div>
              <strong>Time:</strong> {booking.time}
            </div>
            <button
              onClick={() => handleDelete(booking.id)}
              disabled={deleting === booking.id}
              style={{
                marginTop: 8,
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '6px 16px',
                cursor: deleting === booking.id ? 'not-allowed' : 'pointer'
              }}>
              {deleting === booking.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}