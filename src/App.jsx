import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ArmarTeam from './pages/ArmarTeam';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar de estilo Valorant */}
      <Navbar />

      {/* Contenedor principal de la app */}
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