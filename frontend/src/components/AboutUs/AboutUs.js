import React from 'react';
import Footer from '../Footer/Footer'; 

const AboutUs = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <div className="flex justify-center flex-col gap-2 mt-1 pt-4 pb-4 px-4 md:px-10 lg:px-20">
        {/* Header */}
        <div className="flex justify-center">
          <h1 className="text-xl md:text-xl lg:text-3xl text-[#00717A] font-bold uppercase">
            ABOUT US
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-white py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-8 border-2 border-[#00717A]">

          {/* Our Mission */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#00717A] mb-2">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              At the IHD Prediction System, our mission is to leverage advanced machine learning algorithms and comprehensive patient data to provide timely and actionable insights. By identifying individuals at high risk of ischemic heart disease, we aim to facilitate early interventions, improve patient outcomes, and support healthcare professionals in making informed decisions.
            </p>
          </section>

          {/* Our Technology */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#00717A] mb-2">Our Technology</h2>
            <p className="text-gray-700 leading-relaxed">
              Our system integrates machine learning models with real-time data processing to deliver precise risk assessments. Utilizing a robust dataset and continuous model training, we ensure that our predictions are both accurate and up-to-date, adapting to the latest medical research and patient information.
            </p>
          </section>

          {/* Important Disclaimer */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#00717A] mb-2">Important Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed">
              It is important to note that our system is designed exclusively for <strong>prediction and early intervention</strong>. It does <strong>not</strong> provide <strong>diagnosis or prescription recommendations</strong>. The responsibility of diagnosing and deciding on prescriptions based on patient symptoms and risk factors lies solely with qualified medical experts and practitioners.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-xl font-semibold text-[#00717A] mb-2">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              For more information about our services, collaborations, or inquiries, please feel free to reach out to us.
            </p>
            <a
              href="mailto:info@ihdpredictions.com"
              className="text-[#00717A] underline hover:text-[#005f61] text-base"
            >
              ihdpredictionteam@gmail.com
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUs;
