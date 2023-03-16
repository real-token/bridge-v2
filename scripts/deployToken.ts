import { isAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ONE_ETHER } from "../utils";

async function main() {
    const [proxyAdmin, tokenOwner, guest] = await ethers.getSigners();

    const processor = process.env.PROCESSOR
    const trusted = process.env.TRUSTED

    const name = "TSTNM"
    const symbol = "TSTSMBL"
    if (!processor || !isAddress(processor)) throw new Error("Run command with PROCESSOR=0x env variable");
    if (!trusted || !isAddress(trusted)) throw new Error("Run command with TRUSTED=0x env variable");


    const cbt = await ethers.getContractFactory("CoinBridgeToken"); 
    const aup = await ethers.getContractFactory("AdminUpgradeabilityProxy");

    const impl = await cbt.deploy();
    await impl.deployed();

    const init = cbt.interface.encodeFunctionData('initialize(address,address,string,string,uint8,address[])', [tokenOwner.address, processor, name, symbol, "18", [trusted]])

    const proxy = await aup.deploy(impl.address, proxyAdmin.address, init)
    await proxy.deployed();

    const addSupplier = cbt.interface.encodeFunctionData('addSupplier', [tokenOwner.address]);
    const mint = cbt.interface.encodeFunctionData('mint', [tokenOwner.address, ONE_ETHER.mul("10000")]);

    const tx1 = await (proxy).connect(tokenOwner).fallback({ data: addSupplier })
    const tx2 = await (proxy).connect(tokenOwner).fallback({ data: mint })


    console.log(proxy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  