import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import ApartmentList from './components/ApartmentList';
import ApartmentCard from './components/ApartmentCard';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <ApartmentList />
      </main>
    </div>
  );
}

export default App; 