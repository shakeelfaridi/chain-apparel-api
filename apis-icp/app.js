//Importing Modules
const { createServer } = require("http");
const { ic } = require("ic0");
const { json, urlencoded } = require('body-parser');
const { check, validationResult } = require("express-validator");
const express = require("express");
// const fetch=require("node-fetch")
// global.fetch=fetch;
// const listener = require("../helpers/listener");
// const process = require('node:process');
// const { hash, aes, unAes } = require("./middleware/crypto");

// const ic = replica(new HttpAgent({host:"http://127.0.0.1:4943/"})); // Use a custom agent from `@dfinity/agent`



// const ledger = ic.local('iwwi6-mqaaa-aaaal-ac2ea-cai'); // Ledger canister
const ledger = ic.local("bkyz2-fmaaa-aaaaa-qaaaq-cai");
var app = express();
//Use Methods
app.use(json({ limit: "50mb" }));
app.use(
    urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000,
    })
);
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.get("/", (req, res) => {
    return res.json({
        Alert: "You are NOT AUTHORIZED! Please leave imidiately.",
    });
});

//Query All Invoices
app.get("/get-all-orders", async (req, res) => {
    try {
        let load = async () => {
            
            let data = await ledger.call("QueryIAllOrders");
            console.log(data);
            return data;
        }
        const order = await load();
        let record = [];
        order.forEach((value) => {
            let order = {};
            order.OrderId = value[1].OrderId;
            order.Status = value[1].Status;
            order.Accept = value[1].Accept;
            order.Reject = value[1].Reject;
            order.Shipment = value[1].Shipment;
            order.Confirmation = value[1].Confirmation;
            order.OrderDate = Number(value[1].OrderDate);
            order.ConfirmationDate = Number(value[1].ConfirmationDate);
            order.RejectanceDate = Number(value[1].RejectanceDate);
            order.ShipmentDate = Number(value[1].ShipmentDate);
            order.AcceptanceDate = Number(value[1].AcceptanceDate);
            let Material = [];
            value[1].MaterialData.forEach((x) => {
                let Item = {};
                Item.Material = x.Material;
                Item.Quantity = x.Quantity;
                Item.OrderDate = x.OrderDate;
                Item.OrderExpiryDate = x.RequiredOrderDate;
                Material.push(Item);

            });
            order.OrderMaterial = Material;
            record.push(order);

        })

        return res.status(200).json(record);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});

//Query Single order
app.get("/query-order/:orderId?", async (req, res) => {
    if (
        req.params.orderId == null ||
        req.params.orderId.trim().length <= 0
    ) {
        return res.status(400).json({ error: "order ID is required!" });
    }
    try {
        let load = async () => {
            let data = await ledger.call("QueryOrder",req.params.orderId);
            console.log(data);
            return data;
        }
        const order = await load();
        let record = [];
        order.forEach((value) => {
            let order = {};
            order.OrderId = value.OrderId;
            order.Status = value.Status;
            order.Accept = value.Accept;
            order.Reject = value.Reject;
            order.Shipment = value.Shipment;
            order.Confirmation = value.Confirmation;
            order.OrderDate = Number(value.OrderDate);
            order.ConfirmationDate = Number(value.ConfirmationDate);
            order.RejectanceDate = Number(value.RejectanceDate);
            order.ShipmentDate = Number(value.ShipmentDate);
            order.AcceptanceDate = Number(value.AcceptanceDate);
            let Material = [];
            value.MaterialData.forEach((x) => {
                let Item = {};
                Item.Material = x.Material;
                Item.Quantity = x.Quantity;
                Item.OrderDate = x.OrderDate;
                Item.OrderExpiryDate = x.RequiredOrderDate;
                Material.push(Item);

            });
            order.OrderMaterial = Material;
            record.push(order);
        })
        return res.status(200).json(record);
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        return res.status(400).json({ error: error });
    }
});
//CreateOrder
app.post(
    "/create-order",
    [
        check("orderId", "orderId is required!").not().isEmpty(),
        check("material", "material is required!").not().isEmpty()
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let load = async () => {
                let record=req.body.material;
                // let records=[];
                // record.forEach((value)=>{
                    let data1={
                            OrderDate: record.OrderDate,
                            RequiredOrderDate:record.RequiredOrderDate,
                            Quantity: record.Quantity,
                            Material: record.Material,

                        }
                        // records.push(data);
                // })
                let data = await ledger.call('CreateOrder',req.body.orderId,data1);
                console.log(data);
                return data;
            }
            const order = await load();
            return res.status(200).json(order);
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return res.status(400).json({ error: error });
        }
    }
);
//AcceptOrder
app.post(
    "/accept-order",
    [
        check("orderId", "orderId is required!").not().isEmpty(),
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let load = async () => {
                let data = await ledger.call('AcceptOrder',req.body.orderId);
                console.log(data);
                return data;
            }
            const order = await load();
            return res.status(200).json(order);
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return res.status(400).json({ error: error });
        }
    }
);
//RejectOrder
app.post(
    "/reject-order",
    [
        check("orderId", "orderId is required!").not().isEmpty(),
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let load = async () => {
                let data = await ledger.call('RejectOrder',req.body.orderId);
                console.log(data);
                return data;
            }
            const order = await load();
            return res.status(200).json(order);
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return res.status(400).json({ error: error });
        }
    }
);
//shipmentOrder
app.post(
    "/ship-order",
    [
        check("orderId", "orderId is required!").not().isEmpty(),
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let load = async () => {
                let data = await ledger.call("ShipmentOrder",req.body.orderId);
                console.log(data);
                return data;
            }
            const order = await load();
            return res.status(200).json(order);
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return res.status(400).json({ error: error });
        }
    }
);
//ConfirmationOrder
app.post(
    "/confirmation",
    [
        check("orderId", "orderId is required!").not().isEmpty(),
    ],
    async (req, res) => {
        console.log("Create Endpoint!");
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            let load = async () => {
                let data = await ledger.call("ConfirmationOrder",req.body.orderId);
                console.log(data);
                return data;
            }
            const order = await load();
            return res.status(200).json(order);
        } catch (error) {
            console.error(`Failed to evaluate transaction: ${error}`);
            return res.status(400).json({ error: error });
        }
    }
);
//Starting Server...
const server = createServer(app);
const port = 8000;
server.listen(port);
console.debug("Blockchain server listening on port " + port);