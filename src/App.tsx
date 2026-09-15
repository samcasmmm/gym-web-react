import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import ExerciseDetail from './pages/ExerciseDetail';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="w-full max-w-[1488px] mx-auto min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exercise/:id" element={<ExerciseDetail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;