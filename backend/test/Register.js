const { expect } = require("chai");

describe("Register Contract", function () {
  let Register, register, owner, addr1, addr2;

  beforeEach(async function () {
    Register = await ethers.getContractFactory("Register");
    [owner, addr1, addr2] = await ethers.getSigners();
    register = await Register.deploy(); // No .deployed() needed in ethers v6+
  });

  it("Should register a new user successfully", async function () {
    await register.registerUser("sachin", "Web3 Developer", "profilePicHash");

    const user = await register.getUser(owner.address);
    expect(user.username).to.equal("sachin");
    expect(user.bio).to.equal("Web3 Developer");
    expect(user.GS).to.equal(100);
    expect(user.profilePic).to.equal("profilePicHash");
    expect(user.userAddress).to.equal(owner.address);
  });

  it("Should not allow duplicate usernames", async function () {
    await register.registerUser("sachin", "Web3 Dev", "profileHash");

    await expect(
      register.connect(addr1).registerUser("sachin", "Blockchain Dev", "picHash")
    ).to.be.revertedWith("Username already taken");
  });

  it("Should not allow empty username", async function () {
    await expect(
      register.registerUser("", "bio", "picHash")
    ).to.be.revertedWith("Username cannot be empty");
  });

  it("Should not allow same address to register twice", async function () {
    await register.registerUser("sachin", "Developer", "picHash");

    await expect(
      register.registerUser("newname", "NewBio", "newHash")
    ).to.be.revertedWith("Already registered");
  });

  it("Should fetch correct user data for different addresses", async function () {
    await register.registerUser("sachin", "bio1", "pic1");

    await register.connect(addr1).registerUser("rahul", "bio2", "pic2");

    const user1 = await register.getUser(owner.address);
    const user2 = await register.getUser(addr1.address);

    expect(user1.username).to.equal("sachin");
    expect(user2.username).to.equal("rahul");
  });

  it("Should revert if user not found", async function () {
    await expect(
      register.getUser(addr1.address)
    ).to.be.revertedWith("User not found");
  });
});
