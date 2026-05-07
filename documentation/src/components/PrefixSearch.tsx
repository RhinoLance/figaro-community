import { useRef, useState, useEffect, useMemo, JSX } from "react";
import InstallTaskButton from "./InstallTaskButton";
import { ITaskDraft } from "../models/IFigaroTypes";
import { getEnvPaths } from "../models/Paths";
import styles from './TaskDefinitionBuilder.module.css';
import { Storage, StorageKeys } from "../models/Storage";

interface ITaskPublisherProps {
	taskDefinition: ITaskDraft;
}

interface ISearchResultItem {
	id: string;
	created: number;
	modified: number;
	document: ITaskDraft;
}

export default function PrefixSearch({
	taskDefinition
}: ITaskPublisherProps) {


	const paths = getEnvPaths();

	const errorStyle = { color: 'var(--ifm-color-danger)', fontWeight: 'bold' };

	const [prefix, setPrefix] = useState<string>(
		Storage.get(StorageKeys.UserCallsign) || ''
	);
	const [resultSuccess, setResultSuccess] = useState<boolean | null>(null);
	const [errorText, setErrorText] = useState<string>('');
	const [searchInProgress, setSearchInProgress] = useState<boolean>(false);
	const [resultList, setResultList] = useState<ISearchResultItem[]>([]);
	
	
	function onPrefixChanged(value: string) {
		setPrefix(value);
		Storage.set(StorageKeys.UserCallsign, value);
	}

	async function onSearchClicked() {
		
		prefix = prefix.trim();

		if (!prefix) {
			setErrorText("Please enter a callsign prefix to search for.");
			setResultSuccess(false);
			return;
		}

		const searchUrl = `${paths.userScriptsApi}?prefix=${prefix}`;
		const result = await fetch(searchUrl);

		if (!result.ok) {
			setErrorText(`Search failed with status ${result.status}`);
			setResultSuccess(false);
			return;
		}

		const resultData = await result.json();

		if (resultData.length === 0) {
			setErrorText(`No tasks found with prefix "${prefix}".`);
			setResultSuccess(false);
			return;
		}

		setResultList(resultData);

		setResultSuccess(true);

	};

	return (
		
			<div>
				
					<div className={styles.field} style={{ maxWidth: '175px' }}>
						<label className={styles.row}></label>
						<label htmlFor="task-title">Callsign</label>
						<input
							id="prefix"
							type="text"
							value={prefix}
							onChange={(event) => onPrefixChanged(event.target.value)}
						/>
					</div>

					<button
						className="button button--primary button--lg"
						onClick={onSearchClicked}
						disabled={searchInProgress}
					>
						Search Tasks
					</button>
					{resultSuccess === false && <p style={errorStyle}>{errorText}</p>}
				
			
		</div>

	);
}