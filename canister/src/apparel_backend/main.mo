import Debug "mo:base/Debug";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Map "mo:base/HashMap";
import Error "mo:base/Error";
import Time "mo:base/Time";
import List "mo:base/List";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Int "mo:base/Int";
import Buffer "mo:base/Buffer";

actor ChainApparel {
    type MaterialDataBlock = {
        Material : Text;
        Quantity : Text;
        OrderDate : Text;
        RequiredOrderDate : Text;
    };
    type Result = {
        #ok : MaterialOrder;
        #err : Text;
    };

    public type MaterialOrder = {
        OrderId : Text;
        Status : Text;
        OrderDate : Int;
        MaterialData : [MaterialDataBlock];
        Accept : Bool;
        Reject : Bool;
        AcceptanceDate : Int;
        RejectanceDate : Int;
        Shipment : Bool;
        ShipmentDate : Int;
        Confirmation : Bool;
        ConfirmationDate : Int;
    };

    private stable var mapEntries : [(Text, MaterialOrder)] = [];
    var map = Map.HashMap<Text, MaterialOrder>(0, Text.equal, Text.hash);
    // create a order against orderId with a material required
    public func CreateOrder(orderId : Text, materail : MaterialDataBlock) : async (Text) {
        switch (map.get(orderId)) {
            case (?value) {
                if (value.Reject == false and value.Accept == false and value.Shipment == false and value.Confirmation == false) {

                    let buffer = Buffer.fromArray<MaterialDataBlock>(value.MaterialData);
                    buffer.add(materail);
                    let order = {
                        value with
                        OrderDate = Time.now();
                        MaterialData = Buffer.toArray<MaterialDataBlock>(buffer);
                    };
                    let data = map.put(value.OrderId, order);
                    return "aceepted";
                } else {
                    return Text.concat("request falied,current order status = ", value.Status);
                };
            };
            case (null) {
                let buffer = Buffer.Buffer<MaterialDataBlock>(0);
                buffer.add(materail);
                let ord : MaterialOrder = {
                    OrderId = orderId;
                    OrderDate = Time.now();
                    MaterialData = Buffer.toArray<MaterialDataBlock>(buffer);
                    Status = "Created";
                    Accept = false;
                    Reject = false;
                    AcceptanceDate = 0;
                    RejectanceDate = 0;
                    Shipment = false;
                    ShipmentDate = 0;
                    Confirmation = false;
                    ConfirmationDate = 0;
                };
                map.put(orderId, ord);
                return "created";
            };
        };
    };
    // query order with orderId
    public shared query func QueryOrder(id : Text) : async ?MaterialOrder {
        Debug.print(debug_show (map.get(id)));
        map.get(id);
    };
    // query all orders
    public query func QueryIAllOrders() : async [(Text, MaterialOrder)] {
        var tempArray : [(Text, MaterialOrder)] = [];
        tempArray := Iter.toArray(map.entries());

        return tempArray;
    };
    // accept created order against orderId
    public func AcceptOrder(id : Text) : async Text {
        switch (map.get(id)) {
            case (?ord) {
                if (ord.Reject == false and ord.Accept == false and ord.Shipment == false and ord.Confirmation == false) {
                    let order = {
                        ord with
                        Accept = true;
                        Status = "Accepted";
                        AcceptanceDate = Time.now();
                    };
                    let data = map.put(ord.OrderId, order);
                    return "aceepted";
                } else {
                    return Text.concat("request falied,current order status = ", ord.Status);
                };
            };
            case (null) { return "order not existed" };
        };
    };
    // reject created order against orderId
    public func RejectOrder(id : Text) : async Text {
        switch (map.get(id)) {
            case (?ord) {
                if (ord.Reject == false and ord.Accept == false and ord.Shipment == false and ord.Confirmation == false) {
                    let order = {
                        ord with
                        Status = "Rejected";
                        Reject = true;
                        RejectanceDate = Time.now();
                    };
                    let data = map.put(order.OrderId, order);
                    return "rejected";
                } else {
                    return Text.concat("request falied,current order status = ", ord.Status);
                };
            };
            case (null) { return "order not existed" };
        };
    };
    //update order status when order is shiped agaist orderId
    public func ShipmentOrder(id : Text) : async Text {
        switch (map.get(id)) {
            case (?ord) {
                if (ord.Accept == true and ord.Shipment == false and ord.Confirmation == false) {
                    let order = {
                        ord with
                        Status = "Shiped";
                        Shipment = true;
                        ShipmentDate = Time.now();
                    };
                    let data = map.put(order.OrderId, order);
                    return "shiped";
                } else {
                    return Text.concat("request falied,current order status = ", ord.Status);
                };
            };
            case (null) { return "order not existed" };
        };
    };
    // confirm order shipment when shipped order is received against orderId
    public func ConfirmationOrder(id : Text) : async Text {
        switch (map.get(id)) {
            case (?ord) {
                if (ord.Accept == true and ord.Shipment == true and ord.Confirmation == false) {
                    let order = {
                        ord with
                        Status = "Confirmed";
                        Confirmation = true;
                        ConfirmationDate = Time.now();
                    };
                    let data = map.put(order.OrderId, order);
                    return "confirmed";
                } else {
                    return Text.concat("request falied,current order status = ", ord.Status);
                };
            };
            case (null) { return "order not existed" };
        };
    };

    system func preupgrade() {
        mapEntries := Iter.toArray(map.entries());
    };

    system func postupgrade() {
        map := HashMap.fromIter<Text, MaterialOrder>(mapEntries.vals(), 1, Text.equal, Text.hash);

    };
};
