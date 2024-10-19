import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { UserAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.svg';
import { FaUser } from 'react-icons/fa6';
import { IoEyeOff, IoEye } from 'react-icons/io5';

const Login = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const { signIn } = UserAuth(); 
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const navigateSignUp = () => {
    navigate('/signup');
  };

  const navigateForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      toast.loading('Loading...', { id: 'login_loading' });
      await signIn(email, password);
      toast.dismiss('login_loading');
      navigate('/home');
    } catch (e) {
      toast.error('Invalid email or password');
      toast.dismiss('login_loading');
    }
  };

  return (
    <div className='bg-cover bg-center h-screen flex items-center justify-center bg-login'>
      <div className='bg-white px-[9.5rem] py-[2rem] rounded-2xl flex flex-col justify-center items-center'>
        <img src={logo} alt='logo' className='w-32 h-32 mb-2' />
        <h1 className='text-4xl font-[400] text-[#353535]'>Welcome Back!</h1>

        <form className='flex flex-col gap-4 mt-10 w-[18rem]' onSubmit={handleSubmit}>
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Email:
            </label>
            <input
              id='email'
              type='email' 
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder='Enter your email'
            />
            <FaUser
              size={20}
              color='#979797'
              className='absolute bottom-[.3rem] right-[.2rem]'
            />
          </div>
          <div className='flex flex-col relative'>
            <label htmlFor='password' className='text-primary font-semibold'>
              Password:
            </label>
            <input
              id='password'
              type={passwordShown ? 'text' : 'password'}
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='Enter your password'
            />
            {passwordShown ? (
              <IoEye
                size={20}
                color='#979797'
                onClick={togglePasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem] cursor-pointer'
              />
            ) : (
              <IoEyeOff
                size={20}
                color='#979797'
                onClick={togglePasswordVisibility}
                className='absolute bottom-[.3rem] right-[.2rem] cursor-pointer'
              />
            )}
          </div>
          <button
            className='bg-[#05747F] text-base py-3 rounded-md font-medium my-[2rem] text-white'
            type='submit'
          >
            Login
          </button>
        </form>
        <div className='text-sm flex flex-col items-center'>
          <span>
            Don’t have an account?{' '}
            <span
              className='text-[#23929D] font-semibold cursor-pointer'
              onClick={navigateSignUp}
            >
              Sign up
            </span>
          </span>
          <span
            className='text-[#23929D] font-semibold cursor-pointer mt-2'
            onClick={navigateForgotPassword}
          >
            Forgot password?
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
