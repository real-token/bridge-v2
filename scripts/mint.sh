#!/bin/sh

DEST=$1
TOKEN=$2

DEST=$DEST TOKEN=$TOKEN yarn hardhat run scripts/mint.ts --network home & pids=$!
DEST=$DEST TOKEN=$TOKEN yarn hardhat run scripts/mint.ts --network foreign & pids+=" $!"


trap "kill $pids" SIGTERM SIGINT
wait $pids
echo "bridge-v2 StartBridge DONE"