// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract storageVid {
    string public name;
    uint public videoCount = 0;

    struct Video {
        uint id;
        string hash;
        string description;
        uint tipAmount;
        address payable author;
    }

    mapping(uint => Video) public videos;

    event VideoCreated(
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    event VideoTipped(
        uint id,
        string hash,
        string description,
        uint tipAmount,
        address payable author
    );

    constructor() {
        name = "Decentravideo";
    }

    function uploadVideo(string memory _videoHash, string memory _description) public {
        require(bytes(_videoHash).length > 0, "Video hash is required");
        require(bytes(_description).length > 0, "Video description is required");
        require(msg.sender != address(0), "Uploader address invalid");

        videoCount++;

        videos[videoCount] = Video(videoCount, _videoHash, _description, 0, payable(msg.sender));

        emit VideoCreated(videoCount, _videoHash, _description, 0, payable(msg.sender));
    }

    function tipVideoOwner(uint _id) public payable {
        require(_id > 0 && _id <= videoCount, "Invalid video ID");

        Video storage _video = videos[_id];
        address payable _author = _video.author;

        // Transfer tips using call (recommended way)
        (bool success, ) = _author.call{value: msg.value}("");
        require(success, "Transfer failed");

        _video.tipAmount += msg.value;

        emit VideoTipped(_id, _video.hash, _video.description, _video.tipAmount, _author);
    }
}
