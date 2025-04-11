import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import RegisterContract from './contract/Register.json';
import Layout from './components/Shared/Layout';
import AuthPage from './components/Auth/AuthPage';
import HomePage from './components/Home/HomePage';

const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const HARDHAT_CHAIN_ID = '0x7a69';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState(null);

  // Handle network changes
  useEffect(() => {
    const handleChainChanged = (chainId) => {
      setCurrentNetwork(chainId);
      window.location.reload();
    };

    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  // Initialize provider and contract
  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      
      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        setCurrentNetwork(chainId);
        
        if (chainId !== HARDHAT_CHAIN_ID) {
          setError('Please connect to Hardhat Local Network (chain ID 31337)');
          return;
        }

        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const accounts = await provider.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const registerContract = new ethers.Contract(
            contractAddress,
            RegisterContract.abi,
            signer
          );
          setContract(registerContract);
          const registered = await registerContract.isRegistered(accounts[0]);
          setIsRegistered(registered);
          if (registered) setCurrentPage('home');
        }
      }
    };
    
    init();
  }, []);

  const connectMetaMask = async () => {
    try {
      setLoading(true);
      setError('');
      
      const provider = await detectEthereumProvider();
      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        if (chainId !== HARDHAT_CHAIN_ID) {
          await switchToHardhatNetwork(provider);
        }

        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const registerContract = new ethers.Contract(
          contractAddress,
          RegisterContract.abi,
          signer
        );
        setContract(registerContract);
        
        const registered = await registerContract.isRegistered(accounts[0]);
        setIsRegistered(registered);
        if (registered) setCurrentPage('home');
      } else {
        setError('Please install MetaMask to use this application');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAccount(null);
      setContract(null);
      setIsRegistered(false);
      setCurrentPage('auth');
      
      if (window.ethereum && window.ethereum._metamask) {
        try {
          await window.ethereum._metamask.disconnect();
        } catch (disconnectError) {
          console.log("MetaMask disconnect error:", disconnectError);
        }
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Layout>
      {currentPage === 'home' ? (
        <HomePage account={account} contract={contract} logout={logout} />
      ) : (
        <AuthPage 
          account={account}
          isRegistered={isRegistered}
          loading={loading}
          error={error}
          currentNetwork={currentNetwork}
          HARDHAT_CHAIN_ID={HARDHAT_CHAIN_ID}
          connectMetaMask={connectMetaMask}
          setCurrentPage={setCurrentPage}
        />
      )}
    </Layout>
  );
}

async function switchToHardhatNetwork(provider) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: HARDHAT_CHAIN_ID }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: HARDHAT_CHAIN_ID,
              chainName: 'Hardhat Local Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Hardhat network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Hardhat network');
    }
  }
}

export default App;
















// // App.js
// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import detectEthereumProvider from '@metamask/detect-provider';
// import RegisterContract from './contract/Register.json';

// const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Replace with your deployed contract address
// const HARDHAT_CHAIN_ID = '0x7a69'; // 31337 in hex

// function App() {
//   const [currentPage, setCurrentPage] = useState('auth'); // 'auth' or 'home'
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [currentNetwork, setCurrentNetwork] = useState(null);

//   // Registration form state
//   const [formData, setFormData] = useState({
//     username: '',
//     bio: '',
//     profilePic: ''
//   });

//   // Handle network changes
//   useEffect(() => {
//     const handleChainChanged = (chainId) => {
//       setCurrentNetwork(chainId);
//       window.location.reload();
//     };

//     window.ethereum?.on('chainChanged', handleChainChanged);

//     return () => {
//       window.ethereum?.removeListener('chainChanged', handleChainChanged);
//     };
//   }, []);

//   // Initialize provider and contract
//   useEffect(() => {
//     const init = async () => {
//       const provider = await detectEthereumProvider();
      
//       if (provider) {
//         // Check network first
//         const chainId = await provider.request({ method: 'eth_chainId' });
//         setCurrentNetwork(chainId);
        
