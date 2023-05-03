import { ethers } from "hardhat";

async function main() {
    const [, one, two, three, four, five, six, seven] = await ethers.getSigners();

    const prom1 = one.getBalance()
    // const prom2 = two.getBalance()
    // const prom3 = three.getBalance()
    // const prom4 = four.getBalance()
    // const prom5 = five.getBalance()
    // const prom6 = six.getBalance()
    // const prom7 = seven.getBalance()

    const balance = await Promise.all([prom1/*, prom2, prom3, prom4, prom5, prom6, prom7*/])
    balance.map((val) => console.log(val.toString()));
    
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });