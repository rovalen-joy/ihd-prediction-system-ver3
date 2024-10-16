import React, { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ModalSave from '../Modal/ModalSave';
import ModalNew from '../Modal/ModalNew';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  runTransaction,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { UserAuth } from '../../context/AuthContext';

function hasAllValues(obj) {
  const requiredFields = [
    'lastname',
    'firstname',
    'sex',
    'blood_pressure',
    'cholesterol_level',
    'history_of_stroke',
    'history_of_diabetes',
    'smoker',
  ];
  return requiredFields.every((field) => obj[field] && obj[field] !== '');
}

const PredictionForm = () => {
  // Default state for form details
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

  // Access the authenticated user from AuthContext
  const { user } = UserAuth();

  // Modal visibility states
  const [modalNew, setModalNew] = useState(false);
  const [modalSave, setModalSave] = useState(false);

  // Prediction results and form details
  const [results, setResults] = useState('');
  const [details, setDetails] = useState(defaultDetails);
  const [showResults, setShowResults] = useState(false);

  // PatientID state
  const [patientID, setPatientID] = useState(null);

  // Reference to the form for resetting
  const formRef = useRef(null);

  // Fetch or initialize the patient counter for the authenticated user
  const fetchPatientId = useCallback(async () => {
    try {
      if (!user) {
        console.log('No authenticated user found.');
        return;
      }

      console.log(`Fetching counter for UID: ${user.uid}`);
      const counterDocRef = doc(db, 'counters', user.uid); // Per-user counter
      const counterDoc = await getDoc(counterDocRef);
      if (counterDoc.exists()) {
        const current = counterDoc.data().current || 0;
        console.log(`Current counter value: ${current}`);
        setPatientID(current + 1);
      } else {
        // Initialize the counter for the user if it doesn't exist
        console.log('Counter does not exist. Initializing...');
        await setDoc(counterDocRef, { current: 0 }); // Initialize to 0
        setPatientID(1); // First patient ID
      }
    } catch (error) {
      console.error('Error fetching counter:', error);
      toast.error('Failed to initialize patient counter.', {
        style: {
          fontSize: '1rem',     
          padding: '0.75rem',   
        },
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPatientId();
    }
  }, [user, fetchPatientId]);

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
    const formattedDetails = {
      Sex: details.sex,
      HighBP: details.blood_pressure,
      HighChol: details.cholesterol_level,
      Stroke: details.history_of_stroke,
      Diabetes: details.history_of_diabetes,
      Smoker: details.smoker,
    };
    console.log('Sending data to backend:', formattedDetails);
    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/predict',
        formattedDetails
      );
      console.log('Received response from backend:', response.data);
      setResults(response.data.prediction);
      setShowResults(true);
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

      const counterDocRef = doc(db, 'counters', user.uid); // Per-user counter
      let newPatientID;

      console.log(
        `Running transaction to increment counter for UID: ${user.uid}`
      );

      // Run a transaction to increment the counter atomically
      await runTransaction(db, async (transaction) => {
        const counterDocSnap = await transaction.get(counterDocRef);
        if (!counterDocSnap.exists()) {
          throw new Error('Counter document does not exist!');
        }
        const current = counterDocSnap.data().current || 0;
        newPatientID = current + 1;
        console.log(`Current counter: ${current}, newPatientID: ${newPatientID}`);
        transaction.update(counterDocRef, { current: newPatientID });
      });

      // Prepare patient data
      const patientData = {
        ...details,
        timestamp: Timestamp.now(),
        userid: user.uid,
        risk_result: results,
        patientID: newPatientID,
      };
      console.log('Saving patient data:', patientData);

      // Save the patient data with the new PatientID
      await addDoc(collection(db, 'patients'), patientData);

      toast.dismiss('loadingResults');
      toast.success('Saved Successfully', {
        style: {
          fontSize: '1rem',     
          padding: '0.75rem',   
        },
      });

      // Update the PatientID state for the next entry
      setPatientID(newPatientID); // Set to newPatientID without adding 1
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
    setShowResults(false);
  };

  // Format PatientID with leading zeros (e.g., 0001)
  const formattedPatientID = patientID
    ? patientID.toString().padStart(4, '0')
    : '----';

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

  return (
    <div className='flex justify-center flex-col gap-4 mt-2 pt-4 pb-8 px-4 md:px-10 lg:px-20'>
      {/* Header */}
      <div className='flex justify-center'>
        <h1 className='text-lg md:text-xl lg:text-2xl text-[#00717A] font-bold uppercase'>
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>

      {/* PatientID Display */}
      <div className='bg-gradient-to-r from-[#2DB4C0] to-[#145459] p-2 rounded-sm text-end px-4 mt-2'>
        <span className='text-white font-medium text-sm md:text-base'>
          Prediction for Patient {formattedPatientID}
        </span>
      </div>

      {/* Prediction Form */}
      <div className='bg-[#00717A] rounded-sm px-4 py-6'>
        <span className='text-white font-bold text-sm md:text-base'>
          Enter Attributes for Prediction
        </span>
        <hr className='bg-white h-px my-2' />
        <form
          ref={formRef}
          className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          onSubmit={handleSubmit}
        >
          {/* Last Name */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Last Name:
            </label>
            <input
              type='text'
              className='bg-white h-10 rounded-sm px-2 text-sm'
              name='lastname'
              onChange={handleFormChange}
              required
              placeholder='Enter last name'
            />
          </div>

          {/* First Name */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              First Name:
            </label>
            <input
              type='text'
              className='bg-white h-10 rounded-sm px-2 text-sm'
              name='firstname'
              onChange={handleFormChange}
              required
              placeholder='Enter first name'
            />
          </div>

          {/* Sex */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>Sex:</label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
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
            </select>
          </div>

          {/* Blood Pressure */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Patient’s Blood Pressure:
            </label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
              onChange={handleFormChange}
              required
              name='blood_pressure'
              value={details.blood_pressure}
            >
              <option value='' disabled>
                Select
              </option>
              <option value='Low'>Low</option>
              <option value='High'>High</option>
            </select>
          </div>

          {/* Cholesterol Level */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Patient’s Cholesterol Level:
            </label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
              onChange={handleFormChange}
              required
              name='cholesterol_level'
              value={details.cholesterol_level}
            >
              <option value='' disabled>
                Select
              </option>
              <option value='Low'>Low</option>
              <option value='High'>High</option>
            </select>
          </div>

          {/* History of Stroke */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Have history of stroke?
            </label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
              onChange={handleFormChange}
              name='history_of_stroke'
              required
              value={details.history_of_stroke}
            >
              <option value='' disabled>
                Select
              </option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>

          {/* History of Diabetes */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Have history of diabetes?
            </label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
              onChange={handleFormChange}
              name='history_of_diabetes'
              required
              value={details.history_of_diabetes}
            >
              <option value='' disabled>
                Select
              </option>
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>

          {/* Smoker */}
          <div className='flex flex-col'>
            <label className='text-white font-semibold text-sm md:text-base mb-1'>
              Smoker?
            </label>
            <select
              className='bg-white h-10 rounded-sm px-2 text-sm'
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

          {/* Submit Button */}
          <div className='flex justify-center mt-4 md:col-span-2 lg:col-span-3'>
            <button
              type='submit'
              className='w-full md:w-auto border-2 border-white text-white hover:bg-[#239a98] text-sm py-2 bg-[#042B2F] rounded-full font-semibold px-4 focus:outline-none focus:ring-2 focus:ring-[#005f61]'
              aria-label="Run Prediction"
            >
              Run Results
            </button>
          </div>
        </form>
      </div>

      {/* Prediction Results */}
      {showResults && (
        <div className='bg-[#00717A] rounded-sm px-4 py-6'>
          <span className='text-white font-bold text-sm md:text-base'>Results</span>
          <hr className='bg-white h-px my-2' />
          <span className='text-white font-medium text-sm md:text-base'>
            The patient is {results} for Ischemic Heart Disease.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-2 mt-4'>
        <button
          onClick={() => {
            if (!hasAllValues(details)) {
              return toast.error('Incomplete Details', {
                style: {
                  fontSize: '1rem',    // 16px
                  padding: '0.75rem',  // 12px
                },
              });
            }
            setModalSave(true);
          }}
          type='button'
          className='bg-[#00717A] rounded-sm text-white font-semibold px-4 py-2 text-sm hover:bg-[#239a98] focus:outline-none focus:ring-2 focus:ring-[#005f61]'
          aria-label="Save Prediction"
        >
          Save
        </button>
        <button
          onClick={() => setModalNew(true)}
          type='button'
          className='bg-[#00717A] rounded-sm text-white font-semibold px-4 py-2 text-sm hover:bg-[#239a98] focus:outline-none focus:ring-2 focus:ring-[#005f61]'
          aria-label="Enter New Data"
        >
          Enter New Data
        </button>
      </div>

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
