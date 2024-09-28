#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"go"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`
CC_SRC_PATH1="../chaincode/apparel/go/"




# Launch Network, Create Channel and Join Peer to Channel
pushd ./network

./network.sh up createChannel -ca -s couchdb

./network.sh deployCC -c apparel -ccn apparel -ccv 1 -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH1}



popd

cat <<EOF

// ************************************************************************************ //

         This is your captain speaking...

         Hyperledger Fabric Network & API are Up & Running!

         Total setup execution time: $(($(date +%s) - starttime)) seconds.. Sweet!

// ************************************************************************************ //

EOF

#pushd ./API

#node enrollAdmin

#node registerUser

#pm2 restart 3
#node app.js
#popd

#pushd ./explorer
#docker-compose down
#docker volume rm explorer_pgdata
#docker volume rm explorer_walletstore

#popd
