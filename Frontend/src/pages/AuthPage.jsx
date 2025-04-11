import { MetamaskLogin } from '../components/MetamaskLogin';
import { useContract } from '../hooks/useContract';

const AuthPage = () => {
  const { 
    account, 
    loading, 
    error, 
    connectWallet 
  } = useContract();

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <MetamaskLogin 
        connectWallet={connectWallet} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};
