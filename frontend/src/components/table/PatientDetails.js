import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase'; 
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientDetails = () => {
  const { id } = useParams(); // Retrieve patient ID from URL
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'patients', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Patient Data:', docSnap.data()); 
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

  // **Custom Confirmation Toast Function**
  const confirmDelete = () => {
    return new Promise((resolve) => {
      toast.custom((t) => (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 min-h-screen pointer-events-none"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white shadow-lg rounded-lg p-8 border-4 border-red-500 w-11/12 max-w-md">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this patient record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  resolve(false);
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Cancel Deletion"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolve(true);
                  toast.dismiss(t.id);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Confirm Deletion"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ), {
        duration: Infinity, 
        
      });
    });
  };

  // **Handle Deletion from PatientDetails**
  const handleDelete = async () => {
    // Show confirmation toast and wait for user's response
    const isConfirmed = await confirmDelete();

    if (!isConfirmed) return; // User canceled the deletion

    // Proceed with deletion
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
          className="mt-4 px-12 py-6 bg-[#00717a] text-white rounded-md hover:bg-[#005f61] focus:outline-none text-xl"
          aria-label="Go Back to Table"
        >
          Back
        </button>
      </div>
    );
  }

  const { data } = patient;

  return (
    <div className="flex flex-col items-center p-4 mt-4 relative">
      {/* **New Text Above the Box** */}
      <h1 className="text-3xl font-bold mb-6 text-[#00717a]">
        Patient Details
      </h1>

      {/* Patient Details Box */}
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8 border-4 border-[#299FA8]">
        {/* Patient Information */}
        <div className="grid grid-cols-1 gap-6 text-lg">
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
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-4xl flex justify-between mt-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/prediction-table')}
          className="flex items-center justify-center px-12 py-6 bg-[#00717a] text-white rounded-md hover:bg-[#005f61] focus:outline-none text-xl"
          aria-label="Back"
        >
          Back
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="flex items-center justify-center px-12 py-6 bg-[#DA4B4B] text-white rounded-md hover:bg-[#b33a3a] focus:outline-none text-xl"
          aria-label="Delete Patient"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PatientDetails;