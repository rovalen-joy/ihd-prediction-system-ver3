import React, { useRef, useState } from 'react';
import axios from 'axios';
import ModalSave from '../Modal/ModalSave';
import ModalNew from '../Modal/ModalNew';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  Timestamp,
  runTransaction,
  doc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { UserAuth } from '../../context/AuthContext';
import {
  FaArrowRight,
  FaArrowLeft,
  FaUserMd,
  FaHeart,
  FaCheckCircle,
} from 'react-icons/fa';

// Utility function to check if all required fields have values
function hasAllValues(obj) {
  const requiredFields = [
    'lastname',
    'firstname',
    'age',
    'sex',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'cholesterol_level',
    'smoker',
    'BMI', // Added BMI as a required field
  ];
  return requiredFields.every((field) => obj[field] && obj[field] !== '');
}

const PredictionForm = () => {
  // Default state for form details
  const defaultDetails = {
    lastname: '',
    firstname: '',
    age: '',
    sex: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    cholesterol_level: '',
    smoker: '',
    BMI: '', // Added BMI
  };

  // Access the authenticated user from AuthContext
  const { user } = UserAuth();

  // Modal visibility states
  const [modalNew, setModalNew] = useState(false);
  const [modalSave, setModalSave] = useState(false);

  // Prediction results and form details
  const [results, setResults] = useState('');
  const [details, setDetails] = useState(defaultDetails);

  // Reference to the form for resetting
  const formRef = useRef(null);

  // Current step state (1: Personal Details, 2: Medical Details, 3: Prediction Results)
  const [currentStep, setCurrentStep] = useState(1);

  // Reference to prevent multiple submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission to get prediction results
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    // Validate that BMI is a positive number
    const bmiValue = parseFloat(details.BMI);
    if (isNaN(bmiValue) || bmiValue <= 0) {
      return toast.error('Please enter a valid BMI value.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
    }

    setIsSubmitting(true);
    const formattedDetails = {
      Sex: details.sex,
      Age: parseInt(details.age, 10),
      SystolicBP: parseInt(details.blood_pressure_systolic, 10),
      DiastolicBP: parseInt(details.blood_pressure_diastolic, 10),
      CholesterolLevel: parseInt(details.cholesterol_level, 10),
      Smoker: details.smoker,
      BMI: bmiValue, // Ensure BMI is a number
    };
    console.log('Sending data to backend:', formattedDetails);
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/predict',
        formattedDetails
      );
      console.log('Received response from backend:', response.data);

      // Ensure that the prediction is a number
      let predictionResult = response.data.prediction;
      if (typeof predictionResult === 'string') {
        // Attempt to parse percentage from string if necessary
        const parsed = parseFloat(predictionResult);
        if (!isNaN(parsed)) {
          predictionResult = parsed;
        } else {
          // Handle unexpected string format
          predictionResult = 0; // Default or handle accordingly
        }
      }

      // Optional: Validate that the prediction is within 0-100%
      if (typeof predictionResult !== 'number' || predictionResult < 0 || predictionResult > 100) {
        throw new Error('Invalid prediction result received from backend.');
      }

      setResults(predictionResult);
      setCurrentStep(3); // Move to Prediction Results step
      toast.success('Prediction completed.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
    } catch (error) {
      console.error('There was an error making the request:', error);
      toast.error('Failed to fetch prediction results.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving data to Firestore
  const handleSaveData = async () => {
    try {
      if (!hasAllValues(details)) {
        console.log('Incomplete Details:', details);
        return toast.error('Incomplete Details', {
          style: {
            fontSize: '1rem',
            padding: '0.75rem',
          },
        });
      }

      if (!user) {
        console.log('User is not authenticated.');
        return toast.error('User is not authenticated.', {
          style: {
            fontSize: '1rem',
            padding: '0.75rem',
          },
        });
      }

      toast.loading('Saving data...', {
        id: 'loadingResults',
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });

      // Transaction to ensure atomic increment of patientID
      let patientId;
      await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'counters', 'patient_count');
        const counterSnap = await transaction.get(counterRef);
        let newCount = 1;
        if (counterSnap.exists()) {
          newCount = counterSnap.data().count + 1;
        }
        transaction.set(counterRef, { count: newCount }, { merge: true });
        patientId = newCount.toString().padStart(4, '0'); // e.g., '0001'
      });

      // Create a new patient document with patientID and timestamp
      const patientsRef = collection(db, 'patients');
      const newPatientRef = await addDoc(patientsRef, {
        patientID: patientId, // Assigning unique patientID
        firstname: details.firstname,
        lastname: details.lastname,
        age: parseInt(details.age, 10),
        sex: details.sex,
        userid: user.uid,
        createdAt: Timestamp.now(), // Assigning timestamp
      });

      // Prepare record data with 'userid' and 'BMI'
      const recordData = {
        ...details,
        blood_pressure_systolic: parseInt(details.blood_pressure_systolic, 10),
        blood_pressure_diastolic: parseInt(details.blood_pressure_diastolic, 10),
        cholesterol_level: parseInt(details.cholesterol_level, 10),
        BMI: parseFloat(details.BMI),
        timestamp: Timestamp.now(),
        risk_result: results, // Ensure this is a number
        userid: user.uid, // Adding 'userid' for querying
      };
      console.log('Saving record data:', recordData);

      // Save the record in the 'records' subcollection
      const recordsRef = collection(db, 'patients', newPatientRef.id, 'records');
      await addDoc(recordsRef, recordData);

      toast.dismiss('loadingResults');
      toast.success('Saved Successfully', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });

      handleResetForm();
    } catch (err) {
      console.error('Error in handleSaveData:', err);
      toast.error(err.message || 'Failed to save patient data.', {
        style: {
          fontSize: '1rem',
          padding: '0.75rem',
        },
      });
      toast.dismiss('loadingResults');
    }
  };

  // Reset the form and state
  const handleResetForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
    setDetails(defaultDetails);
    setResults('');
    setCurrentStep(1);
  };

  // If the user is not authenticated, prompt to log in
  if (!user) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <h2 className='text-lg font-bold text-gray-700'>
            Please log in to use the Prediction Form.
          </h2>
        </div>
      </div>
    );
  }

  // Render Step 1: Personal Details
  const renderStepOne = () => (
    <div className='bg-white rounded-lg shadow-lg border-2 border-gray-200 px-8 py-6'>
      <div className='flex items-center mb-4'>
        <FaUserMd className='text-[#00717A] mr-2 text-xl' />
        <span className='text-[#00717A] font-bold text-lg'>Step 1: Patient's Personal Details</span>
      </div>
      <hr className='border-gray-300 my-4' />
      <p className='text-gray-600 mb-4'>
        Please enter the patient's personal information to proceed to the medical details.
      </p>
      <form
        ref={formRef}
        className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-6'
      >
        {/* Last Name */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Patient's Last Name:
          </label>
          <input
            type='text'
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='lastname'
            value={details.lastname}
            onChange={handleFormChange}
            required
            placeholder='Enter last name'
          />
        </div>

        {/* First Name */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Patient's First Name:
          </label>
          <input
            type='text'
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='firstname'
            value={details.firstname}
            onChange={handleFormChange}
            required
            placeholder='Enter first name'
          />
        </div>

        {/* Age */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Patient's Age:
          </label>
          <input
            type='number'
            min='0'
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='age'
            value={details.age}
            onChange={handleFormChange}
            required
            placeholder='Enter age'
          />
        </div>

        {/* Sex */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>Patient's Sex:</label>
          <select
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            onChange={handleFormChange}
            required
            name='sex'
            value={details.sex}
          >
            <option value='' disabled>
              Select
            </option>
            <option value='Male'>Male</option>
            <option value='Female'>Female</option>
            <option value='Other'>Other</option>
          </select>
        </div>

        {/* Next Button */}
        <div className='flex justify-end col-span-1 md:col-span-2'>
          <button
            type='button'
            onClick={() => {
              // Validate Step 1 fields before proceeding
              const { firstname, lastname, age, sex } = details;
              if (!firstname || !lastname || !age || !sex) {
                return toast.error('Please fill all patient personal details.', {
                  style: {
                    fontSize: '1rem',
                    padding: '0.75rem',
                  },
                });
              }
              setCurrentStep(2);
            }}
            className='bg-[#00717A] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#005f61] flex items-center transition-colors duration-200'
            aria-label="Proceed to Medical Details"
          >
            Next <FaArrowRight className='ml-2' />
          </button>
        </div>
      </form>
    </div>
  );

  // Render Step 2: Medical Details
  const renderStepTwo = () => (
    <div className='bg-white rounded-lg shadow-lg border-2 border-gray-200 px-8 py-6'>
      <div className='flex items-center mb-4'>
        <FaHeart className='text-[#00717A] mr-2 text-xl' />
        <span className='text-[#00717A] font-bold text-lg'>Step 2: Patient's Medical Details</span>
      </div>
      <hr className='border-gray-300 my-4' />
      <p className='text-gray-600 mb-4'>
        Please provide the patient's medical information to receive an accurate prediction.
      </p>
      <form
        ref={formRef}
        className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        onSubmit={handleSubmit}
      >
        {/* Systolic Blood Pressure */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Systolic Blood Pressure:
          </label>
          <input
            type='number'
            min='0'
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='blood_pressure_systolic'
            value={details.blood_pressure_systolic}
            onChange={handleFormChange}
            required
            placeholder='Enter systolic blood pressure'
          />
        </div>

        {/* Diastolic Blood Pressure */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Diastolic Blood Pressure:
          </label>
          <input
            type='number'
            min='0'
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='blood_pressure_diastolic'
            value={details.blood_pressure_diastolic}
            onChange={handleFormChange}
            required
            placeholder='Enter diastolic blood pressure'
          />
        </div>

        {/* Cholesterol Level */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Cholesterol Level:
          </label>
          <input
            type='number'
            min='0'
            step='0.01' // Allows decimal values
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='cholesterol_level'
            value={details.cholesterol_level}
            onChange={handleFormChange}
            required
            placeholder='Enter cholesterol level'
          />
        </div>

        {/* BMI */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            BMI:
          </label>
          <input
            type='number'
            min='0'
            step='0.01' // Allows decimal values
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            name='BMI'
            value={details.BMI}
            onChange={handleFormChange}
            required
            placeholder='Enter BMI'
          />
        </div>

        {/* Smoker */}
        <div className='flex flex-col'>
          <label className='text-gray-700 font-semibold text-sm mb-1'>
            Smoker:
          </label>
          <select
            className='bg-gray-100 h-10 rounded-sm px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00717A]'
            onChange={handleFormChange}
            name='smoker'
            required
            value={details.smoker}
          >
            <option value='' disabled>
              Select
            </option>
            <option value='Yes'>Yes</option>
            <option value='No'>No</option>
          </select>
        </div>

        {/* Back Button */}
        <div className='flex justify-start col-span-1 md:col-span-2 lg:col-span-3'>
          <button
            type='button'
            onClick={() => setCurrentStep(1)}
            className='bg-[#00717A] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#005f61] flex items-center transition-colors duration-200'
            aria-label="Go Back to Personal Details"
          >
            <FaArrowLeft className='mr-2' /> Back
          </button>
        </div>

        {/* Submit Button */}
        <div className='flex justify-end col-span-1 md:col-span-2 lg:col-span-3'>
          <button
            type='submit'
            className='bg-[#00717A] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#005f61] flex items-center transition-colors duration-200'
            aria-label="Run Prediction"
          >
            Run Prediction <FaArrowRight className='ml-2' />
          </button>
        </div>
      </form>
    </div>
  );

  // Render Step 3: Prediction Results
  const renderStepThree = () => (
    <div className='bg-white rounded-lg shadow-lg border-2 border-gray-200 px-8 py-6'>
      <div className='flex items-center mb-4'>
        <FaCheckCircle className='text-[#28a745] mr-2 text-xl' />
        <span className='text-[#28a745] font-bold text-lg'>Step 3: Prediction Results</span>
      </div>
      <hr className='border-gray-300 my-4' />
      <div className='flex items-center mb-6'>
        <FaHeart className='text-[#00717A] mr-2 text-xl' />
        <span className='text-gray-700 font-medium text-lg'>
          The patient has a <strong>{typeof results === 'number' ? `${results.toFixed(2)}%` : results}</strong> risk for Ischemic Heart Disease.
        </span>
      </div>
      <div className='flex justify-end gap-4'>
        <button
          onClick={() => setModalSave(true)}
          type='button'
          className='bg-[#00717A] rounded-md text-white font-semibold px-6 py-2 text-sm hover:bg-[#005f61] focus:outline-none focus:ring-2 focus:ring-[#005f61] transition-colors duration-200'
          aria-label="Save Prediction"
        >
          Save
        </button>
        <button
          onClick={() => setModalNew(true)}
          type='button'
          className='bg-[#00717A] rounded-md text-white font-semibold px-6 py-2 text-sm hover:bg-[#005f61] focus:outline-none focus:ring-2 focus:ring-[#005f61] transition-colors duration-200'
          aria-label="Enter New Data"
        >
          Enter New Data
        </button>
      </div>
    </div>
  );

  return (
    <div className='flex justify-center flex-col gap-6 mt-4 pt-6 pb-10 px-4 md:px-10 lg:px-20'>
      {/* Header */}
      <div className='flex justify-center'>
        <h1 className='text-2xl md:text-3xl lg:text-4xl text-[#00717A] font-bold uppercase'>
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>

      {/* Instruction Text */}
      <div className='text-center'>
        <p className='text-gray-600 text-sm md:text-base'>
          Please complete the form below to receive a prediction on the patient's risk for Ischemic Heart Disease. The form is divided into three steps: Personal Details, Medical Details, and Prediction Results. Ensure all required fields are filled out accurately.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className='flex justify-center mb-6'>
        <div className='flex items-center'>
          {/* Step 1 */}
          <div className='flex items-center'>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-[#00717A] text-white' : 'bg-gray-400 text-white'}`}>
              <FaUserMd />
            </div>
            <div className={`w-16 h-1 ${currentStep > 1 ? 'bg-[#00717A]' : 'bg-gray-400'}`}></div>
          </div>
          {/* Step 2 */}
          <div className='flex items-center'>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-[#00717A] text-white' : 'bg-gray-400 text-white'}`}>
              <FaHeart />
            </div>
            <div className={`w-16 h-1 ${currentStep > 2 ? 'bg-[#00717A]' : 'bg-gray-400'}`}></div>
          </div>
          {/* Step 3 */}
          <div className='flex items-center'>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-[#28a745] text-white' : 'bg-gray-400 text-white'}`}>
              <FaCheckCircle />
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Form Steps */}
      {currentStep === 1 && renderStepOne()}
      {currentStep === 2 && renderStepTwo()}
      {currentStep === 3 && renderStepThree()}

      {/* Modal Components */}
      {modalSave && (
        <ModalSave setModalSave={setModalSave} handleSaveData={handleSaveData} />
      )}
      {modalNew && (
        <ModalNew setModalNew={setModalNew} handleResetForm={handleResetForm} />
      )}
    </div>
  );
};

export default PredictionForm;