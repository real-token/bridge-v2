import { FormatTypes } from "ethers/lib/utils";
import { AddressZero } from "@ethersproject/constants";
import { GnosisSafeProxy } from "../typechain/@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol";
import { GnosisSafeProxyFactory } from "../typechain/@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory";
import { GnosisSafe } from "../typechain/@gnosis.pm/safe-contracts/contracts/GnosisSafe";
import { BigZero } from "./constants";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

export const deploySafe = async (ethers: HardhatEthersHelpers, owners: string[], threshold: number = 1) => {
  const gnosisSafeProxyFactory_ = await ethers.getContractFactory(
    "GnosisSafeProxyFactory"
  );

  const gnosisSafe_ = await ethers.getContractFactory("GnosisSafe");

  const gnosisSafeProxyFactory =
    (await gnosisSafeProxyFactory_.deploy()) as GnosisSafeProxyFactory;

  const gnosisSafe = (await gnosisSafe_.deploy()) as GnosisSafe;

  await gnosisSafe.deployed();

  const safeContract = await ethers.getContractAt(
    gnosisSafe.interface.format(FormatTypes.full),
    gnosisSafe.address
  );

  const params = [
    owners,
    threshold,
    AddressZero,
    "0x",
    AddressZero,
    AddressZero,
    0,
    AddressZero,
  ];

  // proxy deployment
  const safeAbi = safeContract.interface.encodeFunctionData("setup", params);

  const ProxyFactoryContract = await ethers.getContractAt(
    gnosisSafeProxyFactory.interface.format(FormatTypes.full),
    gnosisSafeProxyFactory.address
  );

  const saltNonce = BigZero;
  const txResponse = await ProxyFactoryContract.createProxyWithNonce(
    safeContract.address,
    safeAbi,
    saltNonce
  );

  const txReceipt = await txResponse.wait();
  // address of the newly deployed Safe
  const { proxy: proxyAddress, singleton: singletonAddress } =
    txReceipt.events[1].args;

  const singleton = gnosisSafe_.attach(singletonAddress) as GnosisSafe;
  const proxy = gnosisSafe_.attach(proxyAddress) as GnosisSafeProxy;

  return { singleton, proxy };
};