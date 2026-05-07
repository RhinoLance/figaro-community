import { useRef, useState, useEffect } from "react";
import InstallTaskButton from "./InstallTaskButton";
import { ITaskDraft } from "../models/IFigaroTypes";
import { getEnvPaths } from "../models/Paths";

interface ITaskPublisherProps {
	taskDefinition: ITaskDraft;
}

export default function TaskPublisher({
	taskDefinition
}: ITaskPublisherProps) {

	const [endpoint, setEndpoint] = useState<string>
		(getEnvPaths().userScriptsApi);

	const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
	const [publishText, setPublishText] = useState<string>('Publish');

	async function publishTask() {
		
		setResultSuccess(null);

		const validationError = validateTaskDefinition(taskDefinition);
		if( validationError ) {
			setResultSuccess(false);
			console.error(validationError);
			return;
		}

		try {
			
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(taskDefinition)
			});

			if( !response.ok ) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			console.log(Array.from(response.headers.entries()));
			console.log('Location header:', response.headers.get('Location'));
			
			setEndpoint(response.headers.get('Location') || endpoint);
			const data = await response.json();

			console.log('Success:', data);
			setResultSuccess(true);
			setPublishText('Update');

		} catch (error) {
			console.error('Error:', error);
			setResultSuccess(false);
		}
	}

	function validateTaskDefinition(taskDef: ITaskDraft): string {
		// Basic validation: check for required fields
		if( !taskDef.title )return "No title provided.";
		if( taskDef.description === undefined ) return "No description provided.";
		if( !taskDef.script ) return "No script provided.";
		if( taskDef.autoLock === undefined ) return "Auto lock not defined.";
		if( taskDef.autoRunOnConnect === undefined ) return "Auto run on connect not defined.";
		if( taskDef.autoRunPriority === undefined ) return "Auto run priority not defined.";

		if( !JSON.parse(JSON.stringify(taskDef)) ) return "Invalid script.";
		
		return "";
	}

	function buildInstallLink() {
		console.log('Building install link with endpoint:', endpoint);
		return (
			<InstallTaskButton ftdFileName={endpoint} />
		)
	}

	function buildPublishedLink() {
		return <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
				🔗{' '}
				<a href={endpoint} target="_blank" rel="noopener noreferrer">
					{endpoint}.
				</a>
			</div>
	}

	return (
		<div className="task-publisher">
			<button id="publishBtn" onClick={publishTask}>{publishText} Task</button>
			{resultSuccess === false && <p className="error">An error occurred while publishing the task.</p>}
			{resultSuccess === true && <p className="success">Task published successfully!</p>}
			{resultSuccess === true && buildInstallLink()}
			{resultSuccess === true && buildPublishedLink()}
		</div>
	);
}