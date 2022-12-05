import { ethers, network } from "hardhat";
import { ComplianceRegistry, GlobalFreezeRule, HardTransferLimitRule, PriceOracle, Processor, RuleEngine, SoftTransferLimitRule, UserAttributeValidToRule, UserFreezeRule, UserKycThresholdBothRule, UserKycThresholdFromRule, UserKycThresholdToRule, UserValidRule, VestingRule } from "../typechain";
import { deploySafe } from "../utils"

async function main() {
    const signers = await ethers.getSigners();

    const admin = signers[0]
    let currentNonce = await admin.getTransactionCount();

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

    const aup = ethers.getContractFactory("AdminUpgradeabilityProxy");

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
        ]);

    const adminProxy = await aup

    let contracts = await Promise.all(
      factories.map((factory, index) => factory.deploy({ nonce: currentNonce + index }))
    );
  
    contracts = await Promise.all(contracts.map((contract) => contract.deployed()));
    
    const contractsAddress = contracts.map((contract) => contract.address);

    const noInit = "0x"
    const init1 = (contracts[0] as ComplianceRegistry).interface.encodeFunctionData('initialize', [signers[1].address])
    const init2 = (contracts[1] as PriceOracle).interface.encodeFunctionData('initialize', [signers[1].address])
    const init3 = (contracts[2] as Processor).interface.encodeFunctionData('initialize(address,address)', [signers[1].address, contractsAddress[3]])
    const init4 = (contracts[3] as RuleEngine).interface.encodeFunctionData('initialize', [signers[1].address])
    // Disperse
    // ShareHolderMeeting
    const init5 = (contracts[6] as GlobalFreezeRule).interface.encodeFunctionData('initialize', [signers[1].address])
    const init6 = (contracts[7] as UserFreezeRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    const init7 = (contracts[8] as UserKycThresholdFromRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    const init8 = (contracts[9] as UserKycThresholdToRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    const init9 = (contracts[10] as UserValidRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    const init10 = (contracts[11] as HardTransferLimitRule).interface.encodeFunctionData('initialize(address,address)', [signers[1].address, contractsAddress[0]])
    const init11 = (contracts[12] as SoftTransferLimitRule).interface.encodeFunctionData('initialize(address,address)', [signers[1].address, contractsAddress[0]])
    // MaxTransferRule
    // MinTransferRule
    const init12 = (contracts[15] as UserKycThresholdBothRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    // AddressThresholdLockRule
    const init13 = (contracts[17] as UserAttributeValidToRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])
    const init14 = (contracts[18] as VestingRule).interface.encodeFunctionData('initialize', [contractsAddress[0]])

    const data = [init1, init2, init3, init4, noInit, noInit, init5, init6, init7, init8, init9, init10, init11, noInit, noInit, init12, noInit, init13, init14]
    
    currentNonce = await admin.getTransactionCount();

    let proxies = await Promise.all(contracts.map((contract, index) => adminProxy.deploy(contract.address, signers[0].address, data[index], { nonce: index + currentNonce })))
    proxies = await Promise.all(proxies.map((p) => p.deployed()));
    const proxiesAddress = proxies.map((p) => p.address);
    await network.provider.send("evm_setAutomine", [true]);
    await network.provider.send("evm_setIntervalMining", [0]);
    
    const setRules = (contracts[3] as RuleEngine).interface.encodeFunctionData('setRules', [proxiesAddress.slice(6)])
    const setRuleEngine = (contracts[2] as Processor).interface.encodeFunctionData('setRuleEngine', [proxiesAddress[3]])


    const after1 = (proxies[3]).connect(signers[1]).fallback({ data: setRules })
    const after2 = (proxies[2]).connect(signers[1]).fallback({ data: setRuleEngine });

    await Promise.all([after1, after2])
    
    const { singleton, proxy } = await deploySafe(ethers, [signers[1].address], 1);
    console.log("DEPLOYER: " + signers[0].address)
    console.log("OWNER: " + signers[1].address)
    console.log('COMPLIANCE REGISTRY: ' + proxiesAddress[0]);
    console.log('PRICE ORACLE: ' + proxiesAddress[1]);
    console.log('PROCESSOR: ' + proxiesAddress[2]);
    console.log('RULE ENGINE: ' + proxiesAddress[3]);
    console.log('DISPERSE: ' + proxiesAddress[4]);
    console.log('ShareHolder Meeting: ' + proxiesAddress[5]);
    console.log('GNOSIS SAFE: ' + proxy.address);
    console.log('GNOSIS SINGLETON: ', singleton.address);

    // await network.provider.send("evm_setAutomine", [false]);
    // await network.provider.send("evm_setIntervalMining", [100]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  