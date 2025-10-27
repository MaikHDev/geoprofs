export const env = new Proxy({}, {
  get: (_, key) => process.env[key as string] ?? "test-value",
});
