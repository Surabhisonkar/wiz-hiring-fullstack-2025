import React, { useState } from 'react';

const API_URL = 'http://localhost:8000/events/';

export default function CreateEventForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    organizer: '',
    slots: [''],
    max_bookings: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === "max_bookings" ? parseInt(value, 10) : value
    }));
    setError('');
    setSuccess('');
  }

  function handleSlotChange(idx, value) {
    const slots = [...form.slots];
    slots[idx] = value;
    setForm(f => ({ ...f, slots }));
    setError('');
    setSuccess('');
  }

  function addSlot() {
    setForm(f => ({ ...f, slots: [...f.slots, ''] }));
  }

  function removeSlot(idx) {
    setForm(f => ({
      ...f,
      slots: f.slots.filter((_, i) => i !== idx)
    }));
  }

  function validate() {
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    if (!form.start_time.trim()) return 'Start time is required';
    if (!form.end_time.trim()) return 'End time is required';
    if (!form.organizer.trim()) return 'Organizer is required';
    if (!form.slots.length || form.slots.some(slot => !slot.trim()))
      return 'At least one valid slot is required';
    if (form.max_bookings < 1) return 'Max bookings must be at least 1';
    if (form.slots.some(slot => isNaN(Date.parse(slot))))
      return 'Slots must be valid ISO8601 dates';
    if (isNaN(Date.parse(form.start_time))) return 'Start time must be valid ISO8601 date';
    if (isNaN(Date.parse(form.end_time))) return 'End time must be valid ISO8601 date';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const detail = await response.json();
        // Handle FastAPI validation errors (422 Unprocessable Entity)
        if (detail?.detail && Array.isArray(detail.detail)) {
          const msg = detail.detail.map(
            err => `${err.loc?.join('.')}: ${err.msg}`
          ).join('\n');
          throw new Error(msg);
        }
        throw new Error(detail?.detail || 'Failed to create event');
      }
      setSuccess('Event created successfully!');
      setForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        organizer: '',
        slots: [''],
        max_bookings: 1
      });
    } catch (err) {
      setError(err.message || 'Error creating event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Create Event</h2>
      <div>
        <label>
          Title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
            rows={3}
          />
        </label>
      </div>
      <div>
        <label>
          Start Time
          <input
            name="start_time"
            type="datetime-local"
            value={form.start_time}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>
          End Time
          <input
            name="end_time"
            type="datetime-local"
            value={form.end_time}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>
          Organizer
          <input
            name="organizer"
            value={form.organizer}
            onChange={handleChange}
            required
            style={{ width: '100%', marginBottom: 12, padding: 8 }}
          />
        </label>
      </div>
      <div>
        <label>Event Slots (ISO8601 format, UTC recommended)</label>
        {form.slots.map((slot, idx) => (
          <div key={idx} style={{ display: 'flex', marginBottom: 8 }}>
            <input
              type="datetime-local"
              value={slot}
              onChange={e => handleSlotChange(idx, e.target.value)}
              required
              style={{ flex: 1, padding: 8 }}
            />
            {form.slots.length > 1 && (
              <button type="button" onClick={() => removeSlot(idx)} style={{ marginLeft: 8 }}>
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSlot} style={{ marginTop: 8 }}>
          + Add Slot
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <label>
          Max bookings per slot
          <input
            name="max_bookings"
            type="number"
            min={1}
            value={form.max_bookings}
            onChange={handleChange}
            required
            style={{ width: 80, marginLeft: 8 }}
          />
        </label>
      </div>
      <button type="submit" disabled={loading} style={{ marginTop: 18, padding: '10px 18px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4 }}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 12, whiteSpace: 'pre-line' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
    </form>
  );
}