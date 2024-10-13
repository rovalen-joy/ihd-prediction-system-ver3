import React, { useState, useEffect, useMemo } from 'react';
import { IoSearch, IoTrash } from 'react-icons/io5';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { UserAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';

const PredictionTable = () => {
  // State variables
  const [patients, setPatients] = useState([]); // Original patient data
  const [filteredPatients, setFilteredPatients] = useState([]); // Filtered and sorted data
  const [loading, setLoading] = useState(true); // Loading state
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [sortBy, setSortBy] = useState('Date'); // Sort criterion: 'Name' or 'Date'
  const { user } = UserAuth(); // Authenticated user

  // New state variables for deletion confirmation modal
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState(null);

  // **New Pagination State Variables**
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
  const recordsPerPage = 10; // Number of records per page

  const debouncedSetSearchTerm = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  useEffect(() => {
    if (!user) {
      console.log('No authenticated user found.');
      setLoading(false);
      return;
    }

    console.log(`Fetching patients for UID: ${user.uid}`);
    setLoading(true);
    const q = query(
      collection(db, 'patients'),
      where('userid', '==', user.uid),
      orderBy('timestamp', 'desc') // Default ordering by Date (descending)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedPatients = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
          date: doc.data().timestamp.toDate(),
        }));
        console.log('Fetched Patients:', fetchedPatients);
        setPatients(fetchedPatients);
        setFilteredPatients(fetchedPatients);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patient data.');
        setLoading(false);
      }
    );

    
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Function to filter and sort patients
    const processPatients = () => {
      let results = [...patients];

      // **Search Filtering**
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();

        // Check if searchTerm is numeric (allowing leading zeros)
        const isNumeric = /^\d+$/.test(searchTerm);
        const parsedTerm = isNumeric ? parseInt(searchTerm, 10) : null;

        results = results.filter((item) => {
          const patientIDMatches = isNumeric
            ? item.data.patientID === parsedTerm
            : false; // Only match patientID if searchTerm is numeric

          const patientIDFormatted = item.data.patientID
            ? item.data.patientID.toString().padStart(4, '0')
            : '';

          return (
            (item.data.firstname &&
              item.data.firstname.toLowerCase().includes(lowercasedTerm)) ||
            (item.data.lastname &&
              item.data.lastname.toLowerCase().includes(lowercasedTerm)) ||
            patientIDMatches ||
            (patientIDFormatted && patientIDFormatted.includes(searchTerm)) // Match formatted patientID
          );
        });
      }

      // **Sorting**
      if (sortBy === 'Name') {
        results.sort((a, b) => {
          const lastNameA = a.data.lastname.toLowerCase();
          const lastNameB = b.data.lastname.toLowerCase();

          if (lastNameA < lastNameB) return -1;
          if (lastNameA > lastNameB) return 1;

          const firstNameA = a.data.firstname.toLowerCase();
          const firstNameB = b.data.firstname.toLowerCase();

          if (firstNameA < firstNameB) return -1;
          if (firstNameA > firstNameB) return 1;

          return 0; // Names are identical
        });
      } else if (sortBy === 'Date') {
        results.sort(
          (a, b) => b.data.timestamp.seconds - a.data.timestamp.seconds
        );
      }

      setFilteredPatients(results);
    };

    processPatients();
  }, [patients, searchTerm, sortBy]);

  // **Reset to First Page when searchTerm or sortBy changes**
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // **Handle Deletion of a Patient Record with Confirmation Modal**
  const handleDelete = (patientId) => {
    setPatientIdToDelete(patientId);
    setShowConfirmDelete(true);
  };

  const deletePatient = async (patientId) => {
    try {
      // Reference to the specific patient document
      const patientDocRef = doc(db, 'patients', patientId);

      // Delete the document
      await deleteDoc(patientDocRef);

      toast.success('Patient record deleted successfully.');

      // Remove the deleted patient from the local state
      setFilteredPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.id !== patientId)
      );
      setPatients((prevPatients) =>
        prevPatients.filter((patient) => patient.id !== patientId)
      );
    } catch (error) {
      console.error('Error deleting patient record:', error);
      toast.error('Failed to delete patient record.');
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  return (
    <div className="flex justify-center flex-col gap-4 mt-6 pt-4 pb-8 px-[10rem]">
      {/* Header */}
      <div className="flex justify-center">
        <h1 className="text-4xl text-[#00717A] font-bold uppercase">
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-[#00717A] rounded-md px-[3rem] py-8">
        <div className="flex justify-between items-center py-6">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient or patient ID"
              className="h-10 px-3 rounded-3xl w-[20rem] focus-visible:outline-0"
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            />
            <IoSearch
              className="absolute right-3 top-3 text-[#d0d0d0]"
              size={20}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="h-10 px-3 rounded-3xl w-[10rem] bg-white flex items-center justify-center gap-1">
            <span>View By:</span>
            <select
              className="focus-visible:outline-0"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Name">Name</option>
              <option value="Date">Date</option>
            </select>
          </div>
        </div>

        {/* Patient Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden rounded-md">
            <thead>
              <tr className="bg-[#299FA8] text-white">
                <th className="font-medium font-sans py-3">Patient ID</th>
                <th className="font-medium font-sans py-3">Last Name</th>
                <th className="font-medium font-sans py-3">First Name</th>
                <th className="font-medium font-sans py-3">Sex</th>
                <th className="font-medium font-sans py-3">
                  Blood Pressure
                </th>
                <th className="font-medium font-sans py-3">
                  Cholesterol Level
                </th>
                <th className="font-medium font-sans py-3">
                  Stroke History
                </th>
                <th className="font-medium font-sans py-3">
                  Diabetes History
                </th>
                <th className="font-medium font-sans py-3">Smoker</th>
                <th className="font-medium font-sans py-3">Risk Result</th>
                <th className="font-medium font-sans py-3">Date</th>
                <th className="font-medium font-sans py-3">Actions</th> 
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : currentPatients.length > 0 ? ( 
                currentPatients.map((data) => ( 
                  <tr
                    key={data.id}
                    className="bg-white text-center font-medium"
                  >
                    {/* Patient ID with leading zeros */}
                    <td className="font-medium font-sans py-3">
                      {data.data.patientID
                        ? data.data.patientID.toString().padStart(4, '0')
                        : '----'}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.lastname}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.firstname}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.sex}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.blood_pressure}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.cholesterol_level}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.history_of_stroke}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.history_of_diabetes}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.smoker}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {data.data.risk_result}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {format(data.date, 'MM/dd/yyyy')}
                    </td>
                    <td className="font-medium font-sans py-3">
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(data.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Patient"
                        aria-label="Delete Patient"
                      >
                        <IoTrash size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* **New Pagination Controls** */}
        {!loading && filteredPatients.length > recordsPerPage && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#00717A] text-white hover:bg-[#005f61]'
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`px-3 py-1 mx-1 rounded ${
                    currentPage === number
                      ? 'bg-[#005f61] text-white'
                      : 'bg-[#00717A] text-white hover:bg-[#005f61]'
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === totalPages
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#00717A] text-white hover:bg-[#005f61]'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Confirm Deletion Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowConfirmDelete(false)}
          ></div>
          {/* Modal content */}
          <div className="bg-white border-2 border-red-500 rounded-lg shadow-lg p-6 z-50">
            <div className="flex items-center">
              <IoTrash
                className="h-6 w-6 text-red-600 mr-3"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold text-red-700">
                Confirm Deletion
              </h2>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              Are you sure you want to delete this patient record? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deletePatient(patientIdToDelete);
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionTable;
