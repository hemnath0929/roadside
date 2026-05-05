/**
 * locationStore.js
 * ----------------
 * In-memory store for the latest mechanic GPS location keyed by requestId.
 * Resets on server restart (intentional for local-dev use).
 */

const locationStore = new Map();

/**
 * Save or overwrite the latest mechanic location for a given request.
 * @param {string} requestId
 * @param {Object} locationData - { mechanicId, lat, lng, heading, speed, updatedAt }
 */
function setLocation(requestId, locationData) {
  locationStore.set(requestId, {
    ...locationData,
    storedAt: Date.now(),
  });
  console.log(
    `[LocationStore] Updated location for requestId=${requestId} | lat=${locationData.lat}, lng=${locationData.lng}`
  );
}

/**
 * Retrieve the latest mechanic location for a given request.
 * @param {string} requestId
 * @returns {Object|null}
 */
function getLocation(requestId) {
  return locationStore.get(requestId) || null;
}

/**
 * Remove location entry when a request is completed or abandoned.
 * @param {string} requestId
 */
function clearLocation(requestId) {
  const existed = locationStore.has(requestId);
  locationStore.delete(requestId);
  if (existed) {
    console.log(`[LocationStore] Cleared location for requestId=${requestId}`);
  }
}

/**
 * Return all currently tracked requests (for debugging).
 * @returns {Object}
 */
function getAllLocations() {
  const result = {};
  locationStore.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

module.exports = { setLocation, getLocation, clearLocation, getAllLocations };
