import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { GlobalStyles } from './styles/GlobalStyles';
import { Layout } from './components/layout/Layout';

// Pages
import { Home } from './pages/Home';
import { DataEntry } from './pages/DataEntry';
import { History } from './pages/History';
import { Map } from './pages/Map';
import { Predictions } from './pages/Predictions';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/entry" element={<DataEntry />} />
            <Route path="/history" element={<History />} />
            <Route path="/map" element={<Map />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
