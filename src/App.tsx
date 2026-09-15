import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RestTimerFloating from './components/RestTimerFloating';
import Home from './pages/Home';
import Workout from './pages/Workout';
import ExercisesPage from './pages/ExercisesPage';
import ExerciseDetail from './pages/ExerciseDetail';
import History from './pages/History';
import Progress from './pages/Progress';
import Plans from './pages/Plans';
import Settings from './pages/Settings';
import { WorkoutProvider } from './context/WorkoutContext';
import { initializeDatabase } from './db/database';

const App: React.FC = () => {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <WorkoutProvider>
      <div className="w-full min-h-screen bg-[#fffafb] flex flex-col selection:bg-[#FF2625] selection:text-white">
        <Navbar />
        <main className="flex-grow max-w-[1488px] w-full mx-auto px-2 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/exercises" element={<ExercisesPage />} />
            <Route path="/exercise/:id" element={<ExerciseDetail />} />
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <RestTimerFloating />
        <Footer />
      </div>
    </WorkoutProvider>
  );
};

export default App;