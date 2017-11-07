import crypto from "./crypto.js";

export default (data = {}, hash, mstokenKey)=>{
  const {displayId, filePath, timestamp} = data;
  if (!displayId || !filePath || !timestamp) {throw Error("invalid params");}

  return hash === crypto.encryptAndHash(data, mstokenKey)
}
