/*
SPDX-License-Identifier: Apache-2.0
*/

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a workflow
type SmartContract struct {
	contractapi.Contract
}

// QueryResult structure used for handling result of query
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Order
}

// QueryHistory structure used for handling result of query
type QueryHistory struct {
	Record string
}

// Customer Information Structure
type InfoBlock struct {
	OrderDate   string `json:"orderDate"`
	Phonenumber uint64 `json:"phonenumber"`
}
type ManufacturerBlock struct {
	Key   string `json:"Key"`
	Value string `json:"Value"`
}

// Material Requirement Structure
type RequirementBlock struct {
	Key      string `json:"Key"`
	Value    string `json:"Value"`
	VendorId string `json:"VendorId"`
}

// Ordered Material Structure
type MaterialDataBlock struct {
	Material          string `json:"Material"`
	Quantity          string `json:"Quantity"`
	OrderDate         string `json:"OrderDate"`
	RequiredOrderDate string `json:"RequiredOrderDate"`
}

// Processing Structure
type ProcessingBlock struct {
	Cutting       string       `json:"Cutting"`
	Packing       string       `json:"Packing"`
	Quality       string       `json:"Quality"`
	Stiching      string       `json:"Stiching"`
	CuttingTrack  []TrackBlock `json:"cuttingTrack"`
	Delivered     bool         `json:"delivered"`
	DeliveredDate string       `json:"deliveredDate"`
	PackingTrack  []TrackBlock `json:"packingTrack"`
	QualityTrack  []TrackBlock `json:"qualityTrack"`
	StichingTrack []TrackBlock `json:"stichingTrack"`
}

type TrackBlock struct {
	GarmentId   string `json:"GarmentId"`
	WorkerId    string `json:"WorkerId"`
	DateTime    string `json:"DateTime"`
	ProcessName string `json:"ProcessName"`
}

// Order Structure
type Order struct {
	Accept              bool                `json:"Accept"`
	Cutting             string              `json:"Cutting"`
	Packing             string              `json:"Packing"`
	Quality             string              `json:"Quality"`
	ShipAddress         string              `json:"ShipAddress"`
	Stiching            string              `json:"Stiching"`
	BrandName           string              `json:"brandName"`
	Email               string              `json:"email"`
	Id                  string              `json:"id"`
	InProductionDate    string              `json:"inProductionDate"`
	Manufacturer        []ManufacturerBlock `json:"manufacturer"`
	OrderId             string              `json:"orderId"`
	OrderValue          uint                `json:"orderValue"`
	Product             string              `json:"product"`
	ProductQuantity     uint                `json:"productQuantity"`
	ProductStyleNo      string              `json:"productStyleNo"`
	ProductUrl          string              `json:"productUrl"`
	StartProductionDate string              `json:"startProductionDate"`
	UserName            string              `json:"userName"`
	CutomerInfo         InfoBlock           `json:"cutomerInfo"`
	MaterialRequirement []RequirementBlock  `json:"materialRequirement"`
	OrderedMaterialData []MaterialDataBlock `json:"orderedMaterialData"`
	Processing          ProcessingBlock     `json:"processing"`
	Productcodes        []string            `json:"productcodes"`
}

