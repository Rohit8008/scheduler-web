import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white text-center">
      {/* Error Code & Message */}
      <h1 className="text-7xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-semibold text-gray-700 mt-4">Oops! Page Not Found</h2>
      <p className="text-gray-500 mt-2 max-w-lg">
        The page you're looking for doesn't exist or has been moved. Try navigating back to the home page.
      </p>
 
      {/* Navigation Button */}
      <Link
        href="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>

    </div>
  );
};

export default NotFound;
