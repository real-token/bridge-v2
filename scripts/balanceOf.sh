#!/bin/sh

HOLDER=$1
TOKEN=$2

HOLDER=$HOLDER TOKEN=$TOKEN yarn hardhat run scripts/balanceOf.ts --network home & pids=$!
HOLDER=$HOLDER TOKEN=$TOKEN yarn hardhat run scripts/balanceOf.ts --network foreign & pids+=" $!"


trap "kill $pids" SIGTERM SIGINT
wait $pids
echo "bridge-v2 StartBridge DONE"