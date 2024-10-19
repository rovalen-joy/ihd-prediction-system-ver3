import React from 'react';
import cictLogo from '../../assets/cict.png';
import wvsuLogo from '../../assets/wvsu.png';

const Footer = () => {
  return (
    <footer className="bg-[#00717A] text-white py-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start px-4 space-y-4 md:space-y-0">
        
        {/* Logos Section */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex justify-center md:justify-start items-center space-x-4">
            <img src={wvsuLogo} alt="WVSU Logo" className="h-12 w-12" />
            <img src={cictLogo} alt="CICT Logo" className="h-12 w-12" />
          </div>
          {/* All Rights Reserved Text */}
          <div className="text-white text-sm mt-2">
            &copy; {new Date().getFullYear()} IHD Prediction Team. All rights reserved.
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-semibold mb-2">Contact Us</h2>
          <p>IHD Prediction Team</p>
          <p>Email: <a href="mailto:ihdpredictionteam@example.com" className="text-white hover:underline">ihdpredictionteam@example.com</a></p>
        </div>

        {/* Quick Links Section */}
        <div className="text-center md:text-right">
          <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
          <ul>
            <li>
              <a href="/privacy-policy" className="text-white hover:underline">Privacy Policy</a>
            </li>
            <li>
              <a href="/terms-of-use" className="text-white hover:underline">Terms of Use</a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
