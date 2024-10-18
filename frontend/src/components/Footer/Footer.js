import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#00717A] text-white py-2">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} IHD Prediction System. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
