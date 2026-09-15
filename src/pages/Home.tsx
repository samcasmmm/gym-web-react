import React, { useState } from 'react';
import HeroBanners from '../components/HeroBanners';
import SearchExercises from '../components/SearchExercises';
import Exercises from '../components/Exercises';

const Home: React.FC = () => {
  const [bodyPart, setBodyPart] = useState('all');
  const [search, setSearch] = useState('');

  return (
    <div className="w-full">
      <HeroBanners />
      <SearchExercises
        bodyPart={bodyPart}
        setBodyPart={setBodyPart}
        onSearch={setSearch}
      />
      <Exercises
        bodyPart={bodyPart}
        search={search}
      />
    </div>
  );
};

export default Home;
