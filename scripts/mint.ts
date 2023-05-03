import { isAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ONE_ETHER } from "../utils";

async function main() {
    const [, proxyAdmin, tokenOwner, guest] = await ethers.getSigners();

    const destination = process.env.DEST
    const amount = process.env.AMOUNT ?? "10000"
    const token = process.env.TOKEN

    if (!destination || !isAddress(destination)) throw new Error("Run command with DEST=0x env variable");
    if (!token || !isAddress(token)) throw new Error("Run command with TOKEN=0x env variable");
    const cbt = await ethers.getContractFactory("CoinBridgeToken"); 

    const impl = cbt.attach(token);

    const tx = await impl.connect(tokenOwner).mint(destination, ONE_ETHER.mul(amount));

    await tx.wait();
    console.log(`tx: ${tx.hash}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  