export default function ConnectWallet({ loading, connectMetaMask }) {
    return (
      <div className="text-center">
        <button
          onClick={connectMetaMask}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Connecting...' : 'Connect with MetaMask'}
        </button>
      </div>
    );
  }