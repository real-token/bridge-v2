#!/bin/sh


yarn hardhat run scripts/deployArchitecture.ts --network home & pids=$!
yarn hardhat run scripts/deployArchitecture.ts --network foreign & pids+=" $!"

wait $pids

PROCESSOR=0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1 TRUSTED=0x6E3d65231E26fC22F19F8ED4b33Ccd4D2CA89ABd yarn hardhat run scripts/deployToken.ts --network home & pids=$!
PROCESSOR=0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1 TRUSTED=0x6E3d65231E26fC22F19F8ED4b33Ccd4D2CA89ABd yarn hardhat run scripts/deployToken.ts --network foreign & pids+=" $!"

trap "kill $pids" SIGTERM SIGINT
wait $pids