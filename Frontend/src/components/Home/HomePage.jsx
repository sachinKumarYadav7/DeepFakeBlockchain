import React, { useState, useRef, useEffect } from 'react';
import UploadImageVideo from '../UploadImageVideo';

const HomePage = ({ account, contract, logout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friendsPost');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await contract.getUser(account);
        setUserData({
          username: data.username,
          bio: data.bio,
          GS: data.GS.toString(),
          profilePic: data.profilePic,
          userAddress: data.userAddress
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [account, contract]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - App name and navigation */}
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-indigo-600">Web3Social</span>
              
              <div className="hidden md:flex space-x-4">
                <button
                  onClick={() => setActiveTab('friendsPost')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'friendsPost' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Friends' Posts
                </button>
                <button
                  onClick={() => setActiveTab('yourPost')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${activeTab === 'yourPost' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Your Posts
                </button>
              </div>
            </div>

            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {userData.username || 'User'}
                  </span>
                  {userData.profilePic ? (
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src={`https://ipfs.io/ipfs/${userData.profilePic}`} 
                      alt="Profile" 
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-600">
                        {userData.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                
                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start space-x-4">
            {userData.profilePic ? (
              <img 
                className="h-12 w-12 rounded-full" 
                src={`https://ipfs.io/ipfs/${userData.profilePic}`} 
                alt="Profile" 
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-bold text-indigo-600">
                  {userData.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{userData.username}</h3>
              <p className="text-sm text-gray-500">{account}</p>
              <p className="mt-2 text-gray-700">{userData.bio}</p>
              <div className="mt-3 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  GS: {userData.GS}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add UploadImageVideo component here */}
        {userData.username && <UploadImageVideo username={userData.username} />}
        
        {activeTab === 'friendsPost' && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Friends' Posts</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Friend 1</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <p className="text-gray-700">This is a sample post from a friend!</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yourPost' && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Posts</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">You</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <p className="text-gray-700">This is your sample post!</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;