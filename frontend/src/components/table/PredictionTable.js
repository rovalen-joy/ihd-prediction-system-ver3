import React, { useState, useEffect, useMemo } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
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

  // Pagination state variables
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page
  const recordsPerPage = 10; // Number of records per page

  const navigate = useNavigate();

  // Debounced search term setter to optimize performance
  const debouncedSetSearchTerm = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    []
  );

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // Fetch patients from Firestore in real-time
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

  // Filter and sort patients based on search term and sort criteria
  useEffect(() => {
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

  // **Handle Row Click to Navigate to Details**
  const handleRowClick = (patientId) => {
    navigate(`/patient-details/${patientId}`); // Ensure this route is defined
  };

  // **Calculate Paginated Data**
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredPatients.length / recordsPerPage);

  return (
    <div className="flex justify-center flex-col gap-4 mt-6 pt-4 pb-8 px-10">
      {/* Header */}
      <div className="flex justify-center">
        <h1 className="text-4xl text-[#00717A] font-bold uppercase">
          ISCHEMIC HEART DISEASE PREDICTION
        </h1>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-[#00717A] rounded-md px-8 py-8">
        <div className="flex justify-between items-center py-6">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patient or patient ID"
              className="h-10 px-3 rounded-3xl w-80 focus-visible:outline-0"
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              aria-label="Search patients by name or ID"
            />
            <IoSearch
              className="absolute right-3 top-3 text-[#d0d0d0]"
              size={20}
              aria-hidden="true"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="h-10 px-3 rounded-3xl w-40 bg-white flex items-center justify-center gap-1">
            <span className="text-gray-800">View By:</span>
            <select
              className="focus-visible:outline-0"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort patients by"
            >
              <option value="Name">Name</option>
              <option value="Date">Date</option>
            </select>
          </div>
        </div>

        {/* Patient Data Table */}
        <div className="overflow-x-auto relative">
          <table className="w-full table-auto overflow-hidden rounded-md">
            <thead>
              <tr className="bg-[#299FA8] text-white">
                <th className="font-medium font-sans py-3 px-2">Patient ID</th>
                <th className="font-medium font-sans py-3 px-2">Last Name</th>
                <th className="font-medium font-sans py-3 px-2">First Name</th>
                <th className="font-medium font-sans py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : currentPatients.length > 0 ? (
                currentPatients.map((data) => (
                  <tr
                    key={data.id}
                    className={`bg-white text-center font-medium hover:bg-gray-100 cursor-pointer transition-colors duration-200`}
                    onClick={() => handleRowClick(data.id)}
                    aria-selected={false}
                    role="row"
                  >
                    {/* Patient ID */}
                    <td className="font-medium font-sans py-3 px-2">
                      {data.data.patientID
                        ? data.data.patientID.toString().padStart(4, '0')
                        : '----'}
                    </td>
                    {/* Last Name */}
                    <td className="font-medium font-sans py-3 px-2">
                      {data.data.lastname}
                    </td>
                    {/* First Name */}
                    <td className="font-medium font-sans py-3 px-2">
                      {data.data.firstname}
                    </td>
                    {/* Date */}
                    <td className="font-medium font-sans py-3 px-2">
                      {format(data.date, 'MM/dd/yyyy')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
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
              aria-label="Previous Page"
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
                  aria-label={`Go to Page ${number}`}
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
              aria-label="Next Page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionTable;