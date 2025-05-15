// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Register {
    
    struct User {
        string username;
        string bio;
        int GS;  // Good Score
        string profilePic; // Could be IPFS hash
        address userAddress;
    }

    mapping(address => User) public users;
    mapping(string => bool) private usernameTaken;

    event UserRegistered(address indexed userAddress, string username);

    modifier notRegistered() {
        require(bytes(users[msg.sender].username).length == 0, "Already registered");
        _;
    }

    modifier usernameAvailable(string memory _username) {
        require(!usernameTaken[_username], "Username already taken");
        _;
    }

    function registerUser(
        string memory _username, 
        string memory _bio, 
        string memory _profilePic
    ) public notRegistered usernameAvailable(_username) {
        
        require(bytes(_username).length > 0, "Username cannot be empty");

        users[msg.sender] = User({
            username: _username,
            bio: _bio,
            GS: 100,   // Assign Good Score 100 at start
            profilePic: _profilePic,
            userAddress: msg.sender
        });

        usernameTaken[_username] = true;

        emit UserRegistered(msg.sender, _username);
    }

    function getUser(address _userAddress) public view returns (User memory) {
        require(bytes(users[_userAddress].username).length > 0, "User not found");
        return users[_userAddress];
    }

    function isRegistered(address _userAddress) public view returns (bool) {
    return bytes(users[_userAddress].username).length > 0;
    }

}
