// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VidTraceability {
    address public owner;
    bytes32 public agreementFormIPFS;

    struct Video {
        address vidOwner;
        string info;
        bytes32 pHash;
        address scAddress;
        string metadata;
        string ipfsHash;
        uint256 timestamp;
    }

    struct Repost {
        address repostedBy;
        bytes32 parentPHash;
        bytes32 repostedPHash;
        string platform;
        string ipfsHash;
        uint256 timestamp;
        bool isAltered;
    }

    Video public mainVideo;
    mapping(bytes32 => Video) public allVideos;
    mapping(bytes32 => Repost) public reposts;
    bytes32[] public videoHashes;

    event VideoTracked(address indexed user, bytes32 parentPHash, bytes32 repostedPHash, bool isAltered);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        mainVideo = Video({
            vidOwner: msg.sender,
            info: "A comic video",
            pHash: keccak256(abi.encodePacked("sample video")),
            scAddress: address(this),
            metadata: "Date:18/9/2018, Time:5:57",
            ipfsHash: "QmExampleHash",
            timestamp: block.timestamp
        });
        allVideos[mainVideo.pHash] = mainVideo;
        videoHashes.push(mainVideo.pHash);
        agreementFormIPFS = keccak256(abi.encodePacked("AgreementForm"));
    }

    function hammingDistance(bytes32 a, bytes32 b) internal pure returns (uint256 dist) {
        for (uint i = 0; i < 32; i++) {
            uint8 x = uint8(a[i] ^ b[i]);
            while (x != 0) {
                dist += x & 1;
                x >>= 1;
            }
        }
    }

    function trackVideo(bytes32 newPHash, string memory platform, string memory ipfsHash) public {
        require(reposts[newPHash].timestamp == 0, "Video already reposted");

        bytes32 parentHash = bytes32(0);
        bool isAltered = true;
        bool similarFound = false;

        for (uint i = 0; i < videoHashes.length; i++) {
            bytes32 existingHash = videoHashes[i];
            uint256 dist = hammingDistance(newPHash, existingHash);
            if (dist <= 10) {
                parentHash = existingHash;
                similarFound = true;
                isAltered = true;
                break;
            }
        }

        if (!similarFound) {
            isAltered = false;
            parentHash = newPHash;

            Video memory newVideo = Video({
                vidOwner: msg.sender,
                info: "New unique video",
                pHash: newPHash,
                scAddress: address(this),
                metadata: "",
                ipfsHash: ipfsHash,
                timestamp: block.timestamp
            });

            allVideos[newPHash] = newVideo;
            videoHashes.push(newPHash);
        }

        reposts[newPHash] = Repost({
            repostedBy: msg.sender,
            parentPHash: parentHash,
            repostedPHash: newPHash,
            platform: platform,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isAltered: isAltered
        });

        emit VideoTracked(msg.sender, parentHash, newPHash, isAltered);
    }
} 
