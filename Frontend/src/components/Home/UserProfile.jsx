import ProfileInfo from './ProfileInfo';

export default function UserProfile({ account, userData, logout }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your account details
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Connected: {account.substring(0, 6)}...{account.substring(38)}
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
          <ProfileInfo userData={userData} />
        </div>
      </div>
    </div>
  );
}