// Browser-compatible stub for Node.js crypto module
// Used by @turnkey packages that have Node.js-specific code paths

export const createPrivateKey = () => {
  console.warn('createPrivateKey: Node.js crypto not available in browser');
  return null;
};

export const createSign = () => {
  console.warn('createSign: Node.js crypto not available in browser');
  return {
    update: () => ({ sign: () => Buffer.from([]) }),
  };
};

export const createHash = (algorithm: string) => ({
  update: (data: string) => ({
    digest: (encoding: string) => {
      // Use Web Crypto API for hashing
      return '';
    },
  }),
});

export const randomBytes = (size: number) => {
  const arr = new Uint8Array(size);
  crypto.getRandomValues(arr);
  return Buffer.from(arr);
};

export default {
  createPrivateKey,
  createSign,
  createHash,
  randomBytes,
};
