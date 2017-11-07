import crypto from "crypto";

export default {
  encryptAndHash(obj, mstokenKey) {
    const cipherKey = Buffer.from(mstokenKey, "hex")
    const inputBuffer = Buffer.from(JSON.stringify(obj));
    const hasher = crypto.createHash("sha1");
    const cipher = crypto.createCipheriv("aes-128-ecb", cipherKey, "");

    hasher.update(cipher.update(inputBuffer));
    hasher.update(cipher.final());
    return hasher.digest("hex");
  }
};
