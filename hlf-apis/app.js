//Importing Modules
const fs = require("fs");
const path = require("path");
const http = require("http");
var bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
var express = require("express");
var app = express();

//Use Methods
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
//Fabric Network
const { Gateway, Wallets } = require("fabric-network");

//LoadNetWork
loadNetwork = (channel, contractName) => {
    return new Promise(async (res, rej) => {
        const ccpPath = path.resolve(
          __dirname, '..', 'HLF', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), "wallet");
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get("appUser");
        if (!identity) {
            console.log(
                'An identity for the user "appUser" does not exist in the wallet'
            );
            console.log("Run the registerUser.js application before retrying");
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: "appUser",
            discovery: { enabled: true, asLocalhost: true },
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channel);

        // Get the contract from the network.
        const contract = network.getContract(contractName);

        res(contract);
    });
};


//------------------Invoice API Endpoints------------------

//Query All orders
app.get("/api/query-all-orders", async (req, res) => {
    try {
        loadNetwork("apparel", "apparel").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryAllOrders"
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query Single order
app.get("/api/query-order/:orderId?", async (req, res) => {
    if (
        req.params.orderId == null ||
        req.params.orderId.trim().length <= 0
    ) {
        return res.status(400).json({ error: "order ID is required!" });
    }
    try {
        loadNetwork("apparel", "apparel").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "QueryOrder",
                    req.params.orderId
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                return res.status(200).send(data);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//CreateOrder
app.post(
    "/api/create-order",
    [
        check("Accept", "Accept is required!").not().isEmpty(),
        check("ShipAddress", "ShipAddress is required!").not().isEmpty(),
        check("brandName", "brandName is required!").not().isEmpty(),
        check("id", "id is required!").not().isEmpty(),
        check("orderDate", "orderDate is required!").not().isEmpty(),
        check("phoneNumber", "phoneNumber is required!").not().isEmpty(),
        check("email", "email is required!").not().isEmpty(),
        check("manufacturer", "manufacturer is required!").not().isEmpty(),
        check("materialReqirement", "materialReqirement is required!").not().isEmpty(),
        check("orderId", "orderId is required!").not().isEmpty(),
        check("orderValue", "orderValue is required!").not().isEmpty(),
        check("product", "product is required!").not().isEmpty(),
        check("productQuantity", "productQuantity is required!").not().isEmpty(),
        check("productStyleNo", "productStyleNo is required!").not().isEmpty(),
        check("productUrl", "productUrl is required!").not().isEmpty(),
        check("prductCodes", "prductCodes is required!").not().isEmpty(),
        check("username", "username is required!").not().isEmpty(),
        check("StartProductionDate", "StartProductionDate is required!").not().isEmpty()
        
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            loadNetwork("apparel", "apparel").then(async (contract) => {
                try {
                    await contract.submitTransaction(
                        "CreateOrder",
                        req.body.orderId,
                        req.body.orderValue,
                        req.body.product,
                        req.body.productQuantity,
                        req.body.productStyleNo,
                        req.body.productUrl,
                        JSON.stringify(req.body.manufacturer),
                        req.body.id,
                        req.body.email,
                        req.body.brandName,
                        req.body.ShipAddress,
                        JSON.stringify(req.body.prductCodes),
                        req.body.orderDate,
                        req.body.phoneNumber,
                        req.body.username,
                        req.body.Accept,
                        JSON.stringify(req.body.materialReqirement),
                        req.body.StartProductionDate
                    );
                    console.log("Transaction has been submitted");
                    return res.status(200).send("Submited");
                } catch (error) {
                    console.error(`Failed to evaluate transaction: ${error}`);
                    return res.status(400).json({
                        error: `Failed to evaluate transaction: ${error.message}`,
                    });
                }
            });
        } catch (error) {
            return res.status(400).json({ error: error });
        }
    }
);

// order process
app.post("/api/order-process/:orderId?", 
[
    check("Cutting", "Cutting is required!").not().isEmpty(),
    check("Stiching", "Stiching is required!").not().isEmpty(),
    check("Quality", "Quality is required!").not().isEmpty(),
    check("Packing", "Packing is required!").not().isEmpty(),
    check("inProductionDate", "inProductionDate is required!").not().isEmpty(),
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("apparel", "apparel").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "ProcessOrder",
                  req.params.orderId,
                  req.body.Cutting,
                  req.body.Packing,
                  req.body.Quality,
                  req.body.Stiching,
                  req.body.inProductionDate,
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});

// order Cutting
app.post("/api/order-Cutting/:orderId?", 
[
    check("CuttingTrack", "CuttingTrack is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("apparel", "apparel").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "CuttingOrder",
                  req.params.orderId,
                  JSON.stringify(req.body.CuttingTrack), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Stiching
app.post("/api/order-stiching/:orderId?", 
[
    check("StichingTrack", "StichingTrack is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("apparel", "apparel").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "StichingOrder",
                  req.params.orderId,
                  JSON.stringify(req.body.StichingTrack), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Quality
app.post("/api/order-quality/:orderId?", 
[
    check("QualityTrack", "QualityTrack is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("apparel", "apparel").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "QualityOrder",
                  req.params.orderId,
                  JSON.stringify(req.body.QualityTrack), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Packing
app.post("/api/order-packing/:orderId?", 
[
    check("PackingTrack", "PackingTrack is required!").not().isEmpty(),
    
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
      loadNetwork("apparel", "apparel").then(async (contract) => {
        let date=new Date()
          try {
               await contract.submitTransaction(
                  "PackingOrder",
                  req.params.orderId,
                  JSON.stringify(req.body.PackingTrack),  
                  date.toString(), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});
// order Material data
app.post("/api/order-material/:orderId?", 
[
    check("OrderedMaterialData", "OrderedMaterialData is required!").not().isEmpty(),
   
],
async (req, res) => {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
  if (
      req.params.orderId == null ||
      req.params.orderId.trim().length <= 0
  ) {
      return res.status(400).json({ error: "order ID is required!" });
  }
  try {
  
      loadNetwork("apparel", "apparel").then(async (contract) => {
          try {
               await contract.submitTransaction(
                  "OrderMaterialData",
                  req.params.orderId,
                  JSON.stringify(req.body.OrderedMaterialData), 
              );

              console.log("Transaction has been submitted");
              return res.status(200).send("Submited");
          } catch (error) {
              console.error(`Failed to evaluate transaction: ${error}`);
              return res.status(400).json({
                  error: `Failed to evaluate transaction: ${error.message}`,
              });
          }
      });
  } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);
      return res.status(400).json({ error: error });
  }
});

//Query order History
app.get("/api/query-order-history/:orderId?", async (req, res) => {
    if (
        req.params.orderId == null ||
        req.params.orderId.trim().length <= 0
    ) {
        return res.status(400).json({ error: "order ID is required!" });
    }
    try {
        loadNetwork("apparel", "apparel").then(async (contract) => {
            try {
                const result = await contract.evaluateTransaction(
                    "GetHistoryOrder",
                    req.params.orderId
                );
                console.log(
                    `Transaction has been evaluated, result is: ${result}`
                );
                let data = JSON.parse(result.toString());
                let record=[]
                    for(let i=0;i<data.length;i++){
                        record.push(JSON.parse(data[i].Record))
                    }               
                return res.status(200).send(record);
            } catch (error) {
                console.error(`Failed to evaluate transaction: ${error}`);
                return res.status(400).json({
                    error: `Failed to evaluate transaction: ${error.message}`,
                });
            }
        });
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});
app.get("/", (req, res) => {
    return res.json({
      Alert: "You are NOT AUTHORIZED! Please leave imidiately.",
    });
  });
  


// ------------------Test Function - JUST IGNORE------------------

//Get Invoice
// app.post("/api/invoice-payment", async (req, res) => {
//     try {
//         loadNetwork("invoice", "payment").then(async (contract) => {
//             await contract.evaluateTransaction(
//                 "getInvoice",
//                 req.body.InvoiceID
//             );
//             console.log("Transaction has been updated");
//             // console.log(contract);
//             // var data = JSON.parse(contract.toString());
//             let temp = [];
//             // contract.forEach((e) => {
//             //     console.log("Element: ", e);
//             //     console.log(
//             //         "---------------------------------------------------------"
//             //     );
//             // });
//             console.log(contract.discoveryService);
//             res.send(contract.discoveryService);
//         });
//     } catch (error) {
//         return res.status(400).json({ error: error });
//     }
// });

//Starting Server...
const server = http.createServer(app);
const port = 9910;
server.listen(port);
console.debug("Blockchain server listening on port " + port);