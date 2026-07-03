import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="val-navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-accent">MIXTONE</span>
          <span className="logo-divider">//</span>
          <span className="logo-sub">SALAS</span>
        </div>
        
        <div className="navbar-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <span className="nav-text">INICIO</span>
            <span className="nav-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/armar" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-text">ARMAR EQUIPO</span>
            <span className="nav-indicator"></span>
          </NavLink>
          
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-text">ADMIN</span>
            <span className="nav-indicator"></span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
