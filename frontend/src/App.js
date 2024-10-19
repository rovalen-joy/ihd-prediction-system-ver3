import React from 'react'; 
import Login from './components/Registration/Login';
import SignUp from './components/Registration/Sign_Up';
import ForgotPassword from './components/Registration/ForgotPassword'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PredictionForm from './components/form/PredictionForm';
import PredictionTable from './components/table/PredictionTable';
import PatientDetails from './components/table/PatientDetails'; 
import Layout from './components/Layout/Layout';
import AboutUs from './components/AboutUs/AboutUs'; 
import HomePage from './components/HomePage/HomePage'; 

function App() {
  return (
    <Router>
      <AuthContextProvider>
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} /> 

          {/* Protected Routes */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path='/home' element={<HomePage />} />
            <Route path='/prediction-form' element={<PredictionForm />} />
            <Route path='/prediction-table' element={<PredictionTable />} />
            <Route path='/about-us' element={<AboutUs />} /> 
          </Route>

          {/* PatientDetails */}
          <Route path='/patient-details/:id' element={<PatientDetails />} /> 
        </Routes>
      </AuthContextProvider>
    </Router>
  );
}

export default App;
