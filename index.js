import TokenTest from "./src/test-existing-receives-token.js";
import UpdateTest from "./src/test-update.js";

exports.messagingServiceE2E = function messagingServiceE2E (req, res) {
  console.log("Starting E2E");

  const tokenTest = new TokenTest(req.query.mstokenKey);
  const updateTest = new UpdateTest();

  tokenTest.run();
  updateTest.run();
  res.status(200).send("Starting E2E tests");
};
