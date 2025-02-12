import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-mainRed mb-4">404</h1>
      <p className="text-xl mb-6">
        The page you're looking for doesn't exist. Please return to the home page.
      </p>
      <Link to="/">
        <button className="text-2xl bg-mainRed px-4 py-2 rounded hover:bg-red-700 transition-all duration-200">
          Go back
        </button>
      </Link>
    </div>
  );
}
