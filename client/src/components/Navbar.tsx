import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold text-base">
              PennSwipe Exchange
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <Link to="/book" className="text-gray-600 hover:text-black">
                Order Book
              </Link>
              <Link to="/history" className="text-gray-600 hover:text-black">
                Trade History
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-gray-600 hover:text-black">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-sm">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-gray-600 hover:text-black">
                  {user?.displayName || user?.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-black">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 border-t text-sm">
            <div className="flex flex-col gap-1 pt-2">
              <Link to="/book" className="px-3 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Order Book</Link>
              <Link to="/history" className="px-3 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Trade History</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="px-3 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <Link to="/profile" className="px-3 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="px-3 py-2 text-left text-gray-600 hover:bg-gray-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="px-3 py-2 text-blue-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
