import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { IoArrowBack, IoTrash } from 'react-icons/io5'; // Importing arrow and trash icons

const PatientDetails = () => {
  const { id } = useParams(); // Retrieve patient ID from URL
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For programmatic navigation

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'patients', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Patient Data:', docSnap.data()); // Debugging line
          setPatient({ id: docSnap.id, data: docSnap.data() });
        } else {
          console.log('No such document!');
          toast.error('Patient not found.');
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Failed to fetch patient details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  // **Handle Deletion from PatientDetails**
  const handleDelete = async () => {
    const confirmDeletion = window.confirm(
      'Are you sure you want to delete this patient record? This action cannot be undone.'
    );
    if (!confirmDeletion) return;

    try {
      const patientDocRef = doc(db, 'patients', patient.id);
      await deleteDoc(patientDocRef);
      toast.success('Patient record deleted successfully.');
      navigate('/prediction-table'); // Redirect back to the table
    } catch (error) {
      console.error('Error deleting patient record:', error);
      toast.error('Failed to delete patient record.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl">No patient data available.</p>
        <button
          onClick={() => navigate('/prediction-table')}
          className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          aria-label="Go Back to Table"
        >
          <IoArrowBack className="mr-2" /> Go Back to Table
        </button>
      </div>
    );
  }

  const { data } = patient;

  return (
    <div className="flex justify-center items-start p-8">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-6">
        {/* Header with Delete Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Patient Details</h2>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 focus:outline-none"
            aria-label="Delete Patient"
          >
            <IoTrash size={24} />
          </button>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <strong>Patient ID:</strong> {data.patientID.toString().padStart(4, '0')}
          </div>
          <div>
            <strong>First Name:</strong> {data.firstname}
          </div>
          <div>
            <strong>Last Name:</strong> {data.lastname}
          </div>
          <div>
            <strong>Date:</strong> {format(data.timestamp.toDate(), 'MM/dd/yyyy')}
          </div>
          <div>
            <strong>Sex:</strong> {data.sex}
          </div>
          <div>
            <strong>Blood Pressure:</strong> {data.blood_pressure}
          </div>
          <div>
            <strong>Cholesterol Level:</strong> {data.cholesterol_level}
          </div>
          <div>
            <strong>Stroke History:</strong> {data.history_of_stroke}
          </div>
          <div>
            <strong>Diabetes History:</strong> {data.history_of_diabetes}
          </div>
          <div>
            <strong>Smoker:</strong> {data.smoker}
          </div>
          {/* Include Risk Result */}
          {data.risk_result && (
            <div>
              <strong>Risk Result:</strong> {data.risk_result}
            </div>
          )}
        </div>

        {/* Back to Table Button */}
        <button
          onClick={() => navigate('/prediction-table')}
          className="mt-6 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          aria-label="Back to Table"
        >
          <IoArrowBack className="mr-2" /> Back to Table
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;