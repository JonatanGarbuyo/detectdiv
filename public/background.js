const tabUpdateQueues = new Map();

const PARAMETER_DEFINITIONS = [
	{ param: "d", storage: "deployment", saveAction: "saveDeployment", getAction: "getDeployment", field: "deployment" },
	{ param: "outputType", storage: "outputType", saveAction: "saveOutputType", getAction: "getOutputType", field: "outputType" },
	{ param: "token", storage: "token", saveAction: "saveToken", getAction: "getToken", field: "token" },
	{ param: "mxId", storage: "mxId", saveAction: "saveMxId", getAction: "getMxId", field: "mxId" },
	{ param: "google_console", storage: "googleConsole", saveAction: "saveGoogleConsole", getAction: "getGoogleConsole", field: "googleConsole", isValid: (value) => value === "1" },
];

const storageKey = (definition, tabId) => `${definition.storage}_${tabId}`;
const isStoredValueValid = (definition, value) =>
	definition.isValid ? definition.isValid(value) : typeof value === "string" && value.trim() !== "";

const updateTabUrlParams = (tabId, params) => {
	const previousUpdate = tabUpdateQueues.get(tabId) || Promise.resolve();
	const nextUpdate = previousUpdate.catch(() => {}).then(() => new Promise((resolve) => {
		chrome.tabs.get(tabId, (tab) => {
			if (chrome.runtime.lastError || !tab?.url) {
				resolve({ success: false });
				return;
			}

			try {
				const url = new URL(tab.url);
				if (!url.protocol.startsWith("http")) {
					resolve({ success: false });
					return;
				}

				Object.entries(params).forEach(([param, value]) => {
					url.searchParams.delete(param);
					if (typeof value === "string" && value.trim() !== "") {
						url.searchParams.set(param, value);
					}
				});

				chrome.tabs.update(tabId, { url: url.toString() }, () => {
					resolve({ success: !chrome.runtime.lastError });
				});
			} catch (error) {
				console.error("Error updating URL parameters:", error);
				resolve({ success: false });
			}
		});
	}));

	tabUpdateQueues.set(tabId, nextUpdate);
	nextUpdate.finally(() => {
		if (tabUpdateQueues.get(tabId) === nextUpdate) {
			tabUpdateQueues.delete(tabId);
		}
	});

	return nextUpdate;
};

// Listen for tab updates to intercept navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// Only process when the tab is loading and has a URL
	if (changeInfo.status === "loading" && tab.url) {
		try {
			const url = new URL(tab.url);
			
			// Skip chrome://, chrome-extension://, etc.
			if (!url.protocol.startsWith("http")) {
				return;
			}
			
			const storageKeys = PARAMETER_DEFINITIONS.map((definition) => storageKey(definition, tabId));
			chrome.storage.local.get(storageKeys, (result) => {
				let urlUpdated = false;
				let updatesToStorage = {};

				PARAMETER_DEFINITIONS.forEach((definition) => {
					const key = storageKey(definition, tabId);
					const storedValue = result[key];
					const urlValue = url.searchParams.get(definition.param);

					if (urlValue !== null && urlValue !== storedValue) {
						updatesToStorage[key] = urlValue;
					} else if (urlValue === null && isStoredValueValid(definition, storedValue)) {
						url.searchParams.set(definition.param, storedValue);
						urlUpdated = true;
					}
				});

				// Apply storage updates if any
				if (Object.keys(updatesToStorage).length > 0) {
					chrome.storage.local.set(updatesToStorage);
				}
				
				// Navigate to the updated URL if any parameter was changed (only happens if URL was missing params present in storage)
				if (urlUpdated) {
					chrome.tabs.update(tabId, { url: url.toString() });
				}
			});
		} catch (error) {
			console.error("Error updating URL with parameters:", error);
		}
	}
});

chrome.tabs.onRemoved.addListener((tabId) => {
	const storageKeys = PARAMETER_DEFINITIONS.map((definition) => storageKey(definition, tabId));
	chrome.storage.local.remove(storageKeys, () => {
		console.log(`Cleaned up parameters for tab ${tabId}`);
	});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "updateUrlParams") {
		updateTabUrlParams(request.tabId, request.params).then(sendResponse);
		return true;
	}

	const saveDefinition = PARAMETER_DEFINITIONS.find((definition) => definition.saveAction === request.action);
	if (saveDefinition) {
		const key = storageKey(saveDefinition, request.tabId);
		const value = request[saveDefinition.field];
		const callback = () => sendResponse({ success: true });

		if (isStoredValueValid(saveDefinition, value)) {
			chrome.storage.local.set({ [key]: value }, callback);
		} else {
			chrome.storage.local.remove([key], callback);
		}
		return true;
	}

	const getDefinition = PARAMETER_DEFINITIONS.find((definition) => definition.getAction === request.action);
	if (getDefinition) {
		const key = storageKey(getDefinition, request.tabId);
		chrome.storage.local.get([key], (result) => {
			sendResponse({ [getDefinition.field]: result[key] || "" });
		});
		return true;
	}

	if (request.action === "log") {
		console.log("[DevTools Log]:", request.message);
		return true;
	}
});
