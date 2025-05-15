
import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import VideoVerification from "../contracts/VideoVerification.json";
import { CONTRACT_ADDRESS } from "../constants";
import { toast } from "@/components/ui/use-toast";

export interface VideoDetails {
  uploader: string;
  isDeepfake: boolean;
  timestamp: number;
  originalOwner: string;
  permissionedReuse: boolean;
}

export function useVideoVerification() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [genuineScore, setGenuineScore] = useState<number | null>(null);

  // Connect to wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install MetaMask to use this feature",
        variant: "destructive",
      });
      return false;
    }

    setIsConnecting(true);
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      const vc = new Contract(CONTRACT_ADDRESS, VideoVerification.abi, signer);
      
      setWallet(address);
      setContract(vc);
      
      await getGenuineScore(address, vc);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      
      return true;
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet(null);
    setContract(null);
    setGenuineScore(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
    
    return true;
  };
  
  // Upload video verification data
  const uploadVideo = async (
    videoId: string,
    phash: string,
    dctHash: string,
    histHash: string, 
    aiHash: string,
    isGenuine: boolean
  ) => {
    if (!contract || !wallet) {
      const connected = await connectWallet();
      if (!connected) return null;
    }
    
    try {
      const tx = isGenuine
        ? await contract!.uploadGenuineVideo(videoId, phash, dctHash, histHash, aiHash)
        : await contract!.logDeepfakeAttempt(videoId, phash, dctHash, histHash, aiHash);
      
      toast({
        title: "Transaction Submitted",
        description: "Please wait while your transaction is processed...",
      });
      
      await tx.wait();
      
      toast({
        title: isGenuine ? "Video Verified" : "Deepfake Logged",
        description: isGenuine 
          ? "Your genuine video was successfully verified on the blockchain!" 
          : "Thank you for reporting this deepfake attempt.",
        variant: "default",
      });
      
      // Update genuine score
      if (wallet) {
        getGenuineScore(wallet, contract);
      }
      
      return tx.hash;
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Transaction Failed",
        description: error.shortMessage || error.message || "An unknown error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get video details
  const getVideoDetails = async (videoId: string): Promise<VideoDetails | null> => {
    if (!contract || !wallet) {
      const connected = await connectWallet();
      if (!connected) return null;
    }
    
    try {
      const result = await contract!.getVideoDetails(videoId);
      return {
        uploader: result[0],
        isDeepfake: result[1],
        timestamp: Number(result[2]),
        originalOwner: result[3],
        permissionedReuse: result[4],
      };
    } catch (error) {
      console.error("Error fetching video details:", error);
      return null;
    }
  };

  // Get genuine score
  const getGenuineScore = async (address: string, contractInstance: Contract | null = null) => {
    try {
      const targetContract = contractInstance || contract;
      if (!targetContract) return null;
      
      const result = await targetContract.getUserGenuineScore(address);
      setGenuineScore(Number(result));
      return Number(result);
    } catch (error) {
      console.error("Error fetching genuine score:", error);
      return null;
    }
  };

  // Check wallet connection on mount
  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet,
    uploadVideo,
    getVideoDetails,
    getGenuineScore,
    genuineScore,
    isConnecting
  };
}
