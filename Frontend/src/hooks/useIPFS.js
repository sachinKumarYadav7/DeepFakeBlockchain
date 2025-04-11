import { create } from "ipfs-http-client";

// Configuration for Local IPFS Node
const IPFS_API = {
  host: 'localhost',
  port: 5001,
  protocol: 'http'
};

export const useIPFS = () => {
  let ipfs;

  try {
    ipfs = create(IPFS_API);
    console.log("Connected to Local IPFS Node");
  } catch (err) {
    console.error("Failed to connect to Local IPFS Node:", err);
    throw new Error("IPFS connection failed.");
  }

  const uploadToIPFS = async (file, onProgress) => {
    try {
      const { path } = await ipfs.add(file, {
        progress: (bytes) => {
          if (onProgress) onProgress(bytes / file.size);
        }
      });
      return path;
    } catch (err) {
      console.error("IPFS upload error:", err);
      throw new Error("Failed to upload to IPFS. Please check your local node.");
    }
  };

  return { uploadToIPFS };
};


// import { useState } from 'react';
// import { create } from 'ipfs-http-client';

// const useIPFS = () => {
//   const [ipfs] = useState(() => {
//     // Connect to your IPFS node
//     // For local node: http://localhost:5001
//     // For Infura: https://ipfs.infura.io:5001
//     return create({ 
//       host: 'ipfs.infura.io',
//       port: 5001,
//       protocol: 'https',
//       headers: {
//         authorization: `Basic ${Buffer.from(
//           `${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`
//         ).toString('base64')}`
//       }
//     });
//   });

//   const uploadToIPFS = async (file, onProgress) => {
//     try {
//       // Upload file to IPFS
//       const result = await ipfs.add(file, {
//         progress: (bytes) => {
//           if (file.size) {
//             onProgress(bytes / file.size);
//           }
//         }
//       });
      
//       return result.path; // Returns the IPFS hash (CID)
//     } catch (error) {
//       console.error('IPFS upload error:', error);
//       throw error;
//     }
//   };

//   return { uploadToIPFS };
// };

// export default useIPFS;