// InitLedger adds a base set of Orders to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {

	Orders := []Order{}

	for i, order := range Orders {
		orderAsBytes, _ := json.Marshal(order)
		fmt.Println(i)
		err := ctx.GetStub().PutState(order.OrderId, orderAsBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}

// CreateOrder adds a new order to the world state with given details
func (s *SmartContract) CreateOrder(ctx contractapi.TransactionContextInterface, orderId string,
	orderValue uint,
	product string,
	productQuantity uint,
	productStyleNo string,
	productUrl string,
	manufacturer []ManufacturerBlock,
	id string,
	email string,
	brandName string,
	ShipAddress string,
	productcodes []string,
	orderDate string,
	phonenumber uint64,
	userName string,
	Accept bool,
	Materialrequirement []RequirementBlock,
	ProductionDate string,
) error {

	order := Order{
		Accept:              Accept,
		Cutting:             "",
		Packing:             "",
		Quality:             "",
		Stiching:            "",
		ShipAddress:         ShipAddress,
		BrandName:           brandName,
		Email:               email,
		Id:                  id,
		Manufacturer:        manufacturer,
		OrderId:             orderId,
		OrderValue:          orderValue,
		Product:             product,
		ProductQuantity:     productQuantity,
		ProductStyleNo:      productStyleNo,
		ProductUrl:          productUrl,
		Productcodes:        productcodes,
		CutomerInfo:         InfoBlock{orderDate, phonenumber},
		StartProductionDate: ProductionDate,
		UserName:            userName,
		MaterialRequirement: Materialrequirement,
		OrderedMaterialData: []MaterialDataBlock{},
		Processing: ProcessingBlock{
			Cutting:       "",
			Stiching:      "",
			Quality:       "",
			Packing:       "",
			CuttingTrack:  []TrackBlock{},
			StichingTrack: []TrackBlock{},
			QualityTrack:  []TrackBlock{},
			PackingTrack:  []TrackBlock{},
		},
		InProductionDate: "",
	}

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(orderId, orderAsBytes)
}

// ProcessOrder Update order to the world state with given details
func (s *SmartContract) ProcessOrder(ctx contractapi.TransactionContextInterface,
	OrderID string, Cutting string, Packing string,
	Quality string, Stiching string, inProductionDate string) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}
	order.Cutting = Cutting
	order.Stiching = Stiching
	order.Quality = Quality
	order.Packing = Packing
	order.InProductionDate = inProductionDate
	order.Processing.Cutting = "Pending"

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// CuttingOrder Update order to the world state with given details
func (s *SmartContract) CuttingOrder(ctx contractapi.TransactionContextInterface,
	OrderID string, CuttingTrack []TrackBlock) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}

	order.Processing.Cutting = "Completed"
	order.Processing.CuttingTrack = CuttingTrack
	order.Processing.Stiching = "Pending"

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// StichingOrder Update order to the world state with given details
func (s *SmartContract) StichingOrder(ctx contractapi.TransactionContextInterface,
	OrderID string, StichingTrack []TrackBlock) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}

	order.Processing.Stiching = "Completed"
	order.Processing.StichingTrack = StichingTrack
	order.Processing.Quality = "Pending"

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// QualityOrder Update order to the world state with given details
func (s *SmartContract) QualityOrder(ctx contractapi.TransactionContextInterface,
	OrderID string, QualityTrack []TrackBlock) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}

	order.Processing.Quality = "Completed"
	order.Processing.QualityTrack = QualityTrack
	order.Processing.Packing = "Pending"

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// PackingOrder Update order to the world state with given details
func (s *SmartContract) PackingOrder(ctx contractapi.TransactionContextInterface,
	OrderID string, PackingTrack []TrackBlock, deliveredDate string) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}

	order.Processing.Packing = "Completed"
	order.Processing.PackingTrack = PackingTrack
	order.Processing.Delivered = true
	order.Processing.DeliveredDate = deliveredDate

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// send order to vendor for required material data
// OrderMaterialData Update order to the world state with given details
func (s *SmartContract) OrderMaterialData(ctx contractapi.TransactionContextInterface,
	OrderID string, MaterialData MaterialDataBlock) error {

	order, err := s.QueryOrder(ctx, OrderID)

	if err != nil {
		return err
	}

	order.OrderedMaterialData = append(order.OrderedMaterialData, MaterialData)

	orderAsBytes, _ := json.Marshal(order)

	return ctx.GetStub().PutState(OrderID, orderAsBytes)
}

// QueryAllOrders returns all Orders found in world state
func (s *SmartContract) QueryAllOrders(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {

	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []QueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		order := new(Order)
		_ = json.Unmarshal(queryResponse.Value, order)

		queryResult := QueryResult{Key: queryResponse.Key, Record: order}
		fmt.Println("queryResult", string(queryResponse.Value))
		results = append(results, queryResult)
	}

	return results, nil
}

// GetHistoryOrders returns the order stored in the world state with given id
func (s *SmartContract) GetHistoryOrders(ctx contractapi.TransactionContextInterface, OrderId string) ([]QueryHistory, error) {

	history, err := ctx.GetStub().GetHistoryForKey(OrderId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read History from world state. %s", err.Error())
	}

	if history == nil {
		return nil, fmt.Errorf("%s does not exist", OrderId)
	}

	results := []QueryHistory{}

	for history.HasNext() {
		modification, err := history.Next()
		if err != nil {
			fmt.Println(err.Error())
			return nil, fmt.Errorf("Failed to read History from world state. %s", err.Error())
		}
		queryResult := QueryHistory{Record: string(modification.Value)}
		results = append(results, queryResult)
		fmt.Println("Returning information about", string(modification.Value))
	}

	return results, nil
}

// QueryOrder returns the order stored in the world state with given id
func (s *SmartContract) QueryOrder(ctx contractapi.TransactionContextInterface, orderId string) (*Order, error) {

	orderAsBytes, err := ctx.GetStub().GetState(orderId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if orderAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", orderId)
	}

	order := new(Order)
	_ = json.Unmarshal(orderAsBytes, order)

	return order, nil
}

// GetHistoryOrder returns the order stored in the world state with given id
func (s *SmartContract) GetHistoryOrder(ctx contractapi.TransactionContextInterface, orderId string) ([]QueryHistory, error) {

	history, err := ctx.GetStub().GetHistoryForKey(orderId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read History from world state. %s", err.Error())
	}

	if history == nil {
		return nil, fmt.Errorf("%s does not exist", orderId)
	}

	results := []QueryHistory{}

	for history.HasNext() {
		modification, err := history.Next()
		if err != nil {
			fmt.Println(err.Error())
			return nil, fmt.Errorf("Failed to read History from world state. %s", err.Error())
		}
		queryResult := QueryHistory{Record: string(modification.Value)}
		results = append(results, queryResult)
		fmt.Println("Returning information about", string(modification.Value))
	}

	return results, nil
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error creating chain-apparek chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting chain-apparek chaincode: %s", err.Error())
	}
}
