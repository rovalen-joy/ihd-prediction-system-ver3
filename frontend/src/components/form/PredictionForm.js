import React, { useRef, useState } from 'react'
import ModalSave from '../Modal/ModalSave'
import ModalNew from '../Modal/ModalNew'
import { db } from '../../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import { UserAuth } from '../../context/AuthContext'

function isSusceptible() {

  return Math.random() < 0.5 ? 'Susceptible' : 'Not Susceptible';
}

function hasAllValues(obj) {
  const values = Object.values(obj)

  return values.every((value) => value !== '' && !!value)
}

const PredictionForm = () => {
  const defaultDetails = {
    lastname: '',
    firstname: '',
    age: '',
    sex: 'Male',
    bmi: '',
    blood_pressure: '',
    cholesterol_level: '',
    history_of_stroke: 'Yes',
    history_of_diabetes: 'Yes',
    alcohol_consumption_status: 'Drinker',
    smoker: 'Yes',
    engage_physical_activities: 'Yes',
  }

  const { user } = UserAuth()

  const [modalNew, setModalNew] = useState(false)
  const [modalSave, setModalSave] = useState(false)

  const [results, setResults] = useState('')
  const [details, setDetails] = useState(defaultDetails)
  const [showResults, setShowResults] = useState(false)

  const formRef = useRef(null)

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setDetails((prev) => {
      return { ...prev, [name]: value }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(details)
    setResults(isSusceptible())
    setShowResults(true)
  }

  const handleSaveData = async () => {
    try {
      toast.loading('loading...', { id: 'loadingResults' })
      await addDoc(collection(db, 'patients'), {
        ...details,
        timestamp: Timestamp.now(),
        userid: user.uid,
        risk_result: results,
      })
      toast.dismiss('loadingResults')
      toast.success('Saved Successfully')
      handleResetForm()
    } catch (err) {
      toast.error(err)
      toast.dismiss('loadingResults')
    }
  }

  const handleResetForm = () => {
    formRef.current.reset()
    setDetails(defaultDetails)
    setShowResults(false)
  }

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
          <div className=' col-span-1 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Age:
            </label>
            <input
              type='number'
              className='bg-white h-10 rounded-md'
              name='age'
              onChange={handleFormChange}
              required
            />
          </div>
          <div className=' col-span-2 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Sex:
            </label>

            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              required
              name='sex'
            >
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
            </select>
          </div>
          <div className=' col-span-1 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              BMI:
            </label>
            <input
              type='number'
              step='0.01'
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='bmi'
              required
            />
          </div>
          <div className=' col-span-8 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Patient’s Blood Pressure:
            </label>
            <div className='flex w-full gap-2'>
              <input
                type='text'
                className='bg-white h-10 rounded-md w-full'
                onChange={handleFormChange}
                name='blood_pressure'
                required
              />
              <div className='bg-[#15545A] text-white px-6 flex items-end pb-2  text-xs rounded-md'>
                <span>mmHg</span>
              </div>
            </div>
          </div>
          
          <div className='col-span-6 flex flex-col'>
            <label className='text-white font-semibold text-xl ms-3'>
              Patient’s Cholesterol Level:
            </label>
          <div className='flex w-full gap-2'>
            <input
              type='text'
                className='bg-white h-10 rounded-md w-full'
                onChange={handleFormChange}
                name='cholesterol_level'
                required
              />
              <div className='bg-[#15545A] text-white px-6 flex items-end pb-2 text-xs rounded-md'>
                <span>mg/dL</span>
              </div>
            </div>
          </div>

          <div className=' col-span-3 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Have history of stroke?
            </label>
            
            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='history_of_stroke'
              required
            >
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>

          <div className='col-span-3 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Have history of diabetes?
            </label>

            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='history_of_diabetes'
              required
            >
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>

          <div className=' col-span-5 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Alcohol consumption status:
            </label>

            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='alcohol_consumption_status'
              required
            >
              <option value='Drinker'>Drinker</option>
              <option value='Non-Drinker'>Non-Drinker</option>
            </select>
          </div>
          <div className=' col-span-2 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Smoker?
            </label>

            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='smoker'
              required
            >
              <option value='Yes'>Yes</option>
              <option value='No'>No</option>
            </select>
          </div>
          <div className=' col-span-5 flex flex-col'>
            <label className=' text-white font-semibold text-xl ms-3'>
              Engage Physical Activities?
            </label>

            <select
              className='bg-white h-10 rounded-md'
              onChange={handleFormChange}
              name='engage_physical_activities'
              required
            >
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
              return toast.error('Incomplete Details')
            }
            setModalSave(true)
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
  )
}

export default PredictionForm