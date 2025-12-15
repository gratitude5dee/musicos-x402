// Stub for @turnkey/api-key-stamper nodecrypto module
// This prevents Node.js crypto imports from breaking browser builds

export const createPrivateKey = () => {
  throw new Error('Node.js crypto not available in browser');
};

export const createSign = () => {
  throw new Error('Node.js crypto not available in browser');
};

export default {};
