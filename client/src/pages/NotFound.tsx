import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <h1 className="text-6xl font-bold text-gray-200 mb-2">404</h1>
      <p className="text-sm text-gray-500 mb-4">Page not found</p>
      <Link to="/" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
    </div>
  );
}
