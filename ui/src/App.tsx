import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ParkingDetails } from './pages/ParkingDetails';
import { Booking } from './pages/Booking';
import { ListParking } from './pages/ListParking';
import { MyParking } from './pages/MyParking';
import { EditParking } from './pages/EditParking';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/parking/:id" element={<ParkingDetails />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/list-parking" element={<ListParking />} />
            <Route path="/edit-parking/:id" element={<EditParking />} />
            <Route path="/my-parking" element={<MyParking />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
