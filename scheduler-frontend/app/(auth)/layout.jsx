import React from "react";
import Image from "next/image";
import ill from "../../public/authIllustration.avif"; // Ensure the path is correct

const AuthLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-white p-6">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden">
        {/* Illustration (Hidden on Small Screens) */}
        <div className="w-full md:w-1/2 relative hidden md:flex justify-center items-center p-6">
          <Image
            src={ill}
            alt="Auth Illustration"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>

        {/* Auth Form */}
        <div className="w-full md:w-1/2 p-3 md:p-15 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
