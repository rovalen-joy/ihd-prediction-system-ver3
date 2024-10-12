import React from 'react'; 
import Login from './components/Registration/Login';
import SignUp from './components/Registration/Sign_Up';
import ForgotPassword from './components/Registration/ForgotPassword'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Prediction from './pages/Prediction';
import ProtectedRoute from './components/ProtectedRoute';
import PredictionForm from './components/form/PredictionForm';
import PredictionTable from './components/table/PredictionTable';

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
          <Route
            element={
              <ProtectedRoute>
                <Prediction />
              </ProtectedRoute>
            }
          >
            <Route path='/prediction-form' element={<PredictionForm />} />
            <Route path='/prediction-table' element={<PredictionTable />} />
          </Route>
        </Routes>
      </AuthContextProvider>
    </Router>
  );
}

export default App;