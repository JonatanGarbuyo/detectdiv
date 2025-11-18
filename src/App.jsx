import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [deploymentNumber, setDeploymentNumber] = useState("");
	const [currentTabId, setCurrentTabId] = useState(null);

	useEffect(() => {
		// Get the active tab and load saved deployment number
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]?.id) {
				const tabId = tabs[0].id;
				setCurrentTabId(tabId);

				// Load saved deployment number for this tab
				chrome.runtime.sendMessage({ action: "getDeployment", tabId: tabId }, (response) => {
					if (response?.deployment) {
						setDeploymentNumber(response.deployment);
					} else {
						// If no saved value, check current URL
						if (tabs[0]?.url) {
							try {
								const url = new URL(tabs[0].url);
								const existingDeployment = url.searchParams.get("d");
								if (existingDeployment) {
									setDeploymentNumber(existingDeployment);
									// Save it for future navigations
									saveDeployment(tabId, existingDeployment);
								}
							} catch (error) {
								console.error("Error parsing URL:", error);
							}
						}
					}
				});
			}
		});
	}, []);

	const saveDeployment = (tabId, deployment) => {
		chrome.runtime.sendMessage(
			{
				action: "saveDeployment",
				tabId: tabId,
				deployment: deployment,
			},
			(response) => {
				if (response?.success) {
					// Update current URL immediately if tab is available
					chrome.tabs.get(tabId, (tab) => {
						if (tab?.url) {
							try {
								const url = new URL(tab.url);
								if (!url.protocol.startsWith("http")) {
									return;
								}

								url.searchParams.delete("d");
								if (deployment && deployment.trim() !== "") {
									url.searchParams.set("d", deployment);
								}

								chrome.tabs.update(tabId, { url: url.toString() });
							} catch (error) {
								console.error("Error updating URL:", error);
							}
						}
					});
				}
			}
		);
	};

	const handleDeploymentChange = (e) => {
		const value = e.target.value;
		setDeploymentNumber(value);

		if (currentTabId !== null) {
			saveDeployment(currentTabId, value);
		}
	};

	const handleClear = () => {
		setDeploymentNumber("");
		if (currentTabId !== null) {
			saveDeployment(currentTabId, "");
		}
	};

	const handleClose = () => {
		window.close();
	};

	return (
		<>
			<button className="close-button" onClick={handleClose} type="button" aria-label="Close">
				X
			</button>
			<h1 className="main__title">Detectdiv</h1>

			<div className="form-row">
				<label className="form-label" htmlFor="deployment">
					Deployment number
				</label>
				<input
					className="form-input"
					type="number"
					name="deployment"
					id="deployment"
					value={deploymentNumber}
					onChange={handleDeploymentChange}
					placeholder="123"
				/>
			</div>
			<button onClick={handleClear} type="button" className="clear-button">
				Clear all
			</button>
		</>
	);
}

export default App;
