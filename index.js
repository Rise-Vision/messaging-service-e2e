import TokenTest from "./src/test-existing-receives-token.js";
import UpdateTest from "./src/test-update.js";

exports.messagingServiceE2E = function messagingServiceE2E (req, res) {
  console.log("Starting E2E");

  const tokenTest = new TokenTest(req.query.hipchatKey, req.query.mstokenKey);
  tokenTest.run();
  const updateTest = new UpdateTest(req.query.hipchatKey, req.query.mstokenKey);
  updateTest.run();

  res.status(200).send("Starting E2E");
};
