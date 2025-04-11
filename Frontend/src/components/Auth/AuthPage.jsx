import NetworkIndicator from '../Shared/NetworkIndicator';
import ConnectWallet from './ConnectWallet';
import AuthForm from './AuthPage';
import ErrorMessage from '../Shared/ErrorMessage';

export default function AuthPage({
  account,
  isRegistered,
  loading,
  error,
  currentNetwork,
  HARDHAT_CHAIN_ID,
  connectMetaMask,
  setCurrentPage
}) {
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isRegistered ? 'Welcome Back!' : 'Register Your Account'}
        </h2>
        <NetworkIndicator 
          currentNetwork={currentNetwork} 
          HARDHAT_CHAIN_ID={HARDHAT_CHAIN_ID} 
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!account ? (
            <ConnectWallet 
              loading={loading} 
              connectMetaMask={connectMetaMask} 
            />
          ) : isRegistered ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                You're registered! Welcome back.
              </p>
              <button
                onClick={() => setCurrentPage('home')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Continue to Home
              </button>
            </div>
          ) : (
            <AuthForm />
          )}
          <ErrorMessage error={error} />
        </div>
      </div>
    </div>
  );
}