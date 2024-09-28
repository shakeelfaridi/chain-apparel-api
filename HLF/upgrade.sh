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
UPGRADE_VERSION=2



# Launch Network, Create Channel and Join Peer to Channel
pushd ./network



./network.sh deployCC -c apparel -ccn apparel -ccv ${UPGRADE_VERSION} -ccs ${UPGRADE_VERSION} -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH1}

popd

cat <<EOF

// ************************************************************************************ //

         This is your captain speaking.. .

         Hyperledger Fabric Network & API are Up & Running!

         Total setup execution time: $(($(date +%s) - starttime)) seconds.. Sweet!

// ************************************************************************************ //

EOF


