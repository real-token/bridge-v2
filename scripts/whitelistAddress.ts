import { ethers, network } from "hardhat";
import { ComplianceRegistry, GlobalFreezeRule, GnosisSafe, GnosisSafeProxyFactory__factory, GnosisSafe__factory, HardTransferLimitRule, PriceOracle, Processor, RuleEngine, SoftTransferLimitRule, UserAttributeValidToRule, UserFreezeRule, UserKycThresholdBothRule, UserKycThresholdFromRule, UserKycThresholdToRule, UserValidRule, VestingRule } from "../typechain";
import { AddressZero, deploySafe } from "../utils"

const EMPTY_DATA = '0x'

const getPreValidatedSignatures = (
    from: string
  ) => {
    return `${EMPTY_DATA}000000000000000000000000${from.replace(
      EMPTY_DATA,
      ''
    )}000000000000000000000000000000000000000000000000000000000000000001`
  }

  
async function main() {
    const signers = await ethers.getSigners();

    const safeOwner = signers[1]
    const safe = "0xDDf926977cBCe983D2aeBA73a7E257fBa4aAA05e";
    const crAddress = "0x3Aa5ebB10DC797CAC828524e59A333d0A371443c";

    const complianceRegistry = await ethers.getContractAt("ComplianceRegistry", crAddress, safeOwner)
    const safeProxy = await ethers.getContractAt("GnosisSafeProxy", safe, safeOwner)

    const register = (complianceRegistry.interface).encodeFunctionData('registerUsers', [[], [], []])
    const exectx = (GnosisSafe__factory.createInterface()).encodeFunctionData('execTransaction', [complianceRegistry.address, '0', register, '0', 0, 0, 0, AddressZero, AddressZero, getPreValidatedSignatures(safeOwner.address)])

    await safeProxy.fallback({ data: exectx })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  