import React, { useRef, useState } from 'react';
import axios from 'axios';
import ModalSave from '../Modal/ModalSave';
import ModalNew from '../Modal/ModalNew';
import { db } from '../../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { UserAuth } from '../../context/AuthContext';

function hasAllValues(obj) {
  const requiredFields = ['lastname', 'firstname', 'sex', 'blood_pressure', 'cholesterol_level', 'history_of_stroke', 'history_of_diabetes', 'smoker'];
  return requiredFields.every(field => obj[field] && obj[field] !== '');
}

const PredictionForm = () => {
  const defaultDetails = {
    lastname: '',
    firstname: '',
    sex: '',
    blood_pressure: '',
    cholesterol_level: '',
    history_of_stroke: '',
    history_of_diabetes: '',
    smoker: '',
  };

  const { user } = UserAuth();

  const [modalNew, setModalNew] = useState(false);
  const [modalSave, setModalSave] = useState(false);

  const [results, setResults] = useState('');
  const [details, setDetails] = useState(defaultDetails);
  const [showResults, setShowResults] = useState(false);

  const formRef = useRef(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedDetails = {
      Sex: details.sex,
      HighBP: details.blood_pressure,
      HighChol: details.cholesterol_level,
      Stroke: details.history_of_stroke,
      Diabetes: details.history_of_diabetes,
      Smoker: details.smoker
    };
    console.log('Sending data to backend:', formattedDetails);
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', formattedDetails);
      console.log('Received response from backend:', response.data);
      setResults(response.data.prediction);
      setShowResults(true);
    } catch (error) {
      console.error('There was an error making the request:', error);
    }
  };
  

  const handleSaveData = async () => {
    try {
      if (!hasAllValues(details)) {
        return toast.error('Incomplete Details');
      }
      toast.loading('loading...', { id: 'loadingResults' });
      await addDoc(collection(db, 'patients'), {
        ...details,
        timestamp: Timestamp.now(),
        userid: user.uid,
        risk_result: results,
      });
      toast.dismiss('loadingResults');
      toast.success('Saved Successfully');
      handleResetForm();
    } catch (err) {
      toast.error(err.message);
      toast.dismiss('loadingResults');
    }
  };

  const handleResetForm = () => {
    formRef.current.reset();
    setDetails(defaultDetails);
    setShowResults(false);
  };

  return (
    <div className='flex justify-center flex-col gap-4 mt-6 pt-4 pb-8 px-[10rem]'>
      <div className='flex justify-center'>
        <h1 className=' text-4xl text-[#00717A] font-bold uppercase'>
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>
      <div className='bg-gradient-to-r from-[#2DB4C0] to-[#145459] p-2 rounded-md text-end px-[3rem]'>
        <span className=' text-white font-medium text-2xl'>
          Prediction for Patient 0001
        </span>
      </div>
      <div className=' bg-[#00717A] rounded-md px-[3rem] py-8'>
        <span className='text-white font-bold text-2xl'>
          Enter Attributes for Prediction
        </span>
        <hr className=' bg-white h-[.10rem] my-2' />
        <form
          ref={formRef}
          className='mt-6 px-8 grid grid-cols-12 gap-3'
          onSubmit={handleSubmit}
        >
          <div className=' col-span-6 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Last Name:
            </label>
            <input
              type='text'
              className='bg-white h-10 rounded-md'
              name='lastname'
              onChange={handleFormChange}
              required
            />
          </div>
          <div className=' col-span-6 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              First Name:
            </label>
            <input
              type='text'
              className='bg-white h-10 rounded-md'
              name='firstname'
              onChange={handleFormChange}
              required
            />
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Sex:
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              required
              name='sex'
            >
              <option value='' disabled selected>Select</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Patient’s Blood Pressure:
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              required
              name='blood_pressure'
            >
              <option value='' disabled selected>Select</option>
              <option value='Low'>Low</option>
              <option value='High'>High</option>
            </select>
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Patient’s Cholesterol Level:
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              required
              name='cholesterol_level'
            >
              <option value='' disabled selected>Select</option>
              <option value='Low'>Low</option>
              <option value='High'>High</option>
            </select>
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Have history of stroke?
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='history_of_stroke'
              required
            >
              <option value='' disabled selected>Select</option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Have history of diabetes?
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='history_of_diabetes'
              required
            >
              <option value='' disabled selected>Select</option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>
          <div className='col-span-4 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Smoker?
            </label>
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='smoker'
              required
            >
              <option value='' disabled selected>Select</option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>
          <div className=' col-span-12 flex justify-center mt-10'>
            <button
              type='submit'
              className='w-auto border-4 border-white text-white hover:bg-[#239a98] text-xl py-2 bg-[#042B2F] rounded-full font-semibold px-8'
            >
              Run Results
            </button>
          </div>
        </form>
      </div>
      {showResults && (
        <div className=' bg-[#00717A] rounded-md px-[3rem] py-8'>
        <span className='text-white font-bold text-2xl'>Results</span>
        <hr className=' bg-white h-[.10rem] my-4' />
        <span className='text-white font-[400] text-xl'>
          The patient is {results} for Ischemic Heart Disease.
        </span>
      </div>
    )}
    <div className=' flex justify-end gap-3'>
      <button
        onClick={() => {
          if (!hasAllValues(details)) {
            return toast.error('Incomplete Details');
          }
          setModalSave(true);
        }}
        type='button'
        className=' bg-[#00717A] rounded-md text-white font-semibold px-6 py-2 text-xl hover:bg-[#239a98]'
      >
        Save
      </button>
      <button
        onClick={() => setModalNew(true)}
        type='button'
        className=' bg-[#00717A] rounded-md text-white font-semibold px-6 py-2 text-xl hover:bg-[#239a98]'
      >
        Enter New Data
      </button>
    </div>
    {modalSave && (
      <ModalSave
        setModalSave={setModalSave}
        handleSaveData={handleSaveData}
      />
    )}
    {modalNew && (
      <ModalNew setModalNew={setModalNew} handleResetForm={handleResetForm} />
    )}
  </div>
);
};

export default PredictionForm