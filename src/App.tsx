import React from 'react';
import './App.css';
import 'primereact/resources/themes/saga-blue/theme.css'; // PrimeReact theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import ArtworksTable from './ArtworksTable';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Artworks Table</h1>
      <ArtworksTable />
    </div>
  );
};

export default App;
