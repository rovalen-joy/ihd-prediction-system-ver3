import React, { useState, useEffect } from 'react';
import { IoSearch } from 'react-icons/io5';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserAuth } from '../../context/AuthContext';

const PredictionTable = () => {
  const [patients, setPatients] = useState([]);
  const [reload, setReload] = useState(false);
  const { user } = UserAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'patients'),
      where('userid', '==', user.uid ?? ''),
      orderBy('timestamp', 'desc')
    );
    onSnapshot(q, (querySnapshot) => {
      setPatients(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });
  }, [user, reload]);

  const handleSearch = (searchTerm) => {
    let results = patients;

    if (searchTerm) {
      results = results.filter(
        (item) =>
          item.data.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.data.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setPatients(results);
    } else {
      setReload(!reload);
    }
  };

  return (
    <div className='flex justify-center flex-col gap-4 mt-6 pt-4 pb-8 px-[10rem]'>
      <div className='flex justify-center'>
        <h1 className=' text-4xl text-[#00717A] font-bold uppercase'>
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>

      <div className=' bg-[#00717A] rounded-md px-[3rem] py-8'>
        <div className=' flex justify-between items-center py-6'>
          <div className=' relative'>
            <input
              type='text'
              placeholder='Search patient or patient ID'
              className=' h-10 px-3 rounded-3xl w-[20rem] focus-visible:outline-0'
              onChange={(e) => handleSearch(e.target.value)}
            />
            <IoSearch
              className=' absolute right-3 top-3 text-[#d0d0d0]'
              size={20}
            />
          </div>
          <div className='h-10 px-3 rounded-3xl w-[10rem] bg-white flex items-center justify-center gap-1'>
            <span>View By: </span>
            <select className=' focus-visible:outline-0'>
              <option value='Name'>Name</option>
              <option value='Date'>Date</option>
            </select>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full overflow-hidden rounded-md'>
            <thead>
              <tr className='bg-[#299FA8] text-white '>
                <th className='font-medium font-sans py-3 '>Patient ID</th>
                <th className='font-medium font-sans py-3'>Last Name</th>
                <th className='font-medium font-sans py-3'>First Name</th>
                <th className='font-medium font-sans py-3'>Sex</th>
                <th className='font-medium font-sans py-3'>Blood Pressure</th>
                <th className='font-medium font-sans py-3'>Cholesterol Level</th>
                <th className='font-medium font-sans py-3'>Stroke History</th>
                <th className='font-medium font-sans py-3'>Diabetes History</th>
                <th className='font-medium font-sans py-3'>Smoker</th>
                <th className='font-medium font-sans py-3'>Risk Result</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((data, i) => (
                <tr key={i} className='bg-white text-center font-medium'>
                  <td className='font-medium font-sans py-3'>{data.id}</td>
                  <td className='font-medium font-sans py-3'>{data.data.lastname}</td>
                  <td className='font-medium font-sans py-3'>{data.data.firstname}</td>
                  <td className='font-medium font-sans py-3'>{data.data.sex}</td>
                  <td className='font-medium font-sans py-3'>{data.data.blood_pressure}</td>
                  <td className='font-medium font-sans py-3'>{data.data.cholesterol_level}</td>
                  <td className='font-medium font-sans py-3'>{data.data.history_of_stroke}</td>
                  <td className='font-medium font-sans py-3'>{data.data.history_of_diabetes}</td>
                  <td className='font-medium font-sans py-3'>{data.data.smoker}</td>
                  <td className='font-medium font-sans py-3'>{data.data.risk_result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionTable;
