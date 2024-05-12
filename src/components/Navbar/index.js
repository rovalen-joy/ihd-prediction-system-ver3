import React from 'react'
import './index.css'
import { UserAuth } from '../../context/AuthContext'
import { NavLink, useNavigate } from 'react-router-dom'
import { MdLogout } from 'react-icons/md'
import { FaUser } from 'react-icons/fa6'
const NavigationBar = () => {
  const { user, logout } = UserAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }
  return (
    <nav className=' bg-[#00717A] flex justify-between py-4 px-6'>
      <div className='flex items-center gap-2'>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'text-[#00717A] bg-white rounded-md font-medium text-lg  p-2'
              : 'text-white text-lg  p-2'
          }
          to={'/prediction-table'}
        >
          Results History
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            isActive
              ? 'text-[#00717A] bg-white rounded-md font-medium text-lg  p-2'
              : 'text-white text-lg  p-2'
          }
          to={'/prediction-form'}
        >
          Prediction
        </NavLink>
      </div>
      <div className=' flex items-center gap-4'>
        <div className='text-white flex  items-center gap-2 text-lg'>
          <FaUser /> Welcome, {user && user?.email}
        </div>

        <button
          className='text-white flex  items-center gap-2 text-lg'
          onClick={onLogout}
        >
          <MdLogout />
          Logout
        </button>
      </div>
    </nav>
  )
}

export default NavigationBar
