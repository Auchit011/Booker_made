// utils/generateUserId.js
function generateUserId(role) {
  const prefix = role === 'maid' ? 'maid_' : 'driver_';
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return prefix + random;
}

module.exports = generateUserId;
