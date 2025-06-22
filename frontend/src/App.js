import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EventList from './components/EventList';
import EventDetails from './components/EventDetails';
import CreateEventForm from './components/CreateEventForm';
import MyBookings from "./pages/MyBookings";
// Import other components as needed (BookingForm, BookingList, etc.)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/events" />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/create-event" element={<CreateEventForm />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </Router>
  );
}

export default App;