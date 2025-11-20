import { useState } from "react";
import "./App.css";
import TabNavigation from "./components/TabNavigation";
import MainView from "./components/MainView";
import ConfigView from "./components/ConfigView";
import { useExtensionData } from "./hooks/useExtensionData";

function App() {
	const [activeTab, setActiveTab] = useState("main");
	const {
		deploymentNumber,
		outputTypes,
		selectedOutputType,
		token,
		handleDeploymentChange,
		handleOutputTypeChange,
		toggleToken,
		addOutputType,
		deleteOutputType,
		clearAll,
		mxIds,
		selectedMxId,
		handleMxIdChange,
		addMxId,
		deleteMxId,
	} = useExtensionData();

	return (
		<>
			<h1 className="main__title">Detectdiv</h1>

			<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

			{activeTab === "main" && (
				<MainView
					deploymentNumber={deploymentNumber}
					outputTypes={outputTypes}
					selectedOutputType={selectedOutputType}
					token={token}
					mxIds={mxIds}
					selectedMxId={selectedMxId}
					onDeploymentChange={handleDeploymentChange}
					onOutputTypeChange={handleOutputTypeChange}
					onToggleToken={toggleToken}
					onMxIdChange={handleMxIdChange}
					onClear={clearAll}
				/>
			)}

			{activeTab === "config" && (
				<ConfigView
					outputTypes={outputTypes}
					onAddOutputType={addOutputType}
					onDeleteOutputType={deleteOutputType}
					mxIds={mxIds}
					onAddMxId={addMxId}
					onDeleteMxId={deleteMxId}
				/>
			)}
		</>
	);
}

export default App;