//         if (chainId !== HARDHAT_CHAIN_ID) {
//           setError('Please connect to Hardhat Local Network (chain ID 31337)');
//           return;
//         }

//         // Create ethers provider and signer
//         const ethersProvider = new ethers.BrowserProvider(provider);
//         const signer = await ethersProvider.getSigner();
        
//         // Get connected account
//         const accounts = await provider.request({ method: 'eth_accounts' });
//         if (accounts.length > 0) {
//           setAccount(accounts[0]);
          
//           // Initialize contract
//           const registerContract = new ethers.Contract(
//             contractAddress,
//             RegisterContract.abi,
//             signer
//           );
//           setContract(registerContract);
          
//           // Check if user is registered
//           const registered = await registerContract.isRegistered(accounts[0]);
//           setIsRegistered(registered);
//           if (registered) {
//             setCurrentPage('home');
//           }
//         }
//       }
//     };
    
//     init();
//   }, []);

//   const connectMetaMask = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const provider = await detectEthereumProvider();
//       if (provider) {
//         // Check if on the correct network (31337 for Hardhat)
//         const chainId = await provider.request({ method: 'eth_chainId' });
//         if (chainId !== HARDHAT_CHAIN_ID) {
//           try {
//             await provider.request({
//               method: 'wallet_switchEthereumChain',
//               params: [{ chainId: HARDHAT_CHAIN_ID }],
//             });
//           } catch (switchError) {
//             // This error code indicates that the chain has not been added to MetaMask
//             if (switchError.code === 4902) {
//               try {
//                 await provider.request({
//                   method: 'wallet_addEthereumChain',
//                   params: [
//                     {
//                       chainId: HARDHAT_CHAIN_ID,
//                       chainName: 'Hardhat Local Network',
//                       nativeCurrency: {
//                         name: 'ETH',
//                         symbol: 'ETH',
//                         decimals: 18,
//                       },
//                       rpcUrls: ['http://127.0.0.1:8545'],
//                     },
//                   ],
//                 });
//               } catch (addError) {
//                 setError('Failed to add Hardhat network to MetaMask');
//                 return;
//               }
//             } else {
//               setError('Failed to switch to Hardhat network');
//               return;
//             }
//           }
//         }

//         // Request account access
//         const accounts = await provider.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);
        
//         // Initialize contract
//         const ethersProvider = new ethers.BrowserProvider(provider);
//         const signer = await ethersProvider.getSigner();
//         const registerContract = new ethers.Contract(
//           contractAddress,
//           RegisterContract.abi,
//           signer
//         );
//         setContract(registerContract);
        
//         // Check if user is registered
//         const registered = await registerContract.isRegistered(accounts[0]);
//         setIsRegistered(registered);
//         if (registered) {
//           setCurrentPage('home');
//         }
//       } else {
//         setError('Please install MetaMask to use this application');
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       setError('');
      
//       // Call the registerUser function on the smart contract
//       const tx = await contract.registerUser(
//         formData.username,
//         formData.bio,
//         formData.profilePic
//       );
      
