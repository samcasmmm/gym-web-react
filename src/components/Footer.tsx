import React from 'react';
import Logo from '../assets/images/Logo-1.png';

const Footer: React.FC = () => {
  return (
    <footer className='mt-20 bg-[#FFF3F4] border-t border-[#ffe0e3]'>
      <div className='flex flex-col items-center gap-6 px-10 pt-8 pb-10'>
        <img src={Logo} alt='Logo' className='w-40 h-10 object-contain' />
        <p className='text-xl text-gray-700'>
          Made By <span className='text-[#FF2625] text-2xl font-bold tracking-wide'>Sameer</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
