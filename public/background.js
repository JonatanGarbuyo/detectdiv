// Listen for tab updates to intercept navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// Only process when the tab is loading and has a URL
	if (changeInfo.status === "loading" && tab.url) {
		// Check if this tab has a deployment number stored
		chrome.storage.local.get([`deployment_${tabId}`], (result) => {
			const deployment = result[`deployment_${tabId}`];
			
			if (deployment && deployment.trim() !== "") {
				try {
					const url = new URL(tab.url);
					
					// Skip chrome://, chrome-extension://, etc.
					if (!url.protocol.startsWith("http")) {
						return;
					}
					
					// Check if URL already has the correct 'd' parameter
					const existingD = url.searchParams.get("d");
					if (existingD === deployment) {
						return; // Already has the correct parameter
					}
					
					// Update the URL with the deployment parameter
					url.searchParams.set("d", deployment);
					
					// Navigate to the updated URL
					chrome.tabs.update(tabId, { url: url.toString() });
				} catch (error) {
					console.error("Error updating URL with deployment:", error);
				}
			}
		});
	}
});

// Clean up deployment number when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
	chrome.storage.local.remove([`deployment_${tabId}`], () => {
		console.log(`Cleaned up deployment for tab ${tabId}`);
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
			// Clear deployment if empty
			chrome.storage.local.remove([`deployment_${tabId}`], () => {
				sendResponse({ success: true });
			});
		}
		return true; // Keep the message channel open for async response
	}
	
	if (request.action === "getDeployment") {
		const tabId = request.tabId;
		chrome.storage.local.get([`deployment_${tabId}`], (result) => {
			sendResponse({ deployment: result[`deployment_${tabId}`] || "" });
		});
		return true;
	}
});

