import React, { useState } from 'react';

const API_URL = 'http://localhost:8000/bookings/'; // Change if your backend url is different

export default function BookingForm({ eventId }) {
  const [form, setForm] = useState({
    event_id: eventId || '', // can be passed as prop, or user can enter
    name: '',
    email: '',
    time: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update form state
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  }

  // Basic validation
  function validate() {
    if (!form.event_id) return 'Event ID is required';
    if (!form.name) return 'Name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return 'Valid email required';
    if (!form.time) return 'Time is required';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        let detail = await response.json();
        throw new Error(detail?.detail || 'Booking failed');
      }
      setSuccess('Booking successful!');
      setForm({ ...form, name: '', email: '', time: '' }); // Clear fields except event_id
    } catch (err) {
      setError(err.message || 'Error submitting booking');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Book This Event</h2>
      {!eventId && (
        <div>
          <label>
            Event ID
            <input
              name="event_id"
              value={form.event_id}
              onChange={handleChange}
              required
              autoComplete="off"
              style={{ width: '100%', marginBottom: 12, padding: 8 }}
            />
          </label>
        </div>
      )}
      <div>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="off"
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="off"
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>
          Time
          <input
            name="time"
            type="datetime-local"
            value={form.time}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ padding: '10px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Booking...' : 'Book'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
    </form>
  );
}