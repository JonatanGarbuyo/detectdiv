import React, { useState } from "react";

const ConfigView = ({
	outputTypes,
	onAddOutputType,
	onDeleteOutputType,
	mxIds,
	onAddMxId,
	onDeleteMxId,
}) => {
	const [newOutputType, setNewOutputType] = useState("");
	const [newMxId, setNewMxId] = useState("");
	const [newMxName, setNewMxName] = useState("");

	const handleAddOutputType = () => {
		onAddOutputType(newOutputType);
		setNewOutputType("");
	};

	const handleAddMxId = () => {
		if (newMxId) {
			onAddMxId({ id: newMxId, name: newMxName });
			setNewMxId("");
			setNewMxName("");
		}
	};

	return (
		<div className="tab-content">
			<div className="">
				<h2 className="">Output Types</h2>
				{outputTypes.map((type) => (
					<fieldset className="grid" key={type} role="group">
						<input className="" disabled value={type} />
						<button
							className=""
							type="button"
							onClick={() => onDeleteOutputType(type)}
							aria-label={`Delete ${type}`}
							disabled={outputTypes.length <= 1}
						>
							–
						</button>
					</fieldset>
				))}
			</div>

			<div className="">
				<fieldset className="grid" role="group">
					<input
						className=""
						type="text"
						name="newOutputType"
						id="newOutputType"
						value={newOutputType}
						onChange={(e) => setNewOutputType(e.target.value)}
						placeholder="Add Output Type"
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								handleAddOutputType();
							}
						}}
					/>
					<button
						className=""
						type="button"
						onClick={handleAddOutputType}
						aria-label="Add output type"
					>
						+
					</button>
				</fieldset>
			</div>

			<hr />

			<div className="">
				<h2 className="">Microexperiences</h2>
				{mxIds &&
					mxIds.map((item) => (
						<fieldset className="grid" key={item.id} role="group">
							<input
								className=""
								disabled
								value={`${item.name ? item.name + " (" + item.id + ")" : item.id}`}
							/>
							<button
								className=""
								type="button"
								onClick={() => onDeleteMxId(item.id)}
								aria-label={`Delete ${item.name || item.id}`}
							>
								–
							</button>
						</fieldset>
					))}
			</div>

			<div className="">
				<fieldset className="grid" role="group">
					<input
						className=""
						type="text"
						name="newMxId"
						id="newMxId"
						value={newMxId}
						onChange={(e) => setNewMxId(e.target.value)}
						placeholder="ID (e.g. 375a1979)"
					/>
					<input
						className=""
						type="text"
						name="newMxName"
						id="newMxName"
						value={newMxName}
						onChange={(e) => setNewMxName(e.target.value)}
						placeholder="Name (Optional)"
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								handleAddMxId();
							}
						}}
					/>
					<button
						className=""
						type="button"
						onClick={handleAddMxId}
						aria-label="Add microexperience"
					>
						+
					</button>
				</fieldset>
			</div>
		</div>
	);
};

export default ConfigView;
