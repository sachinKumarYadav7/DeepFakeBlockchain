import React, { useState, useRef } from "react";
import { useIPFS } from "../hooks/useIPFS";
import { FiUpload, FiX, FiImage, FiVideo } from "react-icons/fi";

const UploadImageVideo = ({ username }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' or 'video'
  
  const fileInputRef = useRef(null);
  const { uploadToIPFS } = useIPFS();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.match(/image.*|video.*/)) {
      setError("Only image (JPEG, PNG, GIF) or video (MP4, MOV) files are allowed");
      return;
    }

    setError(null);
    setFile(selectedFile);
    setFileType(selectedFile.type.split('/')[0]); // 'image' or 'video'
    
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
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
      // Here you would typically save `ipfsHash` to your DB
      // Example: await savePostToDB({ caption, ipfsHash, username, type: fileType });
      
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="space-y-4">
        {/* User Avatar + Caption Input */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">
              {username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <input
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
          />
        </div>

        {/* File Preview */}
        {preview && (
          <div className="relative">
            {fileType === 'image' ? (
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full rounded-lg max-h-96 object-contain border border-gray-200"
              />
            ) : (
              <video 
                src={preview} 
                controls
                className="w-full rounded-lg max-h-96 border border-gray-200"
              />
            )}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
            <FiUpload className="h-5 w-5" />
            <span>Choose {fileType || 'File'}</span>
            <input
              type="file"
              hidden
              accept="image/*,video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`ml-auto px-4 py-2 rounded-lg text-white font-medium ${(!file || isUploading) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? "Uploading..." : "Post"}
          </button>
        </div>

        {/* File Type Indicators */}
        {file && (
          <div className="flex gap-2 text-sm">
            <span className={`flex items-center gap-1 px-2 py-1 rounded ${fileType === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              <FiImage className="h-4 w-4" />
              {fileType === 'image' ? 'Image' : 'Not image'}
            </span>
            <span className={`flex items-center gap-1 px-2 py-1 rounded ${fileType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              <FiVideo className="h-4 w-4" />
              {fileType === 'video' ? 'Video' : 'Not video'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadImageVideo;