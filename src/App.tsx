import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';            // your existing home
import ClientGroupPage from './pages/ClientGroupPage';
import ClientGroupSelector from './components/ClientGroupSelector';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Optional landing page that shows selector */}
                <Route path="/dashboard" element={<ClientGroupSelector />} />
                <Route path="/client-groups/:groupId" element={<ClientGroupPage />} />
                {/* other routes ... */}
            </Routes>
        </Router>
    );
}

export default App;
