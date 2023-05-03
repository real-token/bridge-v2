import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { ONE_ETHER } from "../utils";

async function main() {
    const [, mainSigner] = await ethers.getSigners();

    await setBalance(mainSigner.address, ONE_ETHER.mul("100000000"))
    
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });