import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firstName, lastName } = location.state || { firstName: 'User', lastName: '' };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-semibold mb-8 text-[#353535]">Welcome, Dr. {firstName} {lastName}!</h1>
      <div className="max-w-4xl text-center mb-12">
        <p className="text-lg text-gray-700 mb-4">
          Our IHD Prediction System helps you assess patients' risk of ischemic heart disease using comprehensive data inputs. Here's how you can make the most out of the system.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          Follow the steps below to get started:
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-[#353535]">1. Fill in the Patient's Information</h2>
          <p className="text-gray-600">
            Enter patient data such as age, cholesterol levels, and blood pressure to generate accurate predictions.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-[#353535]">2. Generate Prediction</h2>
          <p className="text-gray-600">
            Use our prediction form to assess the patient’s risk of ischemic heart disease and review the results.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-[#353535]">3. Save and Review</h2>
          <p className="text-gray-600">
            Save predictions for future reference and review past assessments at any time.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <button
          className="bg-[#05747F] text-white py-3 px-6 rounded-lg font-medium mr-4 hover:bg-[#035f62]"
          onClick={() => navigate('/prediction-form')}
        >
          Go to Prediction Form
        </button>
        <button
          className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300"
          onClick={() => navigate('/prediction-table')}
        >
          View Patient History
        </button>
      </div>
    </div>
  );
};

export default HomePage;