const argon2 = require('argon2');
const bcrypt = require('bcryptjs');

/**
 * Hashes a plain text password using Argon2id with recommended parameters.
 * @param {string} plainPassword 
 * @returns {Promise<string>}
 */
const hashPassword = async (plainPassword) => {
    return await argon2.hash(plainPassword, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64 MB
        timeCost: 3,
        parallelism: 4
    });
};

/**
 * Verifies a plain text password against a stored hash (supports Argon2id and bcrypt for migration).
 * @param {string} plainPassword 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
const verifyPassword = async (plainPassword, hash) => {
    // Migration check: If the stored hash is an old bcrypt hash, verify using bcryptjs
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        return await bcrypt.compare(plainPassword, hash);
    }

    // Otherwise, verify using Argon2id
    try {
        return await argon2.verify(hash, plainPassword);
    } catch (error) {
        return false;
    }
};

module.exports = {
    hashPassword,
    verifyPassword
};
