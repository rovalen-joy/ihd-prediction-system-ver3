import React, { useState } from 'react';
import './Sign_Up.css';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser } from 'react-icons/fa6';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import logo from '../../assets/logo.svg';

const SignUp = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  }); // hold user input data for email, password, and confirmation of password

  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const { createUser } = UserAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => {
      return { ...prev, [name]: value };
    });

    if (name === 'password') {
      updatePasswordCriteria(value);
    }
  };

  const updatePasswordCriteria = (password) => {
    setPasswordCriteria({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    });
  };

  const validatePassword = (password) => {
    const { minLength, hasUpperCase, hasLowerCase, hasNumber } = passwordCriteria;

    if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      return 'Password does not meet the required criteria.';
    }

    return null;
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    const errorMessage = validatePassword(credentials.password);
    if (errorMessage) {
      return toast.error(errorMessage);
    }

    if (credentials.password !== credentials.confirmPassword) {
      return toast.error('Password does not match');
    }

    try {
      toast.loading('loading..', { id: 'signup_loading' });

      await createUser(credentials.email, credentials.password);

      toast.dismiss('signup_loading');
      navigate('/prediction-form');
    } catch (e) {
      toast.dismiss('signup_loading');
      console.log(e.message);
      toast.error(e.message);
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className='bg-cover bg-center h-screen flex items-center justify-center bg-login'>
      <div className='bg-white px-[7rem] py-[1rem] rounded-2xl flex flex-col justify-center items-center' style={{ width: '540px' }}>
        <img src={logo} alt='logo' className='w-36 h-36 mb-1' /> {/* Logo preserved */}
        <h1 className='text-3xl font-[400] text-[#353535] mb-1'>Sign Up</h1> {/* Reduced margin bottom */}
        <h1 className='text-lg mt-1 font-[300] text-[#353535]'>
          Create your account
        </h1>
        <form
          onSubmit={onSubmitForm}
          className='flex flex-col gap-1 mt-4 w-full' 
        >
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Email:
            </label>
            <input
              type='text'
              name='email'
              onChange={handleFormChange}
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
            />
            <FaUser
              size={18}
              color='#979797'
              className='absolute bottom-[.3rem] right-[.2rem]'
            />
          </div>
          <div className='flex flex-col relative'>
            <label htmlFor='password' className='text-primary font-semibold'>
              Password:
            </label>
            <input
              type={!passwordShown ? 'password' : 'text'}
              onChange={handleFormChange}
              name='password'
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
            />
            {!passwordShown ? (
              <IoEyeOff
                size={18}
                color='#979797'
                onClick={togglePasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem]'
              />
            ) : (
              <IoEye
                size={18}
                color='#979797'
                onClick={togglePasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem]'
              />
            )}
          </div>
          <div className='text-sm mt-1'>
            <p className={passwordCriteria.minLength ? 'text-green-600' : 'text-red-600'}>
              At least 8 characters long
            </p>
            <p className={passwordCriteria.hasUpperCase ? 'text-green-600' : 'text-red-600'}>
              At least one uppercase letter
            </p>
            <p className={passwordCriteria.hasLowerCase ? 'text-green-600' : 'text-red-600'}>
              At least one lowercase letter
            </p>
            <p className={passwordCriteria.hasNumber ? 'text-green-600' : 'text-red-600'}>
              At least one number
            </p>
          </div>
          <div className='flex flex-col relative'>
            <label htmlFor='confirmPassword' className='text-primary font-semibold'>
              Confirm Password:
            </label>
            <input
              type={!confirmPasswordShown ? 'password' : 'text'}
              onChange={handleFormChange}
              name='confirmPassword'
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
            />
            {!confirmPasswordShown ? (
              <IoEyeOff
                size={18}
                color='#979797'
                onClick={toggleConfirmPasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem]'
              />
            ) : (
              <IoEye
                size={18}
                color='#979797'
                onClick={toggleConfirmPasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem]'
              />
            )}
          </div>
          <button
            className='bg-[#05747F] text-base py-2 rounded-md font-medium my-[1rem] text-white'
            type='submit'
          >
            Sign Up
          </button>
        </form>
        <div className='text-sm flex gap-1 mt-2 mb-2'>
          Already have an account?
          <span
            onClick={handleLogin}
            className='text-[#23929D] font-semibold cursor-pointer'
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default SignUp;