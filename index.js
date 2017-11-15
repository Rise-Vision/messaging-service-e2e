import TokenTest from "./src/test-existing-receives-token.js";

exports.messagingServiceE2E = function messagingServiceE2E (req, res) {
  console.log("Starting E2E");

  const tokenTest = new TokenTest(req.query.hipchatKey, req.query.mstokenKey);
  tokenTest.run();

  res.status(200).send("Starting E2E");
};
