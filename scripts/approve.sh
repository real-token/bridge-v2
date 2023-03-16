#!/bin/sh

SPENDER=$1
TOKEN=$2

SPENDER=$SPENDER TOKEN=$TOKEN yarn hardhat run scripts/approve.ts --network home & pids=$!
SPENDER=$SPENDER TOKEN=$TOKEN yarn hardhat run scripts/approve.ts --network foreign & pids+=" $!"


trap "kill $pids" SIGTERM SIGINT
wait $pids
echo "bridge-v2 StartBridge DONE"