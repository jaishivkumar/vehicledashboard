import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ handleLogout }) => {
  const navigate = useNavigate();

  return (
    <nav>
      <ul>
        <li onClick={() => navigate('/home')}>Home</li>
        <li onClick={() => navigate('/vehicles')}>Vehicles</li>
        <li onClick={() => navigate('/users')}>Users</li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
