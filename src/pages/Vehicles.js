import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig"; // Import Firestore and Storage
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import necessary functions from Firebase Storage
import '../styles/Vehicles.css'; // Importing the CSS file

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({ name: "", type: "", photo: null, dateOfManufacture: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // To store the selected vehicle
  const [liveData, setLiveData] = useState(null); // To store live data for the selected vehicle

  // Fetch vehicles from Firestore
  useEffect(() => {
    const fetchVehicles = async () => {
      const vehicleCollection = collection(db, "vehicles");
      const vehicleSnapshot = await getDocs(vehicleCollection);
      const vehicleList = vehicleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(vehicleList);
    };

    fetchVehicles();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({ ...newVehicle, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setNewVehicle({ ...newVehicle, photo: e.target.files[0] });
  };

  // Handle adding new vehicle
  const handleAddVehicle = async () => {
    try {
      // Upload photo to Firebase Storage
      let photoURL = "";
      if (newVehicle.photo) {
        const storageRef = ref(storage, `vehicles/${newVehicle.photo.name}`);
        await uploadBytes(storageRef, newVehicle.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      // Add vehicle data to Firestore
      const docRef = await addDoc(collection(db, "vehicles"), {
        name: newVehicle.name,
        type: newVehicle.type,
        dateOfManufacture: newVehicle.dateOfManufacture,
        photoURL: photoURL,
        // Add fields for live data
        position: "45.4215° N, 75.6972° W",  // Example initial data
        batteryPercentage: "80%",            // Example initial data
        speed: "60 km/h",                    // Example initial data
        temperature: "25°C"                  // Example initial data
      });

      // Update local state to reflect the new vehicle
      setVehicles(prev => [
        ...prev, 
        {
          id: docRef.id,
          name: newVehicle.name,
          type: newVehicle.type,
          dateOfManufacture: newVehicle.dateOfManufacture,
          photoURL,
          // Include the live data fields in the local state
          position: "45.4215° N, 75.6972° W",
          batteryPercentage: "80%",
          speed: "60 km/h",
          temperature: "25°C"
        }
      ]);

      // Clear the form and close the dialog
      setNewVehicle({ name: "", type: "", photo: null, dateOfManufacture: "" });
      alert("Vehicle added successfully!");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  // Handle vehicle selection to view live data
  const handleVehicleSelect = (vehicleId) => {
    const selected = vehicles.find(v => v.id === vehicleId);
    if (selected) {
      setSelectedVehicle(selected);
      setLiveData({
        position: selected.position || "N/A",
        batteryPercentage: selected.batteryPercentage || "N/A",
        speed: selected.speed || "N/A",
        temperature: selected.temperature || "N/A"
      });
    }
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      <h2>Vehicles</h2>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search vehicles"
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setDialogOpen(true)} className="button add-button">Add New Vehicle</button>
      </div>
      {isDialogOpen && (
        <div className="dialog-container">
          <div className="dialog-box">
            <h3>Add New Vehicle</h3>
            <input
              type="text"
              name="name"
              placeholder="Vehicle Name"
              value={newVehicle.name}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="text"
              name="type"
              placeholder="Vehicle Type"
              value={newVehicle.type}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="date"
              name="dateOfManufacture"
              value={newVehicle.dateOfManufacture}
              onChange={handleInputChange}
              className="input-field"
            />
            <input
              type="file"
              name="photo"
              onChange={handleFileChange}
              className="input-field"
            />
            <button onClick={handleAddVehicle} className="button save-button">Add Vehicle</button>
            <button onClick={() => setDialogOpen(false)} className="button cancel-button">Cancel</button>
          </div>
        </div>
      )}

      {/* Dropdown to select vehicle */}
      <div>
        <h3>Select Vehicle to View Live Data</h3>
        <select onChange={(e) => handleVehicleSelect(e.target.value)} className="input-field">
          <option value="">Select a vehicle</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>
          ))}
        </select>
      </div>

      {/* Display live data for the selected vehicle */}
      {selectedVehicle && liveData && (
        <div className="live-data">
          <h3>Live Data for {selectedVehicle.name}</h3>
          <p>Position: {liveData.position}</p>
          <p>Battery Percentage: {liveData.batteryPercentage}</p>
          <p>Last Reported Speed: {liveData.speed}</p>
          <p>Battery Temperature: {liveData.temperature}</p>
        </div>
      )}

      {/* Table to display all vehicles */}
      <table className="table">
        <thead>
          <tr>
            <th>Vehicle Name</th>
            <th>Date of Manufacture</th>
            <th>Type of Vehicle</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>{vehicle.name}</td>
              <td>{vehicle.dateOfManufacture}</td>
              <td>{vehicle.type}</td>
              <td>
                <button className="button view-button" onClick={() => handleVehicleSelect(vehicle.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Vehicles;
