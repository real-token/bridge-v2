#!/bin/sh

yarn hardhat run scripts/deployArchitecture.ts --network home &
yarn hardhat run scripts/deployArchitecture.ts --network foreign &

wait

PROCESSOR=0x2fc631e4B3018258759C52AF169200213e84ABab TRUSTED=0xF3F671199bF5960a053B875518F7C86D421aab55 yarn hardhat run scripts/deployToken.ts --network home &
PROCESSOR=0x2fc631e4B3018258759C52AF169200213e84ABab TRUSTED=0xF3F671199bF5960a053B875518F7C86D421aab55 yarn hardhat run scripts/deployToken.ts --network foreign &

wait

echo "bridge-v2 done"