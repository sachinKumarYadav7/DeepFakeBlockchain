// import { ethers } from 'ethers';
// import abi from '../contract/Register.json';

// const contractAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

// export const getContract = () => {
//   const { ethereum } = window;
//   if (!ethereum) throw new Error("MetaMask not installed");

//   const provider = new ethers.providers.Web3Provider(ethereum);
//   const signer = provider.getSigner();
//   return new ethers.Contract(contractAddress, abi, signer);
// };


import { ethers } from 'ethers';
import abi from '../contract/Register.json';


const contractAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e"; 

export const getContract = () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  
  return provider.getSigner().then(signer => {
    return new ethers.Contract(contractAddress, abi, signer);
  });
};
