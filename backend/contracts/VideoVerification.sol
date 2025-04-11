// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VideoVerification {

    struct Video {
        string videoId; // IPFS hash
        address uploader;
        string phash;
        string dctHash;
        string histHash;
        string aiFeaturesHash;
        bool isDeepfake;
        uint timestamp;
        address[] permissionRequests;
        address originalOwner; // For permissioned reuse
        bool permissionedReuse;
    }

    mapping(string => Video) public videos; // videoId => Video
    mapping(address => uint) public genuineScore;

    event GenuineVideoUploaded(string indexed videoId, address indexed uploader);
    event DeepfakeAttemptLogged(string indexed videoId, address indexed uploader);
    event PermissionRequested(string indexed originalVideoId, address indexed requester);
    event PermissionGranted(string indexed originalVideoId, address indexed newUploader, string indexed newVideoId);

    /// Upload genuine video after validation
    function uploadGenuineVideo(
        string memory _videoId,
        string memory _phash,
        string memory _dctHash,
        string memory _histHash,
        string memory _aiFeaturesHash
    ) public {
        require(videos[_videoId].timestamp == 0, "Video already exists");

        address[] memory empty;

        videos[_videoId] = Video({
            videoId: _videoId,
            uploader: msg.sender,
            phash: _phash,
            dctHash: _dctHash,
            histHash: _histHash,
            aiFeaturesHash: _aiFeaturesHash,
            isDeepfake: false,
            timestamp: block.timestamp,
            permissionRequests: empty,
            originalOwner: address(0),
            permissionedReuse: false
        });

        genuineScore[msg.sender] += 1;
        emit GenuineVideoUploaded(_videoId, msg.sender);
    }

    /// Log a deepfake attempt without storing it as a public video
    function logDeepfakeAttempt(
        string memory _videoId,
        string memory _phash,
        string memory _dctHash,
        string memory _histHash,
        string memory _aiFeaturesHash
    ) public {
        address[] memory empty;

        videos[_videoId] = Video({
            videoId: _videoId,
            uploader: msg.sender,
            phash: _phash,
            dctHash: _dctHash,
            histHash: _histHash,
            aiFeaturesHash: _aiFeaturesHash,
            isDeepfake: true,
            timestamp: block.timestamp,
            permissionRequests: empty,
            originalOwner: address(0),
            permissionedReuse: false
        });

        if (genuineScore[msg.sender] >= 10) {
            genuineScore[msg.sender] -= 10;
        } else {
            genuineScore[msg.sender] = 0;
        }

        emit DeepfakeAttemptLogged(_videoId, msg.sender);
    }

    /// Request permission to reuse a video
    function requestPermission(string memory _videoId) public {
        require(videos[_videoId].timestamp != 0, "Video not found");
        videos[_videoId].permissionRequests.push(msg.sender);
        emit PermissionRequested(_videoId, msg.sender);
    }

    /// Grant permission to reuse video to another uploader
    function grantPermission(
        string memory _originalVideoId,
        address _newUploader,
        string memory _newVideoId
    ) public {
        Video storage original = videos[_originalVideoId];
        require(original.timestamp != 0, "Original video not found");
        require(original.uploader == msg.sender, "Only original uploader can grant permission");
        require(videos[_newVideoId].timestamp == 0, "New videoId already exists");

        address[] memory empty;

        videos[_newVideoId] = Video({
            videoId: _newVideoId,
            uploader: _newUploader,
            phash: original.phash,
            dctHash: original.dctHash,
            histHash: original.histHash,
            aiFeaturesHash: original.aiFeaturesHash,
            isDeepfake: false,
            timestamp: block.timestamp,
            permissionRequests: empty,
            originalOwner: msg.sender,
            permissionedReuse: true
        });

        emit PermissionGranted(_originalVideoId, _newUploader, _newVideoId);
    }

    /// Get details of a video
    function getVideoDetails(string memory _videoId) public view returns (
        address uploader,
        bool isDeepfake,
        uint timestamp,
        address originalOwner,
        bool permissionedReuse
    ) {
        Video memory v = videos[_videoId];
        return (
            v.uploader,
            v.isDeepfake,
            v.timestamp,
            v.originalOwner,
            v.permissionedReuse
        );
    }

    /// Get genuine score of a user
    function getUserGenuineScore(address user) public view returns (uint) {
        return genuineScore[user];
    }

    /// Get permission requests for a video
    function getPermissionRequests(string memory _videoId) public view returns (address[] memory) {
        return videos[_videoId].permissionRequests;
    }
}