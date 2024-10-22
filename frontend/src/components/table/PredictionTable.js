import React, { useState, useEffect, useMemo } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import {
  collectionGroup,
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
  const [records, setRecords] = useState([]); // Original record data
  const [filteredRecords, setFilteredRecords] = useState([]); // Filtered and sorted data
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

  // Fetch records from Firestore in real-time using collectionGroup
  useEffect(() => {
    if (!user) {
      console.log('No authenticated user found.');
      setLoading(false);
      return;
    }

    console.log(`Fetching records for UID: ${user.uid}`);
    setLoading(true);

    // Define the query on the 'records' collection group
    const q = query(
      collectionGroup(db, 'records'),
      where('userid', '==', user.uid),
      orderBy('timestamp', 'desc') // Ordering by timestamp descending
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
          date: doc.data().timestamp.toDate(),
          patientDocId: doc.ref.parent.parent.id,
        }));
        console.log('Fetched Records:', fetchedRecords);
        setRecords(fetchedRecords);
        setFilteredRecords(fetchedRecords);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching records:', error);
        toast.error(`Failed to fetch prediction records: ${error.message}`, {
          style: {
            fontSize: '0.875rem', // 14px
            padding: '0.5rem', // 8px
          },
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Filter and sort records based on search term and sort criteria
  useEffect(() => {
    const processRecords = () => {
      let results = [...records];

      // **Search Filtering**
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();

        // Check if searchTerm is numeric (allowing leading zeros)
        const isNumeric = /^\d+$/.test(searchTerm);
        const parsedTerm = isNumeric ? searchTerm.padStart(4, '0') : null;

        results = results.filter((item) => {
          const patientIDMatches = isNumeric
            ? item.data.patientID === parsedTerm
            : false; // Only match patientID if searchTerm is numeric

          return (
            (item.data.firstname &&
              item.data.firstname.toLowerCase().includes(lowercasedTerm)) ||
            (item.data.lastname &&
              item.data.lastname.toLowerCase().includes(lowercasedTerm)) ||
            patientIDMatches ||
            (item.data.patientID && item.data.patientID.includes(searchTerm)) // Match formatted patientID
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

      setFilteredRecords(results);
    };

    processRecords();
  }, [records, searchTerm, sortBy]);

  // **Reset to First Page when searchTerm or sortBy changes**
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  // **Handle Row Click to Navigate to Details**
  const handleRowClick = (record) => {
    // Navigate to patient details using patientID
    // Ensure that 'patientID' is included in each record document
    console.log('Navigating to Patient Details with ID:', record.patientDocId);
    navigate(`/patient-details/${record.patientDocId}`);
  };

  // **Calculate Paginated Data**
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  return (
    <div className="flex justify-center flex-col gap-4 mt-6 pt-4 pb-8 px-4 md:px-6 lg:px-10">
      {/* Header */}
      <div className="flex justify-center">
        <h1 className="text-lg md:text-xl lg:text-2xl text-[#00717A] font-bold uppercase">
          Patients' Records
        </h1>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-[#00717A] rounded-md px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-2">
          {/* Search Input */}
          <div className="relative w-full md:w-2/5 lg:w-2/5 mb-3 md:mb-0">
            <input
              type="text"
              placeholder="Search patient or patient ID"
              className="h-8 px-3 rounded-2xl w-full focus-visible:outline-0 text-sm"
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
              aria-label="Search patients by name or ID"
            />
            <IoSearch
              className="absolute right-2 top-2 text-[#d0d0d0]"
              size={14}
              aria-hidden="true"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="bg-white rounded-2xl flex items-center gap-1 px-2 py-1 max-w-xs">
            <span className="text-sm text-gray-800">View By:</span>
            <select
              className="outline-none focus:outline-none text-sm bg-transparent w-auto border border-gray-300 rounded hover:border-gray-400 focus:border-[#00717A] focus:ring-2 focus:ring-[#00717A]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort patients by"
            >
              <option value="Name">Name</option>
              <option value="Date">Date</option>
            </select>
          </div>
        </div>

        {/* Instruction Note */}
        <p className="text-sm text-white mt-2">
          Click on a patient record to view full details.
        </p>

        {/* Patient Data Table */}
        <div className="overflow-x-auto relative mt-6 mb-4">
          <div
            className="rounded-lg overflow-hidden shadow mx-auto"
            style={{ maxWidth: '1200px' }}
          >
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-[#299FA8] text-white">
                  <th className="font-medium py-3 px-1">Patient ID</th>
                  <th className="font-medium py-3 px-1">Last Name</th>
                  <th className="font-medium py-3 px-1">First Name</th>
                  <th className="font-medium py-3 px-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center text-sm py-2">
                      Loading...
                    </td>
                  </tr>
                ) : currentRecords.length > 0 ? (
                  currentRecords.map((record) => (
                    <tr
                      key={record.id}
                      className={`bg-white text-center font-medium hover:bg-[#c6fbff] cursor-pointer transition-transform transform-gpu duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00717A]`}
                      onClick={() => handleRowClick(record)}
                      tabIndex="0"
                      role="row"
                      aria-label={`View details for patient ${record.data.firstname} ${record.data.lastname}`}
                      title="View Details" // Tooltip
                    >
                      {/* Patient ID */}
                      <td className="font-medium py-2 px-1">
                        {record.data.patientID
                          ? record.data.patientID.toString().padStart(4, '0')
                          : '----'}
                      </td>
                      {/* Last Name */}
                      <td className="font-medium py-2 px-1">
                        {record.data.lastname}
                      </td>
                      {/* First Name */}
                      <td className="font-medium py-2 px-1">
                        {record.data.firstname}
                      </td>
                      {/* Date */}
                      <td className="font-medium py-2 px-1">
                        {format(record.date, 'MM/dd/yyyy')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-white text-sm py-2">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredRecords.length > recordsPerPage && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 py-0.5 mx-1 rounded text-xs ${
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
                  className={`px-2 py-0.5 mx-1 rounded text-xs ${
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
              className={`px-2 py-0.5 mx-1 rounded text-xs ${
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