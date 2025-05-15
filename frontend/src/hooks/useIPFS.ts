import { useState } from "react";
import { create } from "ipfs-http-client";
import fs from 'fs/promises';
// import path from 'path';

// Configuration for Local IPFS Node
const IPFS_API = {
  host: 'localhost',
  port: 5001,
  protocol: 'http'
};

export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  let ipfs;

  try {
    ipfs = create(IPFS_API);
    console.log("Connected to Local IPFS Node");
  } catch (err) {
    console.error("Failed to connect to Local IPFS Node:", err);
    // Fall back to mock behavior if connection fails
    console.warn("Using mock IPFS behavior");
  }
  
  async function appendToJsonFile(data, filePath = 'responses.json') {
    try {
        const absolutePath = (filePath);
        let allResponses = [];

        // Check if file exists and read existing data
        try {
            const fileContent = await fs.readFile(absolutePath, 'utf8');
            allResponses = JSON.parse(fileContent);
            
            // Ensure allResponses is an array
            if (!Array.isArray(allResponses)) {
                allResponses = [allResponses];
            }
        } catch (error) {
            // File doesn't exist or is empty/corrupted
            allResponses = [];
        }

        // Append new data
        allResponses.push(data);

        // Write updated data back to file
        await fs.writeFile(absolutePath, JSON.stringify(allResponses, null, 2));
        
        return true;
    } catch (error) {
        console.error('Error appending to JSON file:', error);
        throw error;
    }
 }


  const uploadToIPFS = async (file: File, onProgress?: (progress: number) => void) => {
    setIsUploading(true);

    try {
      // Use real IPFS if available
      if (ipfs) {
        const { path } = await ipfs.add(file, {
          progress: (bytes) => {
            if (onProgress) onProgress(bytes / file.size);
          }
        });
        // console.log("hi", path)
        appendToJsonFile({path}, "response.json");
        return path;
      }

      // Fallback to mock IPFS if real IPFS isn't available
      const totalTime = 3000; // 3 seconds for simulation
      const intervalTime = 100; // Update every 100ms
      const steps = totalTime / intervalTime;
      
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        if (onProgress) onProgress(progress);
        await new Promise(resolve => setTimeout(resolve, intervalTime));
      }
      
      // Generate a mock IPFS hash
      const fileId = Math.random().toString(36).substring(2, 15);
      const mockIPFSHash = `Qm${fileId}${Date.now().toString(16)}`;
      
      return mockIPFSHash;
    } catch (err) {
      console.error("IPFS upload error:", err);
      throw new Error("Failed to upload to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToIPFS,
    isUploading
  };
}