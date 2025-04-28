import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Medicine.css";

const Medicine = () => {
  const [userId, setUserId] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    time: "",
    dosage: "",
    notes: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/login");
      }
    } else {
      console.error("No token found in localStorage");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchMedicines = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/medicines/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMedicines(response.data);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, [userId]);

  const handleChange = (e) => {
    setNewMedicine({ ...newMedicine, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMedicine.name || !newMedicine.time) {
      alert("Please fill all required fields");
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/medicines`,
        { userId, ...newMedicine },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Fetch updated list of medicines
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/medicines/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShowModal(false);
      setNewMedicine({ name: "", time: "", dosage: "", notes: "" });
      setMedicines(response.data);
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm("Are you sure you want to remove this medication?")) {
      try {
        // Debug: Log the IDs being used
        console.log("Deleting medicine:", {
          userId,
          medicineId,
          url: `${
            import.meta.env.VITE_API_URL
          }/api/medicines/${userId}/${medicineId}`,
        });
        await axios.delete(
          `${
            import.meta.env.VITE_API_URL
          }/api/medicines/${userId}/${medicineId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Optimistic update
        setMedicines((prev) => prev.filter((med) => med._id !== medicineId));
      } catch (error) {
        console.error("Error details:", {
          error,
          response: error.response?.data,
        });
        alert(
          "Failed to delete: " + (error.response?.data?.error || "Server error")
        );
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Update statistics calculations
  const filteredMedicines = medicines.filter((med) => !med.status);
  const takenCount = medicines.filter((med) => med.status).length;

  // Group all medications (both taken and not taken) for display
  const groupedMedicinesDisplay = medicines.reduce((acc, med) => {
    const timeKey = new Date(`1970-01-01T${med.time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!acc[timeKey]) acc[timeKey] = [];
    acc[timeKey].push(med);
    return acc;
  }, {});

    // Group only non-taken medications for statistics
    const groupedMedicinesForStats = filteredMedicines.reduce((acc, med) => {
      const timeKey = new Date(`1970-01-01T${med.time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
  
      if (!acc[timeKey]) acc[timeKey] = [];
      acc[timeKey].push(med);
      return acc;
    }, {});



  // Sort times for display
  const sortedTimes = Object.keys(groupedMedicinesDisplay).sort((a, b) => {
    return (
      new Date(`1970-01-01T${a}`).getTime() -
      new Date(`1970-01-01T${b}`).getTime()
    );
  });

  return (
    <div className="medicine-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>
            <i className="medical-icon">💊</i> MedRemind
          </h1>
          <div className="header-actions">
            <button
              className="help-btn"
              onClick={() => alert("Need help? Contact support@medremind.com")}
            >
              <span className="help-icon">❓</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <span className="logout-text">Logout</span>
              <span className="logout-icon">🚪</span>
            </button>
          </div>
        </div>
      </header>

      <main className="medicine-main">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{filteredMedicines.length}</h3>
              <p>Total Medications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3>{Object.keys(groupedMedicinesForStats).length}</h3>
              <p>Time Slots</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>{takenCount}</h3>
              <p>Taken Today</p>
            </div>
          </div>
        </div>

        <div className="medications-card">
          <div className="card-header">
            <h2>Your Medication Schedule</h2>
            <button className="add-med-btn" onClick={() => setShowModal(true)}>
              <span className="plus-icon">+</span>
              Add Medication
            </button>
          </div>

          <div className="medicine-list-container">
            {medicines.length > 0 ? (
              sortedTimes.map((timeSlot) => (
                <div className="time-group" key={timeSlot}>
                  <div className="time-header">
                    <div className="time-badge">{timeSlot}</div>
                  </div>
                  {groupedMedicinesDisplay[timeSlot].map((med) => (
        <div 
          className={`medicine-card ${med.status ? 'taken-medication' : ''}`} 
          key={med._id}
        >
                      <div className="pill-icon">💊</div>
                      <div className="med-info">
                        <h3>{med.name}</h3>
                        {med.dosage && (
                          <p className="dosage">Dosage: {med.dosage}</p>
                        )}
                        {med.notes && <p className="notes">{med.notes}</p>}
                      </div>
                      <div className="med-actions">
                      <button
              className="delete-btn"
              title="Remove medication"
              onClick={() => handleDeleteMedicine(med._id)}
            >
              🗑️
            </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="stethoscope-icon">🩺</div>
                <p>No medications scheduled yet</p>
                <button
                  className="start-btn"
                  onClick={() => setShowModal(true)}
                >
                  Add Your First Medication
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">💊</div>
              <h3>Add New Medication</h3>
              <button
                className="close-modal"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>
                  Medication Name <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter medication name"
                    value={newMedicine.name}
                    onChange={handleChange}
                    required
                  />
                  <span className="input-icon">💊</span>
                </div>
              </div>
              <div className="input-group">
                <label>
                  Schedule Time <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <input
                    type="time"
                    name="time"
                    value={newMedicine.time}
                    onChange={handleChange}
                    required
                  />
                  <span className="input-icon">⏰</span>
                </div>
              </div>
              <div className="input-group">
                <label>Dosage</label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    name="dosage"
                    placeholder="e.g., 10mg, 1 tablet"
                    value={newMedicine.dosage}
                    onChange={handleChange}
                  />
                  <span className="input-icon">⚖️</span>
                </div>
              </div>
              <div className="input-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional instructions (e.g., take with food)"
                  value={newMedicine.notes}
                  onChange={handleChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-med-btn">
                  <span className="btn-icon">✓</span>
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicine;
