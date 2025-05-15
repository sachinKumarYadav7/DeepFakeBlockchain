
import React, { useState } from "react";
import { Shield, CheckCircle, Info, ExternalLink } from "lucide-react";
import MediaUploader from "@/components/MediaUploader";
import VerificationForm from "@/components/VerificationForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVideoVerification } from "@/hooks/useVideoVerification";

const Upload = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'verify' | 'success'>('upload');
  const [uploadedData, setUploadedData] = useState<{
    ipfsHash: string;
    fileType: string;
    caption: string;
  } | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);
  
  const { wallet, connectWallet } = useVideoVerification();

  const handleUploadComplete = (ipfsHash: string, fileType: string, caption: string) => {
    setUploadedData({
      ipfsHash,
      fileType,
      caption
    });
    setCurrentStep('verify');
  };

  const handleVerificationComplete = () => {
    if (uploadedData) {
      setVerifiedHash(uploadedData.ipfsHash);
    }
    setCurrentStep('success');
  };

  const handleVerificationCancel = () => {
    setCurrentStep('upload');
  };

  const handleStartNew = () => {
    setUploadedData(null);
    setVerifiedHash(null);
    setCurrentStep('upload');
  };

  // const fileData = {
  //   hash: uploadedData.ipfsHash, // IPFS hash
  //   uploadedAt: new Date().toISOString(),
  // };

  // const existing = JSON.parse(localStorage.getItem("uploadedVideos") || "[]");
  //   existing.push(fileData);
  //   localStorage.setItem("uploadedVideos", JSON.stringify(existing));

  return (
    <div className="min-h-screen bg-instagram-bg text-instagram-fg py-8 px-4 mb-16 md:mb-0 md:pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Shield className="h-6 w-6 mr-2 text-instagram-primary" />
            Upload & Verify Media
          </h1>
          <p className="text-gray-400 mt-1">
            Upload your content and verify it on the blockchain
          </p>
        </div>

        {/* Main Content */}
        {currentStep === 'upload' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-5 border-instagram-border bg-instagram-secondary">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                    <Shield className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold">Upload & Verify</h3>
                  <p className="text-gray-400 text-sm">
                    Securely upload your media and establish its authenticity
                  </p>
                </div>
              </Card>
              
              <Card className="p-5 border-instagram-border bg-instagram-secondary">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold">Blockchain Proof</h3>
                  <p className="text-gray-400 text-sm">
                    Your media is cryptographically signed and stored on the blockchain
                  </p>
                </div>
              </Card>
              
              <Card className="p-5 border-instagram-border bg-instagram-secondary">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                    <ExternalLink className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold">Share With Confidence</h3>
                  <p className="text-gray-400 text-sm">
                    Share your verified media with embedded blockchain verification
                  </p>
                </div>
              </Card>
            </div>
            
            {!wallet ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-6">Connect your wallet to upload media</p>
                <Button onClick={connectWallet}>Connect Wallet</Button>
              </div>
            ) : (
              <MediaUploader 
                username="demo_user"
                onUploadComplete={handleUploadComplete}
              />
            )}
            
            <div className="text-center text-gray-400 mt-10">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Info className="h-4 w-4" />
                <span>All uploaded content is stored on IPFS and verified on the blockchain</span>
              </div>
            </div>
          </div>
        )}
        
        {currentStep === 'verify' && uploadedData && (
          <VerificationForm 
            ipfsHash={uploadedData.ipfsHash}
            fileType={uploadedData.fileType}
            onComplete={handleVerificationComplete}
            onCancel={handleVerificationCancel}
          />
        )}

        
        
        {currentStep === 'success' && (
          <div className="max-w-lg mx-auto text-center space-y-6 py-10">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold">Verification Complete!</h2>
            <p className="text-gray-400">
              Your media has been successfully verified and recorded on the blockchain. You can now share it with confidence.
            </p>
            
            {verifiedHash && (
              <div className="bg-instagram-secondary border border-instagram-border rounded-lg p-4 mt-6">
                <p className="text-sm text-gray-400 mb-2">Verification Hash</p>
                <code className="text-xs md:text-sm font-mono bg-black/30 p-2 rounded block overflow-x-auto">
                  {verifiedHash}
                </code>
              </div>
            )}
            
            <div className="flex justify-center gap-4 mt-8">
              <Button onClick={handleStartNew}>
                Verify Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
