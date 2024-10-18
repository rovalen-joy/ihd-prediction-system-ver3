import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#00717A] text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} IHD Prediction System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
