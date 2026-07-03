import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';        // ← Cambiar a .jsx
import Admin from './pages/Admin.jsx';      // ← Cambiar a .jsx
import ArmarTeam from './pages/ArmarTeam.jsx'; // ← Cambiar a .jsx
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/armar" element={<ArmarTeam />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;