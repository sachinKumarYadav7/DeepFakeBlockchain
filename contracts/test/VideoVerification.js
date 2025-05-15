const { expect } = require("chai");

describe("VideoVerification", function () {
  let videoContract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    const VideoVerification = await ethers.getContractFactory("VideoVerification");
    [owner, addr1, addr2] = await ethers.getSigners();
    videoContract = await VideoVerification.deploy();
    await videoContract.waitForDeployment();
  });

  it("Should upload a genuine video", async function () {
    await expect(videoContract.uploadGenuineVideo(
      "video123",
      "phash123",
      "dct123",
      "hist123",
      "ai123"
    )).to.emit(videoContract, "GenuineVideoUploaded");

    const video = await videoContract.videos("video123");
    expect(video.uploader).to.equal(owner.address);
    expect(video.isDeepfake).to.equal(false);
  });

  it("Should log a deepfake attempt", async function () {
    await expect(videoContract.connect(addr1).logDeepfakeAttempt(
      "fakevideo456",
      "phashFake",
      "dctFake",
      "histFake",
      "aiFake"
    )).to.emit(videoContract, "DeepfakeAttemptLogged");

    const video = await videoContract.videos("fakevideo456");
    expect(video.isDeepfake).to.equal(true);
    expect(video.uploader).to.equal(addr1.address);
  });

  it("Should request and grant permission", async function () {
    await videoContract.uploadGenuineVideo(
      "video789",
      "phash789",
      "dct789",
      "hist789",
      "ai789"
    );

    await expect(videoContract.connect(addr1).requestPermission("video789"))
      .to.emit(videoContract, "PermissionRequested");

    await expect(videoContract.grantPermission(
      "video789",
      addr1.address,
      "videoReuse001"
    )).to.emit(videoContract, "PermissionGranted");

    const newVideo = await videoContract.videos("videoReuse001");
    expect(newVideo.uploader).to.equal(addr1.address);
    expect(newVideo.originalOwner).to.equal(owner.address);
    expect(newVideo.permissionedReuse).to.equal(true);
  });

});
