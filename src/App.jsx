
/**
 * Main App Component
 *
 * This is the root component of our React application. It sets up client-side routing
 * using React Router, allowing users to navigate between different pages of the website.
 *
 * The app uses BrowserRouter for clean URLs (no hash symbols), and defines routes
 * for each main page of the TR Tech Repairs and Designs website.
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import About from './pages/AboutPage';
import Services from './pages/ServicesPage';
import Shop from './pages/ShopPage';
import Contact from './pages/ContactPage';
import { RepairsPage } from './pages/RepairsPage';

function App() {
  return (
    // BrowserRouter enables client-side routing for the entire app
    <Router>
      {/* Routes component contains all our route definitions */}
      <Routes>
        {/* Each Route maps a URL path to a React component */}
        <Route path="/" element={<Home />} />           {/* Homepage */}
        <Route path="/about" element={<About />} />     {/* About Us page */}
        <Route path="/services" element={<Services />} /> {/* Services offered */}
        <Route path="/shop" element={<Shop />} />       {/* Online shop */}
        <Route path="/book-repair" element={<RepairsPage />} /> {/* Repair booking */}
        <Route path="/contact" element={<Contact />} /> {/* Contact information */}
      </Routes>
    </Router>
  );
}

export default App;