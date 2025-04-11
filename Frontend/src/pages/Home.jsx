// export default function Home() {
//     return (
//       <div className="flex items-center justify-center h-screen bg-green-100">
//         <h1 className="text-4xl font-bold">Welcome to Home Page 🎉</h1>
//       </div>
//     );
//   }


import { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { MetamaskLogin } from '../components/MetamaskLogin';
import { Registration } from './login';
import Navbar from '../components/Navbar';

function Home() {
  const {
    account,
    isRegistered,
    loading,
    error,
    connectWallet,
    registerUser
  } = useContract();

  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="p-6">
        <Navbar />
      </ div>
      <h1 className="text-2xl font-bold">Welcome to the App</h1>
      <p>Connected as: {account}</p>
      <div className="w-full max-w-md p-8 bg-dark rounded-lg shadow">
        <MetamaskLogin 
          connectWallet={connectWallet} 
          loading={loading} 
          error={error} 
        />
      </div>
    </div>
  );
}

export default Home;
  