import React, { useState } from 'react';
import './index.css';
import { UserAuth } from '../../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdLogout, MdMenu, MdClose } from 'react-icons/md'; 
import { FaUser } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const NavigationBar = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const onLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast.success('Logged out successfully.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('Failed to logout. Please try again.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className='bg-[#00717A] flex justify-between items-center py-4 px-4 shadow-sm'>
        {/* Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className='text-white focus:outline-none focus:ring-2 focus:ring-white rounded'
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        {/* User Info and Logout  */}
        <div className='hidden md:flex items-center gap-2'>
          {user && (
            <div className='text-white flex items-center gap-1 text-base'>
              <FaUser size={18} />
              {user.email}
            </div>
          )}

          <button
            className='text-white flex items-center gap-1 text-base hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white'
            onClick={onLogout}
            aria-label="Logout"
          >
            <MdLogout size={20} />
            Logout
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={closeSidebar}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#00717A] text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className='flex flex-col h-full'>
          {/* Sidebar Header */}
          <div className='flex items-center justify-between p-4 border-b border-[#005f61]'>
            <h2 className='text-xl font-semibold'>Menu</h2>
            <button
              onClick={toggleSidebar}
              className='text-white focus:outline-none focus:ring-2 focus:ring-white rounded'
              aria-label="Close menu"
            >
              <MdClose size={24} />
            </button>
          </div>

          {/* Sidebar Links */}
          <nav className='flex-1 p-4'>
            <ul className='space-y-4'>
              <li>
                <NavLink
                  to='/prediction-table'
                  className={({ isActive }) =>
                    isActive
                      ? 'block bg-white text-[#00717A] rounded px-3 py-2 font-medium'
                      : 'block hover:bg-[#005f61] rounded px-3 py-2 font-medium'
                  }
                  onClick={closeSidebar}
                >
                  Patients Record
                </NavLink>
              </li>
              <li>
                <NavLink
                  to='/prediction-form'
                  className={({ isActive }) =>
                    isActive
                      ? 'block bg-white text-[#00717A] rounded px-3 py-2 font-medium'
                      : 'block hover:bg-[#005f61] rounded px-3 py-2 font-medium'
                  }
                  onClick={closeSidebar}
                >
                  Prediction
                </NavLink>
              </li>
              <li>
                <NavLink
                  to='/about-us'
                  className={({ isActive }) =>
                    isActive
                      ? 'block bg-white text-[#00717A] rounded px-3 py-2 font-medium'
                      : 'block hover:bg-[#005f61] rounded px-3 py-2 font-medium'
                  }
                  onClick={closeSidebar}
                >
                  About Us
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default NavigationBar;