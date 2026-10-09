// localStorage wrapper: blocked storage (some private modes) or corrupted
// JSON must never break the page, so every call fails soft.
export const storage = {
  /**
   * @param {string} key
   * @returns {unknown} parsed value, or null when missing or unreadable
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {unknown} value
   * @returns {boolean} false when the value could not be stored
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};
