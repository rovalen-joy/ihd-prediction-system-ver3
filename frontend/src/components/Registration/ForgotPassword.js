import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.svg';
import { FaEnvelope } from 'react-icons/fa6';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const { resetPassword } = UserAuth();
  const navigate = useNavigate();

  const handleOnChangeEmail = (email) => {
    setEmail(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Show loading toast
      toast.loading('Sending password reset email...', { id: 'reset_loading' });

      await resetPassword(email);

      // Dismiss loading and show success message
      toast.dismiss('reset_loading');
      toast.success('Password reset email sent! Please check your inbox.');

      // Optionally, navigate back to login after a short delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      // Dismiss loading and show error message
      toast.dismiss('reset_loading');
      console.error(error.message);
      toast.error(
        'Failed to send password reset email. Please check the email entered.'
      );
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className='bg-cover bg-center h-screen flex items-center justify-center bg-login'>
      <div className='bg-white px-[9.5rem] py-[2rem] rounded-2xl flex flex-col justify-center items-center'>
        <img src={logo} alt='logo' className='w-32 h-32 mb-2' />

        <h1 className='text-4xl font-[400] text-[#353535]'>Forgot Password</h1>
        <p className='text-center text-gray-600 mt-2'>
          Enter your email below to receive a password reset link.
        </p>

        <form
          className='flex flex-col gap-4 mt-10 w-[18rem]'
          onSubmit={handleSubmit}
        >
          <div className='flex flex-col relative'>
            <label htmlFor='email' className='text-primary font-semibold'>
              Email:
            </label>
            <input
              id='email'
              type='email' // Ensure proper email validation
              className='active:border-[#353535] border-b-[3px] focus-visible:outline-0'
              onChange={(e) => handleOnChangeEmail(e.target.value)}
              required
              placeholder='Enter your email'
            />
            <FaEnvelope
              size={20}
              color='#979797'
              className='absolute bottom-[.3rem] right-[.2rem]'
            />
          </div>
          <button
            className='bg-[#05747F] text-base py-3 rounded-md font-medium my-[2rem] text-white'
            type='submit'
          >
            Reset Password
          </button>
        </form>
        <div className='text-xs'>
          Remembered your password?{' '}
          <span
            className='text-[#23929D] font-semibold cursor-pointer'
            onClick={handleLogin}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;