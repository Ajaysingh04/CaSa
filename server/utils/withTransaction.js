const mongoose = require('mongoose');

/**
 * Executes an operation within a MongoDB transaction if replica set transactions
 * are available, with an automatic safe fallback to non-transactional execution
 * for standalone deployments.
 *
 * @param {Function} operationFn - Async function taking (session) and returning a result
 * @returns {Promise<any>}
 */
async function withTransaction(operationFn) {
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const result = await operationFn(session);

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (err) {
    // Check if error is due to standalone MongoDB (transactions not supported)
    const isStandaloneError =
      err.message &&
      (err.message.includes('Transaction numbers are only allowed on a replica set member') ||
        err.message.includes('replica set') ||
        err.code === 20 || // IllegalOperation
        err.codeName === 'IllegalOperation');

    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortErr) {
        // Ignore abort errors on standalone
      }
      session.endSession();
    }

    if (isStandaloneError) {
      // Safe fallback: execute operation without session
      return await operationFn(null);
    }

    throw err;
  }
}

module.exports = { withTransaction };
