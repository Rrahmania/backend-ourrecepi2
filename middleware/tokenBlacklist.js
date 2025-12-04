const blacklist = new Set();

export const addToken = (token) => {
  blacklist.add(token);
};

export const isBlacklisted = (token) => {
  return blacklist.has(token);
};

export default { addToken, isBlacklisted };
