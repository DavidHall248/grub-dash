const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass
router.route("/:orderId")
  .get(controller.read)
  .put(controller.update)
  .delete(controller.delete);

router.route("/")
  .post(controller.create)
  .get(controller.list);


module.exports = router;