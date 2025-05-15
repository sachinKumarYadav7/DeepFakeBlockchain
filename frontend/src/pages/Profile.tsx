
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, Clock, ExternalLink, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVideoVerification } from "@/hooks/useVideoVerification";
import { Badge } from "@/components/ui/badge";
import ipfsCid from "../../../backend/ipfsCid.json"

interface FeedItem {
  id: string;
  ipfsHash: string;
  caption: string;
  fileType: 'image' | 'video';
  uploader: string;
  timestamp: number;
  isGenuine: boolean;
}

const Profile = () => {
  const { address } = useParams<{ address?: string }>();
  const [userMedia, setUserMedia] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet, genuineScore } = useVideoVerification();
  const targetAddress = address || wallet;

  // Mock function to fetch user media data
  const fetchUserMedia = async () => {
    setLoading(true);

    const lastTwo = ipfsCid.cid.slice(-2);
    // console.log("Last two items:", lastTwo[0].ipfscid, lastTwo[0].mediatype);
    
    try {
      // This is mock data - in a real application, you would fetch from a server or blockchain
      const mockUserMedia: FeedItem[] = [
        {
          id: "2",
          ipfsHash: lastTwo[1].ipfscid,
          caption: "My first blockchain-verified video",
          fileType: lastTwo[1].mediatype,
          uploader: targetAddress || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          timestamp: Date.now() - 86400000, // 1 day ago
          isGenuine: true
        },
        {
          id: "5",
          ipfsHash: lastTwo[0].ipfscid,
          caption: "Beautiful mountain landscape",
          fileType: lastTwo[0].mediatype,
          uploader: targetAddress || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          timestamp: Date.now() - 432000000, // 5 days ago
          isGenuine: true
        }
      ];
      
      
      setUserMedia(mockUserMedia);
    } catch (error) {
      console.error("Error fetching user media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMedia();
  }, [targetAddress]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return Math.floor(seconds) + " seconds ago";
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-instagram-bg text-instagram-fg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-3">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              Profile
            </h1>
            <p className="text-gray-400 text-sm">
              {address ? `Viewing ${truncateAddress(address)}` : 'Your uploads'}
            </p>
          </div>
        </div>

        {/* User Info */}
        <Card className="p-6 mb-8 border-instagram-border bg-instagram-secondary">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-instagram-primary/20 flex items-center justify-center">
              <User className="h-10 w-10 text-instagram-fg/70" />
            </div>
            <div>
              <h2 className="text-xl font-medium">{truncateAddress(targetAddress || '')}</h2>
              {genuineScore !== null && (
                <p className="text-sm text-gray-400 mb-2">
                  Genuine Score: <span className="text-instagram-primary">{genuineScore}</span>
                </p>
              )}
              <p className="text-sm text-gray-400">
                {userMedia.length} authenticated media uploads
              </p>
            </div>
          </div>
        </Card>
        
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <Card key={i} className="p-6 border-instagram-border bg-instagram-secondary animate-pulse">
                <div className="h-64 bg-gray-700/30 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-700/30 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700/30 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {userMedia.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-6">No media uploads found</p>
                <Link to="/upload">
                  <Button>Upload Your First Media</Button>
                </Link>
              </div>
            ) : (
              userMedia.map(item => (
                <Card key={item.id} className="overflow-hidden border-instagram-border bg-instagram-secondary">
                  <div className="p-4 border-b border-instagram-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-instagram-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-instagram-fg/70" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{truncateAddress(item.uploader)}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(item.timestamp)}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={item.isGenuine ? "default" : "destructive"} className="ml-auto">
                      {item.isGenuine ? "Genuine" : "Deepfake"}
                    </Badge>
                  </div>
                  
                  <div className="bg-black/30">
                    {item.fileType === 'image' ? (
                      <img 
                      // http://127.0.0.1:8080/ipfs/${item.ipfsHash}
                        src={`http://127.0.0.1:8080/ipfs/${item.ipfsHash}`}
                        alt={item.caption}
                        className="w-full h-[320px] object-contain" 
                      />
                    ) : (
                      <div className="relative w-full h-[320px] flex items-center justify-center">
                        <video 
                          src={`http://127.0.0.1:8080/ipfs/${item.ipfsHash}`}
                          controls
                          className="max-h-full max-w-full" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <p className="text-sm mb-3">{item.caption}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Hash: {item.ipfsHash.substring(0, 18)}...
                      </p>
                      <Button variant="ghost" size="sm" className="text-instagram-primary">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        IPFS Link
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
