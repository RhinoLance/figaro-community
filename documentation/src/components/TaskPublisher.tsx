import { useRef, useState, useEffect, useMemo, JSX } from "react";
import InstallTaskButton from "./InstallTaskButton";
import { ITaskDraft } from "../models/IFigaroTypes";
import { getEnvPaths } from "../models/Paths";
import styles from './TaskDefinitionBuilder.module.css';
import { Storage, StorageKeys } from "../models/Storage";

interface ITaskPublisherProps {
	taskDefinition: ITaskDraft;
}

export default function TaskPublisher({
	taskDefinition
}: ITaskPublisherProps) {

	const paths = getEnvPaths();

	const [endpoint, setEndpoint] = useState<string>
		(paths.userScriptsApi);

	const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
	const [publishText, setPublishText] = useState<string>('Publish');
	const [prefix, setPrefix] = useState<string>(
		Storage.get(StorageKeys.UserCallsign) || ''
	);
	const [errorText, setErrorText] = useState<string>('');
	const [lockScriptId, setLockScriptId] = useState<boolean>(false);
	const [publishInProgress, setPublishInProgress] = useState<boolean>(false);
	const [resultPanel, setResultPanel] = useState<JSX.Element | null>(null);

	function onPrefixChanged(value: string) {
		setPrefix(value);
		Storage.set(StorageKeys.UserCallsign, value);
	}

	const errorStyle = { color: 'var(--ifm-color-danger)', fontWeight: 'bold' };
	const taskLinkPanelStyle = {
		border: `5px solid var(--ifm-color-primary)`,
		borderRadius: '8px',
		padding: '1em',
		backgroundColor: 'rgb(247, 247, 247)',
	};

	const publishUrl = useMemo(() => {
		const url = `${paths.community}sharedTask/?` +
			`ftdPath=${encodeURIComponent(endpoint)}`;
		return url;
	}, [endpoint]);

	async function publishTask() {

		setResultSuccess(null);
		setPublishInProgress(true);

		try {

			const validationError = validateTaskDefinition(taskDefinition);
			if (validationError) {
				throw new Error(validationError);
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					ftd: taskDefinition,
					prefix: prefix.trim(),
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			switch (response.status) {
				case 201:
					// Created - new task published
					const locationHeader = response.headers.get('Location');
					if (!locationHeader) {
						throw new Error('The task was unable to be saved on the server.');
					}
					setEndpoint(locationHeader);
					setLockScriptId(true);
					break;
				case 200:
					// OK - existing task updated
					break;
				default:
					throw new Error(`Unexpected response status: ${response.status}`);
			}


			setResultSuccess(true);
			setPublishText('Update');

		} catch (error) {
			console.error('Error:', error);
			setResultSuccess(false);

			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';

			setErrorText(`An error occurred while publishing the task: ${errorMessage}`);
		} finally {
			setPublishInProgress(false);
		}
	}

	useEffect(() => {
		if (!resultSuccess === true) return;

		setResultPanel(
			<div style={taskLinkPanelStyle}>
				<div>Task published!</div>
				<button
					className="button button--secondary button--lg"
					onClick={() => window.open(publishUrl, '_blank', 'noopener,noreferrer')}>
					Visit your task's install page
				</button>

				<div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
					🔗{' '}
					<a href={publishUrl} target="_blank" rel="noopener noreferrer">
						{publishUrl}.
					</a>
				</div>
			</div>
		);

	}, [resultSuccess]);

	function validateTaskDefinition(taskDef: ITaskDraft): string {
		// Basic validation: check for required fields
		if (!taskDef.title) return "No title provided.";
		if (taskDef.description === undefined) return "No description provided.";
		if (!taskDef.script) return "No script provided.";
		if (taskDef.autoLock === undefined) return "Auto lock not defined.";
		if (taskDef.autoRunOnConnect === undefined) return "Auto run on connect not defined.";
		if (taskDef.autoRunPriority === undefined) return "Auto run priority not defined.";

		if (!JSON.parse(JSON.stringify(taskDef))) return "Invalid script.";

		return "";
	}

	return (
		<div className={styles.builder}>
			<div className={styles.grid}>
				<div className={styles.panel}>
					<div className={styles.field} style={{ maxWidth: '175px' }}>
						<label className={styles.row}></label>
						<label htmlFor="task-title">Callsign <span style={{ fontStyle: 'italic', fontWeight: 'normal' }}>optional</span></label>
						<input
							id="prefix"
							type="text"
							value={prefix}
							disabled={lockScriptId}
							onChange={(event) => onPrefixChanged(event.target.value)}
						/>
					</div>

					<button
						className="button button--primary button--lg"
						onClick={publishTask}
						disabled={publishInProgress}
					>
						{publishText} Task
					</button>
					{resultSuccess === false && <p style={errorStyle}>{errorText}</p>}
				</div>
				<div className={styles.panel}>
					{resultPanel}
				</div>
			</div>
		</div>

	);
}