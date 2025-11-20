import React from "react";

const MainView = ({
	deploymentNumber,
	outputTypes,
	selectedOutputType,
	token,
	mxIds,
	selectedMxId,
	onDeploymentChange,
	onOutputTypeChange,
	onToggleToken,
	onMxIdChange,
	onClear,
}) => {
	return (
		<div className="tab-content">
			<label className="" htmlFor="deployment">
				Deployment number
				<input
					type="number"
					name="deployment"
					id="deployment"
					value={deploymentNumber}
					onChange={(e) => onDeploymentChange(e.target.value)}
					placeholder="123"
				/>
			</label>

			<label className="" htmlFor="outputType">
				Output Type
				<select
					name="outputType"
					id="outputType"
					value={selectedOutputType}
					onChange={(e) => onOutputTypeChange(e.target.value)}
				>
					<option value=""> - </option>
					{outputTypes.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</label>

			<label className="" htmlFor="mxId">
				Microexperience
				<select
					name="mxId"
					id="mxId"
					value={selectedMxId}
					onChange={(e) => onMxIdChange(e.target.value)}
				>
					<option value=""> - </option>
					{mxIds &&
						mxIds.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name ? `${item.name} (${item.id})` : item.id}
							</option>
						))}
				</select>
			</label>

			<label htmlFor="tokenSwitch" className="grid token-switch">
				<div className="token-switch__text">Token {token && <small>({token})</small>}</div>
				<div>
					<input
						name="tokenSwitch"
						id="tokenSwitch"
						type="checkbox"
						role="switch"
						checked={!!token}
						onChange={(e) => onToggleToken(e.target.checked)}
					/>
				</div>
			</label>

			<input onClick={onClear} type="submit" className="" value="Clear all" />
		</div>
	);
};

export default MainView;
