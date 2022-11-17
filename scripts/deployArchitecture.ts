import { ethers, network } from "hardhat";
import { ComplianceRegistry, PriceOracle, Processor, RuleEngine } from "../typechain";

async function main() {
    const signers = await ethers.getSigners();

    const admin = signers[0]
    const currentNonce = await admin.getTransactionCount();

    await network.provider.send("evm_setAutomine", [false]);
    await network.provider.send("evm_setIntervalMining", [300]);

    const gfr = ethers.getContractFactory("GlobalFreezeRule"); // 0
    const ufr = ethers.getContractFactory("UserFreezeRule"); // 1
    const uktfr = ethers.getContractFactory("UserKycThresholdFromRule"); // 2
    const ukttr = ethers.getContractFactory("UserKycThresholdToRule"); // 3
    const uvr = ethers.getContractFactory("UserValidRule"); // 4
    const htlr = ethers.getContractFactory("HardTransferLimitRule"); // 5
    const stlr = ethers.getContractFactory("SoftTransferLimitRule"); // 6
    const matr = ethers.getContractFactory("MaxTransferRule"); // 7
    const mitr = ethers.getContractFactory("MinTransferRule"); // 8
    const uktbr = ethers.getContractFactory("UserKycThresholdBothRule"); // 9
    const atlr = ethers.getContractFactory("AddressThresholdLockRule"); // 10
    const uavr = ethers.getContractFactory("UserAttributeValidToRule"); // 11
    const vr = ethers.getContractFactory("VestingRule"); // 12
    const ysr = ethers.getContractFactory("YesNoRule"); // ?

    const cr = ethers.getContractFactory("ComplianceRegistry");
    const po = ethers.getContractFactory("PriceOracle");
    const p = ethers.getContractFactory("Processor");
    const re = ethers.getContractFactory("RuleEngine");

    const d = ethers.getContractFactory("Disperse");

    const shm = ethers.getContractFactory("ShareholderMeeting");

    const factories = await Promise.all([
        cr, 
        po, 
        p, 
        re,
        d,
        shm,
        gfr, 
        ufr, 
        uktfr, 
        ukttr, 
        uvr, 
        htlr,
        stlr, 
        matr, 
        mitr, 
        uktbr, 
        atlr, 
        uavr,
        vr, 
        ysr, 
        ]);

    let contracts = await Promise.all(
      factories.map((factory, index) => factory.deploy({ nonce: currentNonce + index }))
    );
  
    contracts = await Promise.all(contracts.map((contract) => contract.deployed()));
    
    const contractsAddress = contracts.map((contract) => contract.address);

    await network.provider.send("evm_setAutomine", [true]);
    await network.provider.send("evm_setIntervalMining", [0]);


    const init1 = (contracts[0] as ComplianceRegistry).initialize(signers[0].address);
    const init2 = (contracts[1] as PriceOracle).initialize(signers[0].address);
    const init3 = (contracts[2] as Processor)["initialize(address,address)"](signers[0].address, contractsAddress[2]);
    const init4 = (contracts[3] as RuleEngine).initialize(signers[0].address);
    
    await Promise.all([init1, init2, init3, init4]);
    
    const init5 = (contracts[3] as RuleEngine).setRules(contractsAddress.slice(6));
    const init6 = (contracts[2] as Processor).setRuleEngine(contractsAddress[3]);

    await Promise.all([init5, init6])

    console.log("OWNER: " + signers[0].address)
    console.log('COMPLIANCE REGISTRY: ' + contractsAddress[0]);
    console.log('PRICE ORACLE: ' + contractsAddress[1]);
    console.log('PROCESSOR: ' + contractsAddress[2]);
    console.log('RULE ENGINE: ' + contractsAddress[3]);
    console.log('DISPERSE: ' + contractsAddress[4]);
    console.log('ShareHolder Meeting: ' + contractsAddress[5]);

    // await network.provider.send("evm_setAutomine", [false]);
    // await network.provider.send("evm_setIntervalMining", [2000]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  