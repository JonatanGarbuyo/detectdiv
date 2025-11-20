import React, { useState, useCallback } from "react";
import ReactJson from "react-json-view";

const GlobalContentTab = () => {
	const [globalContent, setGlobalContent] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const [collapsed, setCollapsed] = useState(2);

	const fetchGlobalContent = useCallback(() => {
		setLoading(true);
		setError(null);
		setGlobalContent(null);

		const getGlobalContent = () => {
			try {
				// User reported Fusion might be an object, not a function.
				// Trying direct property access.
				return JSON.stringify(window.Fusion?.globalContent || window.Fusion?.()?.globalContent);
			} catch {
				return null;
			}
		};

		const tabId = chrome.devtools.inspectedWindow.tabId;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				func: getGlobalContent,
				world: "MAIN",
			},
			(results) => {
				setLoading(false);

				if (chrome.runtime.lastError) {
					setError(chrome.runtime.lastError.message);
					return;
				}

				if (!results || !results[0]) {
					setError("No results returned from script execution");
					return;
				}

				const result = results[0].result;
				if (result) {
					try {
						const parsedContent = JSON.parse(result);
						setGlobalContent(parsedContent);
						setError(null);
					} catch {
						setError("Error parsing global content JSON");
					}
				} else {
					setGlobalContent(null);
				}
			}
		);
	}, []);

	return (
		<article>
			<header>
				<hgroup>
					<h2>Global Content</h2>
					<small>Inspect Fusion object</small>
				</hgroup>
			</header>

			<section className="container">
				<button
					onClick={fetchGlobalContent}
					disabled={loading}
					data-tooltip="Refresh"
					className="outline"
				>
					{loading ? "⏳" : "🔄"}
				</button>
				<button
					onClick={() => setCollapsed(false)}
					disabled={!globalContent}
					data-tooltip="Expand All"
					className="outline secondary"
				>
					➕
				</button>
				<button
					onClick={() => setCollapsed(true)}
					disabled={!globalContent}
					data-tooltip="Collapse All"
					className="outline secondary"
				>
					➖
				</button>
			</section>

			{error && (
				<article aria-label="Error" className="pico-background-red-100">
					{error}
				</article>
			)}

			{globalContent && (
				<div style={{ overflow: "auto" }}>
					<ReactJson
						src={globalContent}
						theme="rjv-default"
						collapsed={collapsed}
						displayDataTypes={false}
						name={false}
						enableClipboard={true}
					/>
				</div>
			)}

			{!loading && !error && !globalContent && (
				<p>No global content found. Make sure Fusion() is available on the page.</p>
			)}
		</article>
	);
};

export default GlobalContentTab;
