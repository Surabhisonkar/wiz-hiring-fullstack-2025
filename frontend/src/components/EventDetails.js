import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatSlot, COMMON_TIMEZONES, getBrowserTimezone } from "../utils/timezone";
import Modal from "../components/Modal";

function EventDetails() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    attendee_name: "",
    attendee_email: "",
    slot: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [timeZone, setTimeZone] = useState(getBrowserTimezone());
  const [modal, setModal] = useState({ show: false, title: "", content: "" });

  useEffect(() => {
    if (!eventId || isNaN(Number(eventId))) return;
    fetch(`http://localhost:8000/events/${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then(setEvent)
      .catch(() => setEvent(null));
    fetch(`http://localhost:8000/events/${eventId}/bookings/`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setBookings)
      .catch(() => setBookings([]));
  }, [eventId]);

  if (!event) return <div>Loading...</div>;
  if (!Array.isArray(event.slots)) return <div>Event data invalid. Please try again.</div>;

  // Count bookings per slot
  const slotCounts = {};
  for (const slot of event.slots) slotCounts[slot] = 0;
  for (const b of bookings) {
    if (slotCounts[b.slot] !== undefined) slotCounts[b.slot]++;
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Client-side validation
    if (!form.attendee_name.trim() || !form.attendee_email.trim() || !form.slot) {
      setModal({
        show: true,
        title: "Booking Error",
        content: "Please fill in all the fields and select a slot.",
      });
      setSubmitting(false);
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.attendee_email)) {
      setModal({
        show: true,
        title: "Booking Error",
        content: "Please enter a valid email address.",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      event_id: event.id,
      attendee_name: form.attendee_name,
      attendee_email: form.attendee_email,
      booked_at: new Date().toISOString(),
      slot: form.slot,
    };
    try {
      const res = await fetch(
        `http://localhost:8000/events/${event.id}/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        setModal({
          show: true,
          title: "Booking Successful!",
          content: "Your booking was successful! Check your email for confirmation.",
        });
        setForm({ attendee_name: "", attendee_email: "", slot: "" });
        // refetch bookings
        const updated = await fetch(
          `http://localhost:8000/events/${event.id}/bookings/`
        ).then((r) => r.json());
        setBookings(updated);
      } else {
        let errorMsg = "Booking failed. Please try again.";
        try {
          const data = await res.json();
          if (data?.detail) errorMsg = data.detail;
        } catch (e) {}
        setModal({
          show: true,
          title: "Booking Error",
          content: errorMsg,
        });
      }
    } catch (err) {
      setModal({
        show: true,
        title: "Network Error",
        content: "A network error occurred. Please try again.",
      });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div>
        <strong>
          {formatSlot(event.start_time, timeZone)} —{" "}
          {formatSlot(event.end_time, timeZone)}
        </strong>
      </div>
      <div style={{ margin: "16px 0" }}>
        <label>
          Viewing times in:{" "}
          <select value={timeZone} onChange={e => setTimeZone(e.target.value)}>
            {[getBrowserTimezone(), ...COMMON_TIMEZONES]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
          </select>
        </label>
      </div>
      <div>
        <h4>Book a Slot</h4>
        <form onSubmit={handleSubmit} autoComplete="off">
          <label>
            Name:
            <input
              name="attendee_name"
              required
              value={form.attendee_name}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            />
          </label>
          <br />
          <label>
            Email:
            <input
              name="attendee_email"
              type="email"
              required
              value={form.attendee_email}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            />
          </label>
          <br />
          <label>
            Slot:
            <select
              name="slot"
              required
              value={form.slot}
              onChange={handleChange}
              style={{ marginLeft: 8 }}
            >
              <option value="">Select slot</option>
              {event.slots.map((slot) => (
                <option
                  key={slot}
                  value={slot}
                  disabled={slotCounts[slot] >= event.max_bookings}
                >
                  {formatSlot(slot, timeZone)} (
                  {slotCounts[slot] >= event.max_bookings
                    ? "Fully booked"
                    : `${event.max_bookings - slotCounts[slot]} available`}
                  )
                </option>
              ))}
            </select>
          </label>
          <br />
          <button disabled={submitting} type="submit">
            {submitting ? "Booking..." : "Book"}
          </button>
        </form>
      </div>
      <div>
        <h4>Existing Bookings</h4>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          <ul>
            {bookings.map((b) => (
              <li key={b.id}>
                {b.attendee_name} ({b.attendee_email}) —{" "}
                {formatSlot(b.slot, timeZone)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Modal
        show={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        title={modal.title}
      >
        <p>{modal.content}</p>
      </Modal>
    </div>
  );
}

export default EventDetails;