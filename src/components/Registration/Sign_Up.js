import React, { useState } from 'react'
import './Sign_Up.css'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FaUser } from 'react-icons/fa6'
import { IoEye, IoEyeOff } from 'react-icons/io5'
import logo from '../../assets/logo.svg'

const SignUp = () => {
  const [passwordShown, setPasswordShown] = useState(false)
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false)
  const [emailFocus, setEmailFocus] = useState(false)
  const [passwordFocus, setPasswordFocus] = useState(false)
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  }) // hold user input data for email, password, and confirmation of password

  const { createUser } = UserAuth() //handles user registration

  const navigate = useNavigate()

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown)
  }

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown)
  }

  const handleFormChange = (e) => { // update state based on form inputs
    const { name, value } = e.target
    setCredentials((prev) => {
      return { ...prev, [name]: value }
    })
  }

  const onSubmitForm = async (e) => { // handle form submission
    e.preventDefault()
    try {
      if (credentials.password !== credentials.confirmPassword) { // checking if password match
        return toast.error('Password does not match')
      }

      toast.loading('loading..', { id: 'signup_loading' })

      await createUser(credentials.email, credentials.password) // create a user with the provided email and password

      toast.dismiss('signup_loading')
      navigate('/prediction-form') // will navigates to the prediction form page upon successful registration
    } catch (e) {
      toast.dismiss('signup_loading')
      console.log(e.message)
    }
  }

  const hanldleLogin = () => {// handle navigation to login
    navigate('/')
  }

  return (
    <div className='bg-cover bg-center h-screen flex items-center justify-center bg-login'>
      <div className='bg-white px-[9.5rem] py-[2rem] rounded-2xl flex flex-col justify-center items-center'> 
       <img src={logo} alt='logo' className='w-28 h-28 mb-2' /> //display logo image

        <h1 className='text-4xl font-[400] text-[#353535]'>Sign Up </h1>
        <h1 className='text-xl mt-2 font-[300] text-[#353535]'>
          Create your account
        </h1>
        <form
          onSubmit={onSubmitForm}
          className='flex flex-col gap-4 mt-10 w-[18rem] '
        >
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Email:
            </label>
            <input
              type='text'
              name='email'
              onChange={handleFormChange}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              className=' active: border-[#353535] border-b-[3px] focus-visible:outline-0'
            />
            <FaUser
              size={20}
              color='#979797'
              className=' absolute bottom-[.3rem] right-[.2rem] '
            />
          </div>
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Password:
            </label>
            <input
              type={!passwordShown ? 'password' : 'text'}
              onChange={handleFormChange}
              onFocus={() => setPasswordFocus(true)}
              onBlur={() => setPasswordFocus(false)}
              name='password'
              className=' active: border-[#353535] border-b-[3px]  focus-visible:outline-0'
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
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Confirm Password:
            </label>
            <input
              type={!confirmPasswordShown ? 'password' : 'text'}
              onChange={handleFormChange}
              name='confirmPassword'
              onFocus={() => setConfirmPasswordFocus(true)}
              onBlur={() => setConfirmPasswordFocus(false)}
              className=' active: border-[#353535] border-b-[3px]  focus-visible:outline-0'
            />
            {!confirmPasswordShown ? (
              <IoEyeOff
                size={20}
                color='#979797'
                onClick={toggleConfirmPasswordVisibility}
                className=' absolute bottom-[.3rem] right-[.2rem]'
              />
            ) : (
              <IoEye
                size={20}
                color='#979797'
                onClick={toggleConfirmPasswordVisibility}
                className=' absolute bottom-[.3rem] right-[.2rem]'
              />
            )}
          </div>
          <button
            className=' bg-[#05747F] text-base py-3 rounded-md font-medium my-[2rem] text-white '
            type='submit'
          >
            Sign Up
          </button>
        </form>
        <div className=' text-xs flex gap-1'>
          Already have an account?
          <span
            onClick={hanldleLogin}
            className=' text-[#23929D] font-semibold cursor-pointer'
          >
            Login
          </span>
        </div>
      </div>
    </div>
  )
}

export default SignUp
