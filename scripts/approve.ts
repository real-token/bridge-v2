import { isAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ONE_ETHER } from "../utils";

async function main() {
    const [proxyAdmin, tokenOwner, guest] = await ethers.getSigners();

    const spender = process.env.SPENDER
    const token = process.env.TOKEN

    if (!spender || !isAddress(spender)) throw new Error("Run command with SPENDER=0x env variable");
    if (!token || !isAddress(token)) throw new Error("Run command with TOKEN=0x env variable");
    const cbt = await ethers.getContractFactory("CoinBridgeToken"); 

    const impl = cbt.attach(token);

    const mint = await impl.connect(tokenOwner).mint(tokenOwner.address, ONE_ETHER.mul("100000000"));

    await mint.wait()
    const tx = await impl.connect(tokenOwner).approve(spender, ethers.constants.MaxUint256);
    await tx.wait()
    console.log(tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  