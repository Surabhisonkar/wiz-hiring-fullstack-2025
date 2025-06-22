import React, { useState } from "react";
import { formatSlot, COMMON_TIMEZONES, getBrowserTimezone } from "../utils/timezone";

export default function MyBookings() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeZone, setTimeZone] = useState(getBrowserTimezone());
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBookings(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/users/${encodeURIComponent(email)}/bookings`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        setSubmittedEmail(email);
      } else {
        setError("Could not fetch bookings. Please try again later.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <h2>My Bookings</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <input
            type="email"
            value={email}
            placeholder="Enter your email"
            onChange={e => setEmail(e.target.value)}
            style={{
            width: "70%",
            padding: 6,
            marginRight: 8,
            border: error ? "1px solid red" : undefined
            }}
            required
        />
        <button type="submit" style={{ padding: "6px 18px" }}>
            View
        </button>
        {error && <div style={{ color: "red", marginTop: 4 }}>{error}</div>}
      </form>
      <div style={{ marginBottom: 12 }}>
        <label>
          Show times in:{" "}
          <select value={timeZone} onChange={e => setTimeZone(e.target.value)}>
            {[getBrowserTimezone(), ...COMMON_TIMEZONES]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
          </select>
        </label>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {bookings && (
        <>
          <h4 style={{ marginBottom: 6 }}>
            Bookings for: <span style={{ color: "#555" }}>{submittedEmail}</span>
          </h4>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <ul>
              {bookings.map(b => (
                <li key={b.id}>
                  Event #{b.event_id} – {formatSlot(b.slot, timeZone)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}