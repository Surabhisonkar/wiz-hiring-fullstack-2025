import React, { useState } from "react";

export default function EventForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    organizer: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.start_time || !form.end_time || !form.organizer) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit(form);
    setForm({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      organizer: "",
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ margin: "2em 0" }}>
      <h3>Create New Event</h3>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
      <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" required />
      <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} required />
      <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} required />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
      <br />
      <button type="submit">Create Event</button>
    </form>
  );
}