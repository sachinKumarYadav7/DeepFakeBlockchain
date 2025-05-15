
import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import { useIPFS } from "@/hooks/useIPFS";
import { 
  Upload, X, Image, Video, 
  UserCircle, Check, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

interface MediaUploaderProps {
  username: string;
  onUploadComplete: (ipfsHash: string, fileType: string, caption: string) => void;
}

const MediaUploader = ({ username, onUploadComplete }: MediaUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadToIPFS } = useIPFS();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.match(/image.*|video.*/)) {
      setError("Only image (JPEG, PNG, GIF) or video (MP4, MOV) files are allowed");
      return;
    }

    setError(null);
    setFile(selectedFile);
    setFileType(selectedFile.type.split('/')[0] as 'image' | 'video');
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    
    }

    setIsUploading(true);
    setProgress(0);
      

    try {
      const ipfsHash = await uploadToIPFS(file, (progress) => {
        setProgress(Math.round(progress * 100));
      });

      console.log("Uploaded to IPFS:", ipfsHash);
      await axios.post("http://localhost:5000/upload", {
        ipfs_cid: ipfsHash,
      });
      
      // setResults([response.data]);
      
      toast({
        title: "Upload Successful",
        description: "Your media has been uploaded to IPFS",
      });
      
      // Call the callback with the IPFS hash and other details
      onUploadComplete(ipfsHash, fileType || 'image', caption);
      
      // Reset form
      setCaption("");
      setFile(null);
      setPreview(null);
      setProgress(0);
      setFileType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("IPFS Upload Error:", err);
      
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your file to IPFS",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="instagram-card p-6 mb-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* User Avatar + Caption Input */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-instagram-secondary border border-instagram-border flex items-center justify-center text-gray-300">
            {username ? (
              <span className="font-medium uppercase">
                {username.charAt(0)}
              </span>
            ) : (
              <UserCircle className="h-6 w-6" />
            )}
          </div>
          <input
            className="instagram-input flex-1"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <Separator className="bg-instagram-border" />

        {/* File Preview */}
        {preview && (
          <div className="relative mt-4 rounded-xl overflow-hidden">
            {fileType === 'image' ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full max-h-96 object-contain rounded-xl"
              />
            ) : (
              <video 
                src={preview} 
                controls
                className="w-full max-h-96 rounded-xl"
              />
            )}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="my-4">
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-gray-400 text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border-instagram-border bg-transparent text-instagram-fg hover:bg-instagram-secondary"
          >
            <Upload className="h-5 w-5 mr-2" />
            <span>Choose {fileType || 'File'}</span>
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </Button>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="ml-auto"
            variant={!file || isUploading ? "secondary" : "default"}
          >
            {isUploading ? "Uploading..." : "Continue"}
          </Button>
        </div>

        {/* File Type Indicators */}
        {file && (
          <div className="flex gap-2 text-sm mt-2">
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${fileType === 'image' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' : 'bg-instagram-secondary text-gray-400'}`}>
              <Image className="h-4 w-4" />
              <span>{fileType === 'image' ? 'Image' : 'Not image'}</span>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${fileType === 'video' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-instagram-secondary text-gray-400'}`}>
              <Video className="h-4 w-4" />
              <span>{fileType === 'video' ? 'Video' : 'Not video'}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mt-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
