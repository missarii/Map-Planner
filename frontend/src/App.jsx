import React, { useState } from 'react';
import InitialPage from './pages/InitialPage.jsx';
import MapPage from './pages/MapPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('initial'); // 'initial' or 'map'
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const navigateToMap = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentPage('map');
  };

  const navigateToInitial = () => {
    setSelectedProjectId(null);
    setCurrentPage('initial');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19' }}>
      {currentPage === 'initial' ? (
        <InitialPage onOpenProject={navigateToMap} />
      ) : (
        <MapPage projectId={selectedProjectId} onBack={navigateToInitial} />
      )}
    </div>
  );
}

export default App;
