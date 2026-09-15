import React from 'react';
import bannerImg from '../assets/images/banner.png';

const HeroBanners: React.FC = () => {
  return (
    <section className='relative mt-16 sm:mt-24 lg:mt-32 p-5 sm:ml-12'>
      <p className='text-[#FF2625] font-semibold text-2xl sm:text-3xl tracking-wide'>Fitness Club</p>

      <h1 className='font-bold text-4xl sm:text-5xl lg:text-[44px] text-gray-900 mt-6 mb-5 leading-tight'>
        Sweat, Smile <br /> and Repeat
      </h1>

      <p className='text-xl sm:text-2xl text-gray-600 leading-9 mb-8 max-w-lg'>
        Check out the most effective exercises tailored for your strength and health goals.
      </p>

      <a
        href='#exercises'
        className='inline-block bg-[#FF2625] hover:bg-[#e0201f] text-white font-semibold text-lg px-8 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer'
      >
        Explore Exercises
      </a>

      <span
        aria-hidden='true'
        className='hidden lg:block font-bold text-[#FF2625] opacity-10 text-[180px] select-none pointer-events-none -mt-10 tracking-widest'
      >
        Exercise
      </span>

      <img
        src={bannerImg}
        alt='Gym Banner'
        className='hidden lg:block absolute right-8 top-0 w-150 xl:w-175 -mt-52 object-contain select-none pointer-events-none drop-shadow-xl'
      />
    </section>
  );
};

export default HeroBanners;
