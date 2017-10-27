import Test from "./src/test.js";

exports.messagingServiceE2E = function messagingServiceE2E (req, res) {
  console.log("Starting E2E");

  const test = new Test();
  test.run(req.query.key);

  res.status(200).send("Starting E2E");
};
