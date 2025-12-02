import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftCircle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center">
      {/* Icon + Error Code */}
      <div className="rounded-full p-6 mb-6 shadow-md bg-primary-600 border-2 border-primary-300">
        <h1 className="text-6xl font-extrabold text-white">404</h1>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
        Page Not Found
      </h2>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you are looking for doesn’t exist or has been moved.
      </p>

      {/* Back Home Button */}
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-md transition-all duration-200 hover:opacity-90 bg-primary-600"
      >
        <ArrowLeftCircle className="w-5 h-5" />
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
