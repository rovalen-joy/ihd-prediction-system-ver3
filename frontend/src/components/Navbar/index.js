import React from 'react';
import './index.css';
import { UserAuth } from '../../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';
import { FaUser } from 'react-icons/fa6';
import toast from 'react-hot-toast'; 

const NavigationBar = () => {
  const { user, logout } = UserAuth();
  const navigate = useNavigate();

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

  return (
    <nav className='bg-[#00717A] flex justify-between py-2 px-4 shadow-sm'>
      <div className='flex items-center gap-1'>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'text-[#00717A] bg-white rounded-sm font-medium text-sm p-1'
              : 'text-white text-sm p-1'
          }
          to={'/prediction-table'}
        >
          Patients Record
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'text-[#00717A] bg-white rounded-sm font-medium text-base p-1'
              : 'text-white text-base p-1'
          }
          to={'/prediction-form'}
        >
          Prediction
        </NavLink>
      </div>

      <div className='flex items-center gap-2'>
        <div className='text-white flex items-center gap-1 text-base'>
          <FaUser size={18} />
          {user && user.email}
        </div>

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
  );
};

export default NavigationBar;