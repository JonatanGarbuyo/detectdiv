import { useState, useCallback, useEffect } from "react";

const useFusionData = () => {
	const [data, setData] = useState({
		globalContent: null,
		environment: null,
		mxId: null,
		deployment: null,
		arcSite: null,
		layout: null,
		outputType: null,
		template: null,
	});
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);

	// Smart retry logic to handle async hydration
	const fetchFusionData = useCallback(function attemptFetch(retryIdx = 0) {
		setLoading(true);
		if (retryIdx === 0) {
			setError(null);
			setData({
				globalContent: null,
				environment: null,
				mxId: null,
				deployment: null,
				arcSite: null,
				layout: null,
				outputType: null,
				template: null,
			});
		}

		const getFusionData = () => {
			try {
				const fusionSource = window.Fusion;
				const fusion = typeof fusionSource === "function" ? fusionSource() : fusionSource;
				if (!fusion) return null;

				return JSON.stringify({
					globalContent: fusion.globalContent,
					environment: fusion.environment,
					mxId: fusion.mxId,
					deployment: fusion.deployment,
					arcSite: fusion.arcSite,
					layout: fusion.layout,
					outputType: fusion.outputType,
					template: fusion.template,
				});
			} catch {
				return null;
			}
		};

		const tabId = chrome.devtools.inspectedWindow.tabId;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				func: getFusionData,
				world: "MAIN",
			},
			(results) => {
				const delays = [100, 300, 500, 700, 900];

				if (chrome.runtime.lastError) {
					if (retryIdx >= delays.length) {
						setLoading(false);
						setError(chrome.runtime.lastError.message);
					} else {
						setTimeout(() => attemptFetch(retryIdx + 1), delays[retryIdx]);
					}
					return;
				}

				if (!results || !results[0]) {
					if (retryIdx >= delays.length) {
						setLoading(false);
						setError("No results returned from script execution");
					} else {
						setTimeout(() => attemptFetch(retryIdx + 1), delays[retryIdx]);
					}
					return;
				}

				const result = results[0].result;
				if (result) {
					try {
						const parsedData = JSON.parse(result);
						setData(parsedData);
						setError(null);
						setLoading(false);
					} catch {
						setLoading(false);
						setError("Error parsing Fusion JSON");
					}
				} else {
					if (retryIdx < delays.length) {
						setTimeout(() => attemptFetch(retryIdx + 1), delays[retryIdx]);
					} else {
						setLoading(false);
						// Don't set error here, just empty data
					}
				}
			}
		);
	}, []);

	useEffect(() => {
		fetchFusionData();

		const onNavigated = () => {
			fetchFusionData();
		};

		chrome.devtools.network.onNavigated.addListener(onNavigated);

		return () => {
			chrome.devtools.network.onNavigated.removeListener(onNavigated);
		};
	}, [fetchFusionData]);

	return { data, loading, error, refresh: () => fetchFusionData(0) };
};

export default useFusionData;
