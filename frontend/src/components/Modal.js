import React from "react";
import "./Modal.css";

export default function Modal({ show, onClose, title, children }) {
  if (!show) return null;
  return (
    <div className="simple-modal-backdrop">
      <div className="simple-modal-box">
        <button className="simple-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 className="simple-modal-title">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}