import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Registration = ({ 
  account, 
  isRegistered, 
  registerUser, 
  loading, 
  error,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePic: ''
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await registerUser(
      formData.username,
      formData.bio,
      formData.profilePic
    );
    if (success) navigate('/home');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {isRegistered ? (
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Welcome Back!
          </h2>
          <p className="mb-4">You're already registered.</p>
          <button
            onClick={onSuccess}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Continue
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Complete Registration
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture (IPFS Hash)
              </label>
              <input
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
            
            {error && <p className="text-red-600">{error}</p>}
          </form>
        </>
      )}
    </div>
  );
};