//       await tx.wait();
//       setIsRegistered(true);
//       setCurrentPage('home');
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const logout = async () => {
//     try {
//       // Reset all state
//       setAccount(null);
//       setContract(null);
//       setIsRegistered(false);
//       setCurrentPage('auth');
      
//       // Disconnect from MetaMask
//       if (window.ethereum && window.ethereum._metamask) {
//         try {
//           await window.ethereum._metamask.disconnect();
//         } catch (disconnectError) {
//           console.log("MetaMask disconnect error:", disconnectError);
//         }
//       }
//     } catch (err) {
//       console.error("Logout error:", err);
//     }
//   };

//   const networkName = currentNetwork === HARDHAT_CHAIN_ID ? 'Hardhat Local' : 'Wrong Network';

//   if (currentPage === 'home') {
//     return <HomePage account={account} contract={contract} logout={logout} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           {isRegistered ? 'Welcome Back!' : 'Register Your Account'}
//         </h2>
//         {currentNetwork && (
//           <div className={`mt-2 text-center text-sm font-medium ${
//             currentNetwork === HARDHAT_CHAIN_ID ? 'text-green-600' : 'text-red-600'
//           }`}>
//             Network: {networkName}
//           </div>
//         )}
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           {!account ? (
//             <div className="text-center">
//               <button
//                 onClick={connectMetaMask}
//                 disabled={loading}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 {loading ? 'Connecting...' : 'Connect with MetaMask'}
//               </button>
//               {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//             </div>
//           ) : isRegistered ? (
//             <div className="text-center">
//               <p className="text-sm text-gray-600 mb-4">
//                 You're registered! Welcome back.
//               </p>
//               <button
//                 onClick={() => setCurrentPage('home')}
//                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//               >
//                 Continue to Home
//               </button>
//             </div>
//           ) : (
//             <form className="space-y-6" onSubmit={handleRegister}>
//               <div>
//                 <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//                   Username
//                 </label>
//                 <div className="mt-1">
//                   <input
//                     id="username"
//                     name="username"
//                     type="text"
//                     required
//                     value={formData.username}
//                     onChange={handleInputChange}
//                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
//                   Bio
//                 </label>
//                 <div className="mt-1">
//                   <textarea
//                     id="bio"
//                     name="bio"
//                     rows={3}
//                     value={formData.bio}
//                     onChange={handleInputChange}
//                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
//                   Profile Picture (IPFS Hash)
//                 </label>
//                 <div className="mt-1">
//                   <input
//                     id="profilePic"
//                     name="profilePic"
//                     type="text"
//                     value={formData.profilePic}
//                     onChange={handleInputChange}
//                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                 >
//                   {loading ? 'Registering...' : 'Register'}
//                 </button>
//               </div>
//               {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function HomePage({ account, contract, logout }) {
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const data = await contract.getUser(account);
//         setUserData({
//           username: data.username,
//           bio: data.bio,
//           GS: data.GS.toString(),
//           profilePic: data.profilePic,
//           userAddress: data.userAddress
//         });
//       } catch (err) {
//         console.error("Failed to fetch user data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, [account, contract]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <p>Loading your profile...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="py-12">
//           <div className="bg-white shadow overflow-hidden sm:rounded-lg">
//             <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
//               <div>
//                 <h3 className="text-lg leading-6 font-medium text-gray-900">
//                   User Profile
//                 </h3>
//                 <p className="mt-1 max-w-2xl text-sm text-gray-500">
//                   Your account details
//                 </p>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="text-sm text-gray-500">
//                   Connected: {account.substring(0, 6)}...{account.substring(38)}
//                 </div>
//                 <button
//                   onClick={logout}
//                   className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//                 >
//                   Logout
//                 </button>
//               </div>
//             </div>
//             <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
//               <dl className="sm:divide-y sm:divide-gray-200">
//                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                   <dt className="text-sm font-medium text-gray-500">
//                     Username
//                   </dt>
//                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                     {userData.username}
//                   </dd>
//                 </div>
//                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                   <dt className="text-sm font-medium text-gray-500">
//                     Bio
//                   </dt>
//                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                     {userData.bio}
//                   </dd>
//                 </div>
//                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                   <dt className="text-sm font-medium text-gray-500">
//                     Good Score (GS)
//                   </dt>
//                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                     {userData.GS}
//                   </dd>
//                 </div>
//                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                   <dt className="text-sm font-medium text-gray-500">
//                     Profile Picture
//                   </dt>
//                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                     {userData.profilePic ? (
//                       <img 
//                         src={`https://ipfs.io/ipfs/${userData.profilePic}`} 
//                         alt="Profile" 
//                         className="h-16 w-16 rounded-full"
//                       />
//                     ) : (
//                       'No profile picture set'
//                     )}
//                   </dd>
//                 </div>
//                 <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//                   <dt className="text-sm font-medium text-gray-500">
//                     Wallet Address
//                   </dt>
//                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                     {userData.userAddress}
//                   </dd>
//                 </div>
//               </dl>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;