import { isAddress } from "ethers/lib/utils";
import { ethers, network } from "hardhat";

async function main() {
    const [proxyAdmin, tokenOwner, guest] = await ethers.getSigners();

    const holder = process.env.HOLDER
    const token = process.env.TOKEN

    if (!holder || !isAddress(holder)) throw new Error("Run command with HOLDER=0x env variable");
    if (!token || !isAddress(token)) throw new Error("Run command with TOKEN=0x env variable");
    const cbt = await ethers.getContractFactory("CoinBridgeToken"); 

    const impl = cbt.attach(token);

    const bal = await impl.connect(tokenOwner).balanceOf(holder);

    console.log(`Balance on ${network.name}: ${bal.toString()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  