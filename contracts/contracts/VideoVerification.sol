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

    struct Attempt {
        string videoId;
        address attemptedBy;
        uint timestamp;
    }

    struct PermissionGrant {
        string originalVideoId;
        address grantedTo;
        string reusedVideoId;
        uint timestamp;
    }

    mapping(string => Video) public videos; // videoId => Video
    mapping(address => uint) public genuineScore;

    Attempt[] public deepfakeAttempts;
    PermissionGrant[] public grantedPermissions;

    event GenuineVideoUploaded(
        string indexed videoId,
        address indexed uploader
    );
    event DeepfakeAttemptLogged(
        string indexed videoId,
        address indexed uploader
    );
    event PermissionRequested(
        string indexed originalVideoId,
        address indexed requester
    );
    event PermissionGranted(
        string indexed originalVideoId,
        address indexed newUploader,
        string indexed newVideoId
    );

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

        if (genuineScore[msg.sender] == 0) {
            genuineScore[msg.sender] = 100;
        } else {
            genuineScore[msg.sender] += 1;
        }

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

        deepfakeAttempts.push(
            Attempt({
                videoId: _videoId,
                attemptedBy: msg.sender,
                timestamp: block.timestamp
            })
        );

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
        require(
            original.uploader == msg.sender,
            "Only original uploader can grant permission"
        );
        require(
            videos[_newVideoId].timestamp == 0,
            "New videoId already exists"
        );

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

        grantedPermissions.push(
            PermissionGrant({
                originalVideoId: _originalVideoId,
                grantedTo: _newUploader,
                reusedVideoId: _newVideoId,
                timestamp: block.timestamp
            })
        );

        emit PermissionGranted(_originalVideoId, _newUploader, _newVideoId);
    }

    /// Get details of a video
    function getVideoDetails(
        string memory _videoId
    )
        public
        view
        returns (
            address uploader,
            bool isDeepfake,
            uint timestamp,
            address originalOwner,
            bool permissionedReuse
        )
    {
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
    function getPermissionRequests(
        string memory _videoId
    ) public view returns (address[] memory) {
        return videos[_videoId].permissionRequests;
    }

    /// Get number of deepfake attempts
    function getDeepfakeAttemptCount() public view returns (uint) {
        return deepfakeAttempts.length;
    }

    /// Get a specific deepfake attempt
    function getDeepfakeAttempt(
        uint index
    )
        public
        view
        returns (string memory videoId, address attemptedBy, uint timestamp)
    {
        Attempt memory a = deepfakeAttempts[index];
        return (a.videoId, a.attemptedBy, a.timestamp);
    }

    /// Get permission grant count
    function getPermissionGrantCount() public view returns (uint) {
        return grantedPermissions.length;
    }

    /// Get a specific granted permission
    function getPermissionGrant(
        uint index
    )
        public
        view
        returns (
            string memory originalVideoId,
            address grantedTo,
            string memory reusedVideoId,
            uint timestamp
        )
    {
        PermissionGrant memory p = grantedPermissions[index];
        return (p.originalVideoId, p.grantedTo, p.reusedVideoId, p.timestamp);
    }
}
