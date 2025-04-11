// import { ethers } from 'ethers';
// import detectEthereumProvider from '@metamask/detect-provider';
// import RegisterContract from '../contract/Register.json';
// import { Wallet } from 'ethers';

// const contractABI = RegisterContract.abi;
// const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Replace with your actual contract address

// // Helper function to get provider safely
// const getProvider = async () => {
//   const provider = await detectEthereumProvider();
//   if (!provider) {
//     throw new Error('Please install MetaMask!');
//   }
//   return provider;
// };

// // Check if wallet is connected
// export const checkIfWalletIsConnected = async () => {
//   try {
//     const provider = await getProvider();
//     const accounts = await provider.request({ method: 'eth_accounts' });
//     return accounts.length > 0 ? accounts[0] : null;
//   } catch (error) {
//     console.error('Wallet connection check failed:', error);
//     throw error;
//   }
// };

// // Connect to MetaMask
// export const connectWallet = async () => {
//   try {
//     const provider = await getProvider();
//     const accounts = await provider.request({ method: 'eth_requestAccounts' });
//     return accounts[0];
//   } catch (error) {
//     console.error('Wallet connection failed:', error);
//     throw error;
//   }
// };

// // In your web3.js or registration service file
// export const registerWithMetaMask = async (username, bio, profilePic) => {
//   try {
//     // 1. Check if MetaMask is installed
//     if (!window.ethereum) {
//       throw new Error('MetaMask not detected');
//     }

//     // 2. Request account access if needed
//     const accounts = await window.ethereum.request({ 
//       method: 'eth_requestAccounts' 
//     });
    
//     if (!accounts || accounts.length === 0) {
//       throw new Error('No accounts found');
//     }

//     // 3. Set up the provider and signer
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     // 4. Get the contract instance
//     const contract = new ethers.Contract(
//       contractAddress,
//       contractABI,
//       signer
//     );

//     // 5. Estimate gas first (this helps catch errors early)
//     const gasEstimate = await contract.estimateGas.registerUser(
//       username,
//       bio,
//       profilePic
//     );

//     // 6. Send the transaction with proper gas settings
//     const tx = await contract.registerUser(username, bio, profilePic, {
//       gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
//     });

//     // 7. Wait for the transaction to be mined
//     const receipt = await tx.wait();

//     return {
//       txHash: tx.hash,
//       receipt
//     };
    
//   } catch (error) {
//     console.error('Registration failed:', error);
//     throw error;
//   }
// };

// // // Register user
// // export const registerWithMetaMask = async (username, bio, profilePic) => {
// //   try {
// //     const provider = await getProvider();
// //     const web3Provider = new ethers.providers.Web3Provider(provider);
// //     const signer = web3Provider.getSigner();
// //     const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
// //     const tx = await contract.registerUser(username, bio, profilePic);
// //     const receipt = await tx.wait();
// //     return receipt.status === 1;
// //   } catch (error) {
// //     console.error('Registration failed:', error);
// //     throw new Error(error.message || 'Failed to register user');
// //   }
// // };

// // // Check if user is registered
// // export const checkUserRegistration = async (address) => {
// //   try {
// //     const provider = await getProvider();
// //     const web3Provider = new ethers.providers.Web3Provider(provider);
// //     const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);
// //     return await contract.isRegistered(address);
// //   } catch (error) {
// //     console.error('Error checking registration:', error);
// //     throw error;
// //   }
// // };

// // Get user data
// export const getUserData = async (address) => {
//   try {
//     const provider = await getProvider();
//     const web3Provider = new ethers.providers.Web3Provider(provider);
//     const contract = new ethers.Contract(contractAddress, contractABI, web3Provider);
//     const user = await contract.getUser(address);
    
//     return {
//       username: user.username,
//       bio: user.bio,
//       gsPoints: user.gsPoints ? user.gsPoints.toNumber() : 100,
//       profilePic: user.profilePic
//     };
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     throw error;
//   }
// };


// // Disconnect the Wallet
// export const disconnectWallet = async () => {
//   try {
//     // MetaMask doesn't have a true disconnect function, but we can reset accounts
//     if (window.ethereum && window.ethereum._state && window.ethereum._state.accounts) {
//       window.ethereum._state.accounts = [];
//     }
//     return true;
//   } catch (error) {
//     console.error('Error disconnecting wallet:', error);
//     return false;
//   }
// };



import { ethers } from 'ethers';
import RegisterContract from '../contract/Register.json';

// Replace with your actual contract address and ABI
const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const contractABI = RegisterContract.abi;

export const checkIfWalletIsConnected = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      return null;
    }
  }
  return null;
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  } else {
    throw new Error("MetaMask not installed");
  }
};

export const registerWithMetaMask = async (username, bio, profilePic) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not detected");
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Verify contract
    const code = await provider.getCode(contractAddress);
    if (code === '0x') throw new Error("Contract not deployed");
    
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    // Estimate gas with buffer
    const gasEstimate = await contract.estimateGas.registerUser(username, bio, profilePic);
    const tx = await contract.registerUser(username, bio, profilePic, {
      gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
    });
    
    return tx.hash;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  if (window.ethereum && window.ethereum._state) {
    window.ethereum._state.accounts = [];
  }
};