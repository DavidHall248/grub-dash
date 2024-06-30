const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
//const dishes = require("../data/dishes-data");

function list(req, res) {
  const { userId } = req.params;
  res.json({ data: dishes.filter(userId ? dish => dish.user_id == userId : () => true) });
}

let lastdishId = dishes.reduce((maxId, dish) => Math.max(maxId, dish.id), 0)

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

function pricePropertyIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price >= 0 && Number.isInteger(price)) {
    return next();
  }
  next({
    status: 400,
    message: `Value of the 'price' property must be greater than or equal to 0. Received: ${price}`,
  });
}

function idPropertyIsValid(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id ? dishId === id : true) {
    return next();
  }
  next({
    status: 400,
    message: "id:" + id,
  });
}

function create(req, res) {
  const { data: { name, syntax, exposure, expiration, text } = {} } = req.body;
  const newdish = {
    id: ++lastdishId, // Increment last id then assign as the current ID
    name: name,
    syntax: syntax,
    exposure: exposure,
    expiration: expiration,
    text: text,
  };
  dishes.push(newdish);
  res.status(201).json({ data: newdish });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => Number(dish.id) === Number(dishId));
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `dish id not found: ${dishId}`,
  });
};

function read(req, res, next) {
  res.json({ data: res.locals.dish });
};

function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  // update the dish
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

function destroy(req, res) {
  const { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === dishId);
  // `splice()` returns an array of the deleted elements, even if it is one element
  const deleteddishes = dishes.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  create: [
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      pricePropertyIsValid,
      create
  ],
  list,
  read: [dishExists, read],
  update: [
      dishExists,
      bodyDataHas("name"),
      bodyDataHas("description"),
      bodyDataHas("price"),
      bodyDataHas("image_url"),
      pricePropertyIsValid,
      idPropertyIsValid,
      update
  ],
  delete: [dishExists, destroy],
};