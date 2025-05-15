
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Clock, ExternalLink, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVideoVerification } from "@/hooks/useVideoVerification";
import { Badge } from "@/components/ui/badge";

// Mock data structure for feed items
interface FeedItem {
  id: string;
  ipfsHash: string;
  caption: string;
  fileType: 'image' | 'video';
  uploader: string;
  timestamp: number;
  isGenuine: boolean;
}

const Feed = () => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { wallet, connectWallet, genuineScore } = useVideoVerification();

  // Mock function to fetch feed data
  const fetchFeedData = async () => {
    setLoading(true);
    
    try {
      // This is mock data - in a real application, you would fetch from a server or blockchain
      const mockFeedItems: FeedItem[] = [
        {
          id: "1",
          ipfsHash: "Qmf9T7kXn3vTRqH8FRoDsMYQryqPsW9Vh3VkgwzRD7Mmqz",
          caption: "Beautiful sunset captured yesterday",
          fileType: 'image',
          uploader: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          timestamp: Date.now() - 3600000, // 1 hour ago
          isGenuine: true
        },
        {
          id: "2",
          ipfsHash: "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR",
          caption: "My first blockchain-verified video",
          fileType: 'video',
          uploader: wallet || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
          timestamp: Date.now() - 86400000, // 1 day ago
          isGenuine: true
        },
        {
          id: "3",
          ipfsHash: "QmT7fzfkMBcMvZDdVSs8gjXt6VwQXnDDVyCftC4ARcpYR5",
          caption: "Nature documentary clips",
          fileType: 'video',
          uploader: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
          timestamp: Date.now() - 172800000, // 2 days ago
          isGenuine: true
        },
        {
          id: "4",
          ipfsHash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",
          caption: "AI art experiment",
          fileType: 'image',
          uploader: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
          timestamp: Date.now() - 259200000, // 3 days ago
          isGenuine: false
        }
      ];
      
      setFeedItems(mockFeedItems);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedData();
  }, []);

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
    <div className="min-h-screen bg-instagram-bg text-instagram-fg py-8 px-4 mb-16 md:mb-0 md:pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Shield className="h-6 w-6 mr-2 text-instagram-primary" />
              Web3Social Feed
            </h1>
            <p className="text-gray-400 mt-1">
              Recent verified media from the community
            </p>
          </div>
          
          {!wallet ? (
            <Button onClick={connectWallet} size="sm">
              Connect Wallet
            </Button>
          ) : (
            <Link to="/upload">
              <Button variant="outline" className="border-instagram-border">
                Upload New
              </Button>
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 border-instagram-border bg-instagram-secondary animate-pulse">
                <div className="h-64 bg-gray-700/30 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-700/30 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700/30 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {feedItems.map(item => (
              <Card key={item.id} className="overflow-hidden border-instagram-border bg-instagram-secondary">
                <div className="p-4 border-b border-instagram-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/profile/${item.uploader}`}>
                      <div className="h-10 w-10 rounded-full bg-instagram-primary/20 flex items-center justify-center cursor-pointer hover:bg-instagram-primary/30 transition-all">
                        <User className="h-5 w-5 text-instagram-fg/70" />
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${item.uploader}`}>
                        <p className="text-sm font-medium hover:underline">
                          {truncateAddress(item.uploader)}
                        </p>
                      </Link>
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
                      src={`https://ipfs.io/ipfs/${item.ipfsHash}`}
                      alt={item.caption}
                      className="w-full h-[320px] object-contain" 
                    />
                  ) : (
                    <div className="relative w-full h-[320px] flex items-center justify-center">
                      <video 
                        src={`https://ipfs.io/ipfs/${item.ipfsHash}`}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
