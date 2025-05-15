import React, { useState, useEffect } from "react";
import { useVideoVerification } from "@/hooks/useVideoVerification";
import { 
  Shield, X, Check, AlertTriangle, 
  Loader2, ExternalLink, Clock, User,
  Fingerprint, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface VerificationFormProps {
  ipfsHash: string;
  fileType: string;
  onComplete: () => void;
  onCancel: () => void;
}

const VerificationForm = ({ ipfsHash, fileType, onComplete, onCancel }: VerificationFormProps) => {
  // Generated hashes for the video/image
  const [phash, setPhash] = useState("");
  const [dctHash, setDctHash] = useState("");
  const [histHash, setHistHash] = useState("");
  const [aiHash, setAiHash] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenuine, setIsGenuine] = useState(true);
  
  const { uploadVideo, wallet, connectWallet, genuineScore, isConnecting } = useVideoVerification();
  const { toast } = useToast();
  
  // Generate hashes (mock function that would be replaced with real hash generation)
  useEffect(() => {
    const simulateHashGeneration = async () => {
      setIsLoading(true);
      
      // Simulate hash generation - in a real app these would be generated from the media
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const timestamp = Date.now().toString();
      setPhash(`ph_${ipfsHash.substring(0, 8)}_${timestamp.substring(timestamp.length - 5)}`);
      setDctHash(`dct_${ipfsHash.substring(0, 7)}_${timestamp.substring(timestamp.length - 5)}`);
      setHistHash(`hist_${ipfsHash.substring(0, 6)}_${timestamp.substring(timestamp.length - 5)}`);
      setAiHash(`ai_${ipfsHash.substring(0, 9)}_${timestamp.substring(timestamp.length - 5)}`);
      
      setIsLoading(false);
    };
    
    simulateHashGeneration();
  }, [ipfsHash]);
  
  const handleUpload = async () => {
    if (!wallet) {
      const connected = await connectWallet();
      if (!connected) return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await uploadVideo(
        ipfsHash,
        phash,
        dctHash,
        histHash,
        aiHash,
        isGenuine
      );
      
      if (result) {
        toast({
          title: "Verification Complete",
          description: `Your ${fileType} has been successfully verified on the blockchain.`,
        });
        
        // Wait a moment before transitioning
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-instagram-border bg-instagram-secondary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-instagram-primary" />
            <CardTitle>Media Verification</CardTitle>
          </div>
          
          {genuineScore !== null && (
            <Badge variant="outline" className="bg-instagram-primary/10 border-instagram-primary/20 text-instagram-primary">
              Score: {genuineScore}
            </Badge>
          )}
        </div>
        <CardDescription>
          Verify authenticity of your media on the blockchain
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ipfs-hash">IPFS Content ID</Label>
          <div className="flex">
            <Input
              id="ipfs-hash"
              value={ipfsHash}
              readOnly
              className="instagram-input text-sm font-mono"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank')}
              className="ml-2"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your {fileType} is stored on IPFS with the above content identifier
          </p>
        </div>
        
        <Separator className="bg-instagram-border my-6" />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Fingerprint className="h-4 w-4" />
              Cryptographic Signatures
            </h3>
            
            {isLoading ? (
              <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-400">
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phash" className="text-xs">Perceptual Hash</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="phash"
                  value={phash}
                  readOnly
                  className="instagram-input text-xs font-mono"
                />
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="dctHash" className="text-xs">DCT Hash</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="dctHash"
                  value={dctHash}
                  readOnly
                  className="instagram-input text-xs font-mono"
                />
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="histHash" className="text-xs">Histogram Hash</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="histHash"
                  value={histHash}
                  readOnly
                  className="instagram-input text-xs font-mono"
                />
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="aiHash" className="text-xs">AI Features Hash</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Input
                  id="aiHash"
                  value={aiHash}
                  readOnly
                  className="instagram-input text-xs font-mono"
                />
              )}
            </div>
          </div>
        </div>
        
        <Separator className="bg-instagram-border my-6" />
        
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <Label htmlFor="isGenuine" className="text-base font-medium">This {fileType} is genuine</Label>
              <p className="text-xs text-gray-400">
                Mark this content as original and authentic
              </p>
            </div>
            <Switch
              id="isGenuine"
              checked={isGenuine}
              onCheckedChange={setIsGenuine}
              disabled={isSubmitting}
            />
          </div>
          
          {!isGenuine && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>
                By marking this as non-genuine, you're helping identify potentially manipulated media. 
                Our system will add this to the blockchain as a known deepfake example.
              </p>
            </div>
          )}
          
          {!wallet && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-300 flex items-start gap-2">
              <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p>
                You'll need to connect your wallet to verify this media on the blockchain. 
                Click "Verify" to connect.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-400 hover:text-gray-300 hover:bg-transparent"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button 
          onClick={handleUpload} 
          disabled={isLoading || isSubmitting}
          className="bg-instagram-primary hover:bg-instagram-primary/90"
        >
          {isSubmitting || isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isConnecting ? "Connecting..." : "Processing..."}
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Verify on Blockchain
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerificationForm;
