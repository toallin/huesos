import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar básica para navegar */}
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '15px' }}>Inicio</Link>
        <Link to="/admin">Admin</Link>
      </nav>

      {/* Definición de rutas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;