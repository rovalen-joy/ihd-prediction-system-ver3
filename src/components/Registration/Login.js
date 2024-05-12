import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import logo from '../../assets/logo.svg'
import { FaUser } from 'react-icons/fa6'
import { IoEyeOff } from 'react-icons/io5'
import { IoEye } from 'react-icons/io5'
const Login = ({ switchToSignUp }) => { //to be able to switch to sign up page
  const [passwordShown, setPasswordShown] = useState(false) //toggle visibility icon of password
  const [emailFocus, setEmailFocus] = useState(false) 
  const [passwordFocus, setPasswordFocus] = useState(false) //
  const [email, setEmail] = useState('') //store email input
  const [password, setPassword] = useState('') //store password input
  const [loginError, setLoginError] = useState('') //store any login errors
  const { signIn } = UserAuth()
  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown)
  }

  const navigateSignUp = () => {// to navigate to sign up page
    navigate('/signup')
  }

  // handle email input changes
  const handleOnChangeEmail = (email) => {
    setEmail(email)
  }

  // handle password input changes
  const handleOnChangePassword = (password) => {
    setPassword(password)
  }

  //handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      // show loading
      toast.loading('loading..', { id: 'login_loading' })
      await signIn(email, password)

      // hide loading after login
      toast.dismiss('login_loading')

      // navigate to prediction form page
      navigate('/prediction-form')
    } catch (e) {
      toast.error(e.message)
      toast.dismiss('login_loading')
      console.log(e.message)
    }
  }

  console.log(email, password)
  return (
    <div className='bg-cover bg-center h-screen flex items-center justify-center bg-login'>
      <div className='bg-white px-[9.5rem] py-[2rem] rounded-2xl flex flex-col justify-center items-center'>
        <img
          src={logo}
          alt='logo'
          className='w-32 h-32 mb-2'
        />
        <h1 className='text-4xl font-[400] text-[#353535]'>Welcome Back !</h1>

        <form
          className='flex flex-col gap-4 mt-10 w-[18rem]'
          onSubmit={handleSubmit}
        >
          <div className='flex flex-col relative'>
            <label
              htmlFor='email'
              className='text-primary font-semibold'
            >
              Email:
            </label>
            <input
              type='text'
              className=' active: border-[#353535] border-b-[3px] focus-visible:outline-0'
              onChange={(e) => handleOnChangeEmail(e.target.value)}
            />
            <FaUser
              size={20}
              color='#979797'
              className=' absolute bottom-[.3rem] right-[.2rem] '
            />
          </div>
          <div className='flex flex-col relative'>
            <label
              htmlFor='email'
              className='text-primary font-semibold'
            >
              Password:
            </label>
            <input
              type={!passwordShown ? 'password' : 'text'}
              className=' active: border-[#353535] border-b-[3px]  focus-visible:outline-0'
              onChange={(e) => handleOnChangePassword(e.target.value)}
            />
            {!passwordShown ? (
              <IoEyeOff
                size={20}
                color='#979797'
                onClick={togglePasswordVisibility}
                className=' absolute bottom-[.3rem] right-[.2rem]'
              />
            ) : (
              <IoEye
                size={20}
                color='#979797'
                onClick={togglePasswordVisibility}
                className=' absolute bottom-[.3rem] right-[.2rem]'
              />
            )}
          </div>
          <button
            className=' bg-[#05747F] text-base py-3 rounded-md font-medium my-[2rem] text-white '
            type='submit'
          >
            Login
          </button>
        </form>
        <div className=' text-xs'>
          Don’t have an account?{' '}
          <span
            className=' text-[#23929D] font-semibold cursor-pointer'
            onClick={navigateSignUp}
          >
            Sign - up
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login
