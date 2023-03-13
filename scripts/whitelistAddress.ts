import { isAddress } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { GnosisSafe__factory } from "../typechain";
import { AddressZero } from "../utils"

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
  const compliance = process.env.COMPLIANCE
  const trusted = process.env.TRUSTED
  if (!compliance || !isAddress(compliance)) throw new Error("Run command with COMPLIANCE=0x env variable");
  if (!trusted || !isAddress(trusted)) throw new Error("Run command with TRUSTED=0x env variable");


    const signers = await ethers.getSigners();

    const safeOwner = signers[1]

    const complianceRegistry = await ethers.getContractAt("ComplianceRegistry", compliance, safeOwner)
    const safeProxy = await ethers.getContractAt("GnosisSafeProxy", trusted, safeOwner)

    const register = (complianceRegistry.interface).encodeFunctionData('registerUsers', [[safeOwner.address], ["130"], ["1"]])
    const exectx = (GnosisSafe__factory.createInterface()).encodeFunctionData('execTransaction', [complianceRegistry.address, '0', register, '0', 0, 0, 0, AddressZero, AddressZero, getPreValidatedSignatures(safeOwner.address)])

    await safeProxy.fallback({ data: exectx })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  