// Listen for tab updates to intercept navigation
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
			
			// Get deployment, outputType, token, and mxId in a single call
			chrome.storage.local.get([`deployment_${tabId}`, `outputType_${tabId}`, `token_${tabId}`, `mxId_${tabId}`], (result) => {
				let urlUpdated = false;
				
				const deployment = result[`deployment_${tabId}`];
				const existingD = url.searchParams.get("d");
				
				if (deployment && deployment.trim() !== "") {
					if (existingD !== deployment) {
						url.searchParams.set("d", deployment);
						urlUpdated = true;
					}
				} else {
					if (existingD !== null) {
						url.searchParams.delete("d");
						urlUpdated = true;
					}
				}
				
				const outputType = result[`outputType_${tabId}`];
				const existingOutputType = url.searchParams.get("outputType");
				
				if (outputType && outputType.trim() !== "") {
					if (existingOutputType !== outputType) {
						url.searchParams.set("outputType", outputType);
						urlUpdated = true;
					}
				} else {
					if (existingOutputType !== null) {
						url.searchParams.delete("outputType");
						urlUpdated = true;
					}
				}

				const token = result[`token_${tabId}`];
				const existingToken = url.searchParams.get("token");

				if (token && token.trim() !== "") {
					if (existingToken !== token) {
						url.searchParams.set("token", token);
						urlUpdated = true;
					}
				} else {
					if (existingToken !== null) {
						url.searchParams.delete("token");
						urlUpdated = true;
					}
				}

				const mxId = result[`mxId_${tabId}`];
				const existingMxId = url.searchParams.get("mxId");

				if (mxId && mxId.trim() !== "") {
					if (existingMxId !== mxId) {
						url.searchParams.set("mxId", mxId);
						urlUpdated = true;
					}
				} else {
					if (existingMxId !== null) {
						url.searchParams.delete("mxId");
						urlUpdated = true;
					}
				}
				
				// Navigate to the updated URL if any parameter was changed
				if (urlUpdated) {
					chrome.tabs.update(tabId, { url: url.toString() });
				}
			});
		} catch (error) {
			console.error("Error updating URL with parameters:", error);
		}
	}
});

// Clean up deployment number, outputType, token, and mxId when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
	chrome.storage.local.remove([`deployment_${tabId}`, `outputType_${tabId}`, `token_${tabId}`, `mxId_${tabId}`], () => {
		console.log(`Cleaned up parameters for tab ${tabId}`);
	});
});

// Listen for messages from popup to save deployment number
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "saveDeployment") {
		const tabId = request.tabId;
		const deployment = request.deployment;
		
		if (deployment && deployment.trim() !== "") {
			chrome.storage.local.set({ [`deployment_${tabId}`]: deployment }, () => {
				sendResponse({ success: true });
			});
		} else {
			chrome.storage.local.remove([`deployment_${tabId}`], () => {
				sendResponse({ success: true });
			});
		}
		return true;
	}
	
	if (request.action === "getDeployment") {
		const tabId = request.tabId;
		chrome.storage.local.get([`deployment_${tabId}`], (result) => {
			sendResponse({ deployment: result[`deployment_${tabId}`] || "" });
		});
		return true;
	}
	
	if (request.action === "saveOutputType") {
		const tabId = request.tabId;
		const outputType = request.outputType;
		
		if (outputType && outputType.trim() !== "") {
			chrome.storage.local.set({ [`outputType_${tabId}`]: outputType }, () => {
				sendResponse({ success: true });
			});
		} else {
			chrome.storage.local.remove([`outputType_${tabId}`], () => {
				sendResponse({ success: true });
			});
		}
		return true;
	}
	
	if (request.action === "getOutputType") {
		const tabId = request.tabId;
		chrome.storage.local.get([`outputType_${tabId}`], (result) => {
			sendResponse({ outputType: result[`outputType_${tabId}`] || "" });
		});
		return true;
	}

	if (request.action === "saveToken") {
		const tabId = request.tabId;
		const token = request.token;
		
		if (token && token.trim() !== "") {
			chrome.storage.local.set({ [`token_${tabId}`]: token }, () => {
				sendResponse({ success: true });
			});
		} else {
			chrome.storage.local.remove([`token_${tabId}`], () => {
				sendResponse({ success: true });
			});
		}
		return true;
	}
	
	if (request.action === "getToken") {
		const tabId = request.tabId;
		chrome.storage.local.get([`token_${tabId}`], (result) => {
			sendResponse({ token: result[`token_${tabId}`] || "" });
		});
		return true;
	}

	if (request.action === "saveMxId") {
		const tabId = request.tabId;
		const mxId = request.mxId;
		
		if (mxId && mxId.trim() !== "") {
			chrome.storage.local.set({ [`mxId_${tabId}`]: mxId }, () => {
				sendResponse({ success: true });
			});
		} else {
			chrome.storage.local.remove([`mxId_${tabId}`], () => {
				sendResponse({ success: true });
			});
		}
		return true;
	}
	
	if (request.action === "getMxId") {
		const tabId = request.tabId;
		chrome.storage.local.get([`mxId_${tabId}`], (result) => {
			sendResponse({ mxId: result[`mxId_${tabId}`] || "" });
		});
		return true;
	}

	if (request.action === "log") {
		console.log("[DevTools Log]:", request.message);
		return true;
	}
});
