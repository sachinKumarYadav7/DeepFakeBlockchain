const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Storage
    const Storage = await hre.ethers.getContractFactory("storageVid");
    const storage = await Storage.deploy();
    await storage.waitForDeployment();
    console.log("Storage deployed to:", storage.target);

    // Deploy vidTraceAbility
    const Vid = await hre.ethers.getContractFactory("VidTraceability");
    const vid = await Vid.deploy();
    await vid.waitForDeployment();
    console.log("VidTraceAbility deployed to:", vid.target);

    // Deploy VideoVerification
    const VideoVerification = await hre.ethers.getContractFactory("VideoVerification");
    const videoVerification = await VideoVerification.deploy();
    await videoVerification.waitForDeployment();
    console.log("VideoVerifaction deployed to:", videoVerification.target);

    // Deploy Register
    const Register = await hre.ethers.getContractFactory("Register");
    const register = await Register.deploy();
    await register.waitForDeployment();
    console.log("Register deployed to:", register.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
