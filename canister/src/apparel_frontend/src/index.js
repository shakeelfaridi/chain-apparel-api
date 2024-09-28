import { apparel_backend } from "../../declarations/apparel_backend";
const pollForm = document.getElementById("radioForm");
const resetButton = document.getElementById('reset');
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = e.target.querySelector("button");

  // const name = document.getElementById("name").value.toString();
  // resultHTML += '<li><strong>' + key + '</strong>: ' + pollResults[key] + '</li>';

  button.setAttribute("disabled", true);

  // Interact with foo actor, calling the greet method
  const AllOrders = await apparel_backend.QueryIAllOrders();

  button.removeAttribute("disabled");
  let resultHTML = '<ul>';
  for (let x in AllOrders) {
    let uniqueID = AllOrders[x][0];
    let order = AllOrders[x][1];
    let yes = "yes";
    let No = "No";

    resultHTML += '<div class="card"key=' + x + '>';
    resultHTML += '  <div class="card-title">Material Order</div>';
    resultHTML += ' <ul>';
    resultHTML += ' <li><strong>Order ID:</strong>' + order.OrderId + '</li>'
    resultHTML += '  <li><strong>Status:</strong>' + order.Status + '</li>';
    resultHTML += ' <li><strong>Order Date:</strong> ' + order.OrderDate + '</li>';
    resultHTML += '<li><strong>Material Data:</strong>';
    resultHTML += '  <ul>';
    order.MaterialData.map((materialDataBlock, index) => {
      resultHTML += ' <li key=' + index + '>';
      resultHTML += '  <ul>'
      resultHTML += '  <li><strong>Material:</strong>' + materialDataBlock.Material + '</li>';
      resultHTML += ' <li><strong>Quantity:</strong>' + materialDataBlock.Quantity + '</li>';
      resultHTML += ' <li><strong>OrderDate:</strong> ' + materialDataBlock.OrderDate + '</li>';
      resultHTML += ' <li><strong>ExpiryDate:</strong>' + materialDataBlock.RequiredOrderDate + '</li>';
      resultHTML += ' </ul>'
      resultHTML += ' </li>'
    }).join('');
    resultHTML += ' </ul>';
    resultHTML += ' </li>';
    resultHTML += ' <li><strong>Accept:</strong> ' + order.Accept ? yes : No + '</li>';
    resultHTML += ' <li><strong>Reject:</strong>' + order.Reject ? yes : No + '</li>';
    resultHTML += '<li><strong>Acceptance Date:</strong> ' + order.AcceptanceDate + '</li>';
    resultHTML += ' <li><strong>Rejection Date:</strong> ' + order.RejectanceDate + '</li>';
    resultHTML += '<li><strong>Shipment:</strong>' + order.Shipment ? yes : No + '</li>';
    resultHTML += ' <li><strong>Shipment Date:</strong> ' + order.ShipmentDate + '</li>';
    resultHTML += '<li><strong>Confirmation:</strong>' + order.Confirmation ? "Yes" : "No" + '</li>';
    resultHTML += '<li><strong>Confirmation Date:</strong> ' + order.ConfirmationDate + '</li>';
    resultHTML += '</ul>';

  }
  resultHTML += '</ul>';

  // resultHTML += '</ul>';
  document.getElementById("allorder").innerHTML = resultHTML;

  return false;
});



// document.querySelector("form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const button = e.target.querySelector("button");

//   const Id = document.getElementById("Id").value.toText();

//   button.setAttribute("disabled", true);

//   // Interact with foo actor, calling the greet method
//   const AllOrders = await apparel_backend.QueryOrder();

//   button.removeAttribute("disabled");
//   let resultHTML = '<ul>';
//   let order = AllOrders[0];
//   let yes = "yes";
//   let No = "No";

//   resultHTML += '  <div class="card-title">Material Order</div>';
//   resultHTML += ' <ul>';
//   resultHTML += ' <li><strong>Order ID:</strong>' + order.OrderId + '</li>'
//   resultHTML += '  <li><strong>Status:</strong>' + order.Status + '</li>';
//   resultHTML += ' <li><strong>Order Date:</strong> ' + order.OrderDate + '</li>';
//   resultHTML += '<li><strong>Material Data:</strong>';
//   resultHTML += '  <ul>';
//   order.MaterialData.map((materialDataBlock, index) => {
//     resultHTML += ' <li key=' + index + '>';
//     resultHTML += '  <ul>'
//     resultHTML += '  <li><strong>Material:</strong>' + materialDataBlock.Material + '</li>';
//     resultHTML += ' <li><strong>Quantity:</strong>' + materialDataBlock.Quantity + '</li>';
//     resultHTML += ' <li><strong>OrderDate:</strong> ' + materialDataBlock.OrderDate + '</li>';
//     resultHTML += ' <li><strong>ExpiryDate:</strong>' + materialDataBlock.RequiredOrderDate + '</li>';
//     resultHTML += ' </ul>'
//     resultHTML += ' </li>'
//   }).join('');
//   resultHTML += ' </ul>';
//   resultHTML += ' </li>';
//   resultHTML += ' <li><strong>Accept:</strong> ' + order.Accept ? yes : No + '</li>';
//   resultHTML += ' <li><strong>Reject:</strong>' + order.Reject ? yes : No + '</li>';
//   resultHTML += '<li><strong>Acceptance Date:</strong> ' + order.AcceptanceDate + '</li>';
//   resultHTML += ' <li><strong>Rejection Date:</strong> ' + order.RejectanceDate + '</li>';
//   resultHTML += '<li><strong>Shipment:</strong>' + order.Shipment ? yes : No + '</li>';
//   resultHTML += ' <li><strong>Shipment Date:</strong> ' + order.ShipmentDate + '</li>';
//   resultHTML += '<li><strong>Confirmation:</strong>' + order.Confirmation ? yes :No + '</li>';
//   resultHTML += '<li><strong>Confirmation Date:</strong> ' + order.ConfirmationDate + '</li>';
//   resultHTML += '</ul>';


//   resultHTML += '</ul>';

//   document.getElementById("queryorder").innerHTML = resultHTML;

//   return false;
// });



