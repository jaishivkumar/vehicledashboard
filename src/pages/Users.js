// src/pages/Users.js
import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/User.css'; // Corrected the CSS file name

const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    profilePhoto: null,
    address: '',
    aadhaarNumber: '',
    document: null,
    userType: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAllotDialogOpen, setAllotDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [unallocatedVehicles, setUnallocatedVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userCollection = collection(db, 'users');
        const userSnapshot = await getDocs(userCollection);
        const userList = userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchVehicles = async () => {
      try {
        const vehicleCollection = collection(db, 'vehicles');
        const vehicleSnapshot = await getDocs(vehicleCollection);
        const vehicleList = vehicleSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setVehicles(vehicleList);
        setUnallocatedVehicles(vehicleList.filter(vehicle => !vehicle.allottedTo));
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchUsers();
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewUser({ ...newUser, [name]: files[0] });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      let profilePhotoURL = '';
      let documentURL = '';

      if (newUser.profilePhoto) {
        const profileRef = ref(storage, `users/${newUser.profilePhoto.name}`);
        await uploadBytes(profileRef, newUser.profilePhoto);
        profilePhotoURL = await getDownloadURL(profileRef);
      }

      if (newUser.document) {
        const documentRef = ref(storage, `users/${newUser.document.name}`);
        await uploadBytes(documentRef, newUser.document);
        documentURL = await getDownloadURL(documentRef);
      }

      const docRef = await addDoc(collection(db, 'users'), {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        aadhaarNumber: newUser.aadhaarNumber,
        profilePhotoURL,
        documentURL,
        userType: newUser.userType,
        vehicles: []
      });

      setUsers((prev) => [...prev, { id: docRef.id, ...newUser, profilePhotoURL, documentURL }]);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        profilePhoto: null,
        address: '',
        aadhaarNumber: '',
        document: null,
        userType: ''
      });
      alert('User added successfully!');
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
  };

  const handleAllotVehicle = async () => {
    try {
      const userDocRef = doc(db, 'users', selectedUser.id);
      await updateDoc(userDocRef, {
        vehicles: selectedVehicles.map(vehicle => vehicle.id)
      });

      const updatedUsers = users.map(user =>
        user.id === selectedUser.id ? { ...user, vehicles: selectedVehicles.map(vehicle => vehicle.id) } : user
      );
      setUsers(updatedUsers);

      const updatedVehicles = vehicles.map(vehicle =>
        selectedVehicles.includes(vehicle)
          ? { ...vehicle, allottedTo: selectedUser.id }
          : vehicle
      );
      setVehicles(updatedVehicles);
      setUnallocatedVehicles(updatedVehicles.filter(vehicle => !vehicle.allottedTo));
      alert('Vehicles allotted successfully!');
      setAllotDialogOpen(false);
    } catch (error) {
      console.error('Error allotting vehicles:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-container">
      <h2>Users</h2>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search users by name or phone"
          className="search-bar"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="button" onClick={() => setDialogOpen(true)}>Add New User</button>
      </div>
      {isDialogOpen && (
        <div className="dialog-container">
          <div className="dialog-box">
            <h3>Add New User</h3>
            <input type="text" name="name" placeholder="Name" value={newUser.name} onChange={handleInputChange} className="input-field" />
            <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} className="input-field" />
            <input type="text" name="phone" placeholder="Phone Number" value={newUser.phone} onChange={handleInputChange} className="input-field" />
            <input type="text" name="address" placeholder="Address" value={newUser.address} onChange={handleInputChange} className="input-field" />
            <input type="text" name="aadhaarNumber" placeholder="Aadhaar Number" value={newUser.aadhaarNumber} onChange={handleInputChange} className="input-field" />

            {/* File upload sections */}
            <div className="file-upload-container">
              <label htmlFor="profilePhoto">Profile Photo</label>
              <input type="file" name="profilePhoto" onChange={handleFileChange} />
            </div>
            <div className="file-upload-container">
              <label htmlFor="document">Document (Aadhaar or Other)</label>
              <input type="file" name="document" onChange={handleFileChange} />
            </div>

            <input type="text" name="userType" placeholder="User Type" value={newUser.userType} onChange={handleInputChange} className="input-field" />
            <button className="button save-button" onClick={handleAddUser}>Add User</button>
            <button className="button cancel-button" onClick={() => setDialogOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="user-details">
          <h3>User Details</h3>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong> {selectedUser.phone}</p>
          <p><strong>Address:</strong> {selectedUser.address}</p>
          <p><strong>Aadhaar Number:</strong> {selectedUser.aadhaarNumber}</p>
          <img src={selectedUser.profilePhotoURL} alt="Profile" className="profile-photo" />
          <button className="button" onClick={() => setAllotDialogOpen(true)}>Allot Vehicle</button>
        </div>
      )}

      {isAllotDialogOpen && (
        <div className="dialog-container">
          <div className="allot-dialog">
            <h3>Allot Vehicle</h3>
            <input type="text" placeholder="Search vehicle" className="search-bar" onChange={(e) => {}} />
            <ul className="vehicle-list">
              {unallocatedVehicles.map(vehicle => (
                <li key={vehicle.id}>
                  <input
                    type="checkbox"
                    value={vehicle.id}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVehicles([...selectedVehicles, vehicle]);
                      } else {
                        setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicle.id));
                      }
                    }}
                  />
                  {vehicle.name}
                </li>
              ))}
            </ul>
            <button className="button" onClick={handleAllotVehicle}>Allot Vehicle</button>
            <button className="button cancel-button" onClick={() => setAllotDialogOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Profile Photo</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td><img src={user.profilePhotoURL} alt="Profile" className="profile-photo" /></td>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>
                <button className="button" onClick={() => handleUserSelect(user.id)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
