// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/Home.css";

const Home = () => {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [liveData, setLiveData] = useState({
    position: "N/A",
    batteryPercentage: "N/A",
    speed: "N/A",
    temperature: "N/A",
  });
  const [historyData, setHistoryData] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Fetch the list of vehicles from the database
  useEffect(() => {
    const fetchVehicles = async () => {
      const vehicleCollection = collection(db, "vehicles");
      const vehicleSnapshot = await getDocs(vehicleCollection);
      const vehicleList = vehicleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(vehicleList);
    };

    fetchVehicles();
  }, []);

  const handleVehicleSelect = async (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicle(vehicleId);
  
    // Fetch live data for selected vehicle
    const vehicleDoc = vehicles.find(vehicle => vehicle.id === vehicleId);
    if (vehicleDoc) {
      setLiveData({
        position: vehicleDoc.position || "N/A",
        batteryPercentage: vehicleDoc.batteryPercentage || "N/A",
        speed: vehicleDoc.speed || "N/A",
        temperature: vehicleDoc.temperature || "N/A",
      });
    }
  
    // Fetch history data for the selected vehicle
    const historyQuery = query(collection(db, "vehicleHistory"), where("vehicleId", "==", vehicleId));
    const historySnapshot = await getDocs(historyQuery);
    const historyList = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setHistoryData(historyList);
  };
  

  return (
    <div className="dashboard-content">
      <h2 className="welcome-message">Welcome Home!</h2>
      <div className="home-select">
        <label htmlFor="vehicle-select" className="select-label">Select a vehicle:</label>
        <select id="vehicle-select" onChange={handleVehicleSelect} className="vehicle-select">
          <option value="">Select a vehicle</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
          ))}
        </select>
      </div>

      {/* Display Live Data */}
      {selectedVehicle && (
        <div className="live-data">
          <h3 className="live-data-title">Live Data for {vehicles.find(vehicle => vehicle.id === selectedVehicle)?.name}</h3>
          <p className="live-data-item">Position: {liveData.position}</p>
          <p className="live-data-item">Battery Percentage: {liveData.batteryPercentage}</p>
          <p className="live-data-item">Last Reported Speed: {liveData.speed}</p>
          <p className="live-data-item">Battery Temperature: {liveData.temperature}</p>
        </div>
      )}

      {/* Display History Data */}
      {selectedVehicle && historyData.length > 0 && (
        <div className="history-data">
          <h3 className="history-data-title">History Data for {vehicles.find(vehicle => vehicle.id === selectedVehicle)?.name}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Position</th>
                <th>Battery Percentage</th>
                <th>Speed</th>
                <th>Temperature</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((data) => (
                <tr key={data.id}>
                  <td>{data.date}</td>
                  <td>{data.position}</td>
                  <td>{data.batteryPercentage}</td>
                  <td>{data.speed}</td>
                  <td>{data.temperature}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;
