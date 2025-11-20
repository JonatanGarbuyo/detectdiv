

/**
 * Sends a message to the chrome runtime.
 * @param {object} message - The message to send.
 * @returns {Promise<any>} - A promise that resolves with the response.
 */
export const sendMessage = (message) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.error("sendMessage error:", chrome.runtime.lastError);
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
};

/**
 * Gets the active tab in the current window.
 * @returns {Promise<chrome.tabs.Tab>} - A promise that resolves with the active tab.
 */
export const getActiveTab = () => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0]);
    });
  });
};

/**
 * Gets a tab by its ID.
 * @param {number} tabId - The ID of the tab to get.
 * @returns {Promise<chrome.tabs.Tab>} - A promise that resolves with the tab.
 */
export const getTab = (tabId) => {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      resolve(tab);
    });
  });
};

/**
 * Updates a tab's properties.
 * @param {number} tabId - The ID of the tab to update.
 * @param {object} updateProperties - The properties to update.
 * @returns {Promise<chrome.tabs.Tab>} - A promise that resolves with the updated tab.
 */
export const updateTab = (tabId, updateProperties) => {
  return new Promise((resolve) => {
    chrome.tabs.update(tabId, updateProperties, (tab) => {
      resolve(tab);
    });
  });
};

/**
 * Gets data from local storage.
 * @param {string|string[]} keys - The key or keys to get.
 * @returns {Promise<object>} - A promise that resolves with the data.
 */
export const getStorageLocal = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result);
    });
  });
};

/**
 * Sets data in local storage.
 * @param {object} items - The items to set.
 * @returns {Promise<void>} - A promise that resolves when the data is set.
 */
export const setStorageLocal = (items) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
};
