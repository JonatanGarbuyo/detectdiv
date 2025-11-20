import React, { useState } from "react";
import GlobalContentTab from "./components/GlobalContentTab";

const DevToolsApp = () => {
	const [activeTab, setActiveTab] = useState("global-content");

	return (
		<div className="container-fluid">
			<div className="tabs">
				<button
					className={`tab-button ${activeTab === "global-content" ? "active" : ""}`}
					onClick={() => setActiveTab("global-content")}
					type="button"
				>
					Global Content
				</button>
			</div>

			<div className="tab-content">{activeTab === "global-content" && <GlobalContentTab />}</div>
		</div>
	);
};

export default DevToolsApp;
