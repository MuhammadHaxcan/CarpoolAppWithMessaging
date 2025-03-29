import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DriverDashboard from './components/DriverDashboard';
import PassengerDashboard from './components/PassengerDashboard';
import DriverProfile from './components/DriverProfile';
import CreateRidePage from './components/CreateRidePage';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/driver-dashboard" element={<DriverDashboard />} />
                <Route path="/passenger-dashboard" element={<PassengerDashboard />} />
                <Route path="/driver-profile" element={<DriverProfile />} />
                <Route path="/create-ride" element={<CreateRidePage />} />
            </Routes>
        </Router>
    );
}

export default App;
