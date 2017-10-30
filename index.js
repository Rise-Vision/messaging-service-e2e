import Test from "./src/test.js";

exports.messagingServiceE2E = function messagingServiceE2E (req, res) {
  console.log("Starting E2E");

  const test = new Test(req.query.key);
  test.run();

  res.status(200).send("Starting E2E");
};
