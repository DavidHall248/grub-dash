const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /dishes routes needed to make the tests pass
router.route("/:dishId")
  .get(controller.read)
  .put(controller.update)
  .delete(methodNotAllowed);

router.route("/")
  .post(controller.create)
  .get(controller.list);


module.exports = router;
