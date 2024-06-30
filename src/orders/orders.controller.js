const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  const { userId } = req.params;
  res.json({ data: orders.filter(userId ? order => order.user_id == userId : () => true) });
}

let lastorderId = orders.reduce((maxId, order) => Math.max(maxId, order.id), 0)

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
        status: 400,
        message: `Must include a ${propertyName}`
    });
  };
}

function dishesPropertyIsValid(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  
  //console.log(dishes);
  
  if (!(dishes && dishes.length > 0 && Array.isArray(dishes))) {
    //console.log("FAIL 2");
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  
  dishes.forEach((dish) => {
    if(!dish.quantity){
      //console.log("FAIL 1: " + dish.id);
      return next({
        status: 400,
        message: `dish ${dish.id} must have a quantity that is an integer greater than 0`,
      });
    }
    if(!Number.isInteger(dish.quantity)){
      //console.log("FAIL 3: " + dish.id);
      return next({
        status: 400,
        message: `dish ${dish.id} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  
  //console.log("PASS");
  return next();
}

function create(req, res) {
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: ++lastorderId, // Increment last id then assign as the current ID
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    status: status,
    dishes: dishes
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundorder = orders.find(order => order.id === orderId);
  if (foundorder) {
    res.locals.order = foundorder;
    return next();
  }
  next({
    status: 404,
    message: `order id not found: ${orderId}`,
  });
};

function read(req, res, next) {
  res.json({ data: res.locals.order });
};

function idPropertyIsValid(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id ? orderId === id : true) {
    return next();
  }
  next({
    status: 400,
    message: "id:" + id,
  });
}

function statusPropertyIsValid(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: "status:" + status,
  });
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  // update the order
  order.deliverTo = deliverTo,
  order.mobileNumber = mobileNumber,
  order.status = status,
  order.dishes = dishes

  res.json({ data: order });
}

function statusNotPending (req, res, next){
  const order = res.locals.order;
  console.log(order);
  if(order.status == "pending"){
    return next();
  }
  next({
    status: 400,
    message: "Status must be pending: " + order.status,
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === Number(orderId));
  // `splice()` returns an array of the deleted elements, even if it is one element
  const deletedorders = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [
      bodyDataHas("deliverTo"),
      bodyDataHas("mobileNumber"),
      bodyDataHas("dishes"),
      dishesPropertyIsValid,
      create
  ],
  list,
  read: [orderExists, read],
  update: [
      orderExists,
      bodyDataHas("deliverTo"),
      bodyDataHas("mobileNumber"),
      bodyDataHas("dishes"),
      bodyDataHas("status"),
      statusPropertyIsValid,
      dishesPropertyIsValid,
      idPropertyIsValid,
      update
  ],
  delete: [orderExists, statusNotPending, destroy],
};