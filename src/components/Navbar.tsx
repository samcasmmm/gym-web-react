import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="flex flex-row items-center gap-10 sm:gap-28 mt-5 sm:mt-8 px-5 py-2">
      <Link to="/" className="shrink-0 transition-transform hover:scale-105">
        <img
          src={Logo}
          alt="Golds Gym Logo"
          className="w-12 h-12 object-contain"
        />
      </Link>
      <nav className="flex flex-row items-end gap-10 text-2xl font-medium">
        <Link
          to="/"
          className={`transition-colors text-[#3A1212] ${
            isHome ? 'border-b-4 border-[#FF2625] font-semibold' : 'hover:text-[#FF2625]'
          }`}
        >
          Home
        </Link>
        <a
          href="/#exercises"
          className="text-[#3A1212] hover:text-[#FF2625] transition-colors"
        >
          Exercises
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
