import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DriverDashboard from './components/DriverDashboard';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/driver-dashboard" element={<DriverDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
