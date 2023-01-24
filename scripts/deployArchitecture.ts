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
    const re = ethers.getContractFactory("RuleEngine");
    const p = ethers.getContractFactory("Processor");

    const d = ethers.getContractFactory("Disperse");

    const shm = ethers.getContractFactory("ShareholderMeeting");

    const factories = await Promise.all([
        cr, 
        po, 
        re,
        p, 
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
    
    const noInit = "0x"
    const init1 = (contracts[0] as ComplianceRegistry).interface.encodeFunctionData('initialize', [signers[1].address])
    const init2 = (contracts[1] as PriceOracle).interface.encodeFunctionData('initialize', [signers[1].address])
    const init3 = (contracts[2] as RuleEngine).interface.encodeFunctionData('initialize', [signers[1].address])

    const mainInit = [init1, init2, init3]

    currentNonce = await admin.getTransactionCount();
    let proxies = await Promise.all(mainInit.map((init, index) => adminProxy.deploy(contracts[index].address, signers[0].address, init, { nonce: index + currentNonce })))
    proxies = await Promise.all(proxies.map((p) => p.deployed()));

    let contractsAddress = proxies.map((proxy) => proxy.address);

    const init4 = (contracts[3] as Processor).interface.encodeFunctionData('initialize(address,address)', [signers[1].address, contractsAddress[2]])
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

    const additionalsInit = [init4, noInit, noInit, init5, init6, init7, init8, init9, init10, init11, noInit, noInit, init12, noInit, init13, init14]
    
    currentNonce = await admin.getTransactionCount();

    let additionalsProxy = (await Promise.all(additionalsInit.map((init, index) => adminProxy.deploy(contracts[index + 3].address, signers[0].address, init, { nonce: index + currentNonce }))))
    additionalsProxy = await Promise.all(additionalsProxy.map((p) => p.deployed()));
    proxies = proxies.concat(additionalsProxy);
    contractsAddress = proxies.map((p) => p.address);
    await network.provider.send("evm_setAutomine", [true]);
    await network.provider.send("evm_setIntervalMining", [0]);
    
    const setRules = (contracts[2] as RuleEngine).interface.encodeFunctionData('setRules', [contractsAddress.slice(6)])
    const setRuleEngine = (contracts[3] as Processor).interface.encodeFunctionData('setRuleEngine', [contractsAddress[2]])
    const setPriceOracleOwner = (contracts[1] as PriceOracle).interface.encodeFunctionData('addOperator', [signers[2].address])

    const after1 = (proxies[2]).connect(signers[1]).fallback({ data: setRules })
    const after2 = (proxies[3]).connect(signers[1]).fallback({ data: setRuleEngine });
    const after3 = (proxies[1]).connect(signers[1]).fallback({ data: setPriceOracleOwner });

    await Promise.all([after1, after2, after3])
    
    const { singleton, proxy } = await deploySafe(ethers, [signers[1].address, signers[3].address], 1);
    console.log("DEPLOYER: " + signers[0].address)
    console.log("OWNER: " + signers[1].address)
    console.log('COMPLIANCE REGISTRY: ' + contractsAddress[0]);
    console.log('PRICE ORACLE: ' + contractsAddress[1]);
    console.log('RULE ENGINE: ' + contractsAddress[2]);
    console.log('PROCESSOR: ' + contractsAddress[3]);
    console.log('DISPERSE: ' + contractsAddress[4]);
    console.log('ShareHolder Meeting: ' + contractsAddress[5]);
    console.log('GNOSIS SAFE: ' + proxy.address);
    console.log('GNOSIS SINGLETON: ', singleton.address);

    await network.provider.send("evm_setAutomine", [false]);
    await network.provider.send("evm_setIntervalMining", [1000]);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  