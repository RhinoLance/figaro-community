import { useRef, useState, useEffect, useMemo, JSX } from "react";
import InstallTaskButton from "./InstallTaskButton";
import { ITaskDraft } from "../models/IFigaroTypes";
import { getEnvPaths } from "../models/Paths";
import styles from './TaskDefinitionBuilder.module.css';
import { Storage, StorageKeys } from "../models/Storage";

import {
	MaterialReactTable,
	useMaterialReactTable,
} from 'material-react-table';

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

	const generateLink = (id: string) => {
		
		const ftdUrl = `${paths.userScriptsApi}?id=${id}`;

		const url = `${paths.community}sharedTask/?` +
			`ftdPath=${encodeURIComponent(ftdUrl)}`;
		return url;
	}

	const columns = useMemo(
		() => [
			
			{
				accessorKey: 'link',
				header: 'Install page',
				muiTableHeadCellProps: { sx: { color: 'green' } }, //optional custom props
				Cell: ({ cell, row }) => <a href={cell.getValue()} target="_blank" rel="noopener noreferrer">{row.original.title}</a>,
			},
			{
				accessorKey: 'created',
				header: 'Created',
				muiTableHeadCellProps: { sx: { color: 'green' } }, //optional custom props
				Cell: ({ cell }) => <span>{cell.getValue()}</span>, //optional custom cell render
			},
			{
				accessorKey: 'modified',
				header: 'Last accessed',
				muiTableHeadCellProps: { sx: { color: 'green' } }, //optional custom props
				Cell: ({ cell }) => <span>{cell.getValue()}</span>, //optional custom cell render
			},

		],
		[],
	);

	const table = useMaterialReactTable({
		columns,
		data: resultList.map(item => ({
			title: item.document.title,
			created: new Date(item.created * 1000).toLocaleString(),
			modified: new Date(item.modified * 1000).toLocaleString(),
			link: generateLink(item.id),
		})),
		enableKeyboardShortcuts: false,
		enableColumnActions: false,
		enableColumnFilters: false,
		enablePagination: false,
		enableSorting: false,
	});



	function onPrefixChanged(value: string) {
		setPrefix(value);
		Storage.set(StorageKeys.UserCallsign, value);
	}

	async function onSearchClicked() {

		const trimmedPrefix = prefix.trim();

		if (!trimmedPrefix) {
			setErrorText("Please enter a callsign prefix to search for.");
			setResultSuccess(false);
			return;
		}

		const searchUrl = `${paths.userScriptsApi}?prefix=${trimmedPrefix}`;
		const result = await fetch(searchUrl);

		if (!result.ok) {
			setErrorText(`Search failed with status ${result.status}`);
			setResultSuccess(false);
			setResultList([]);
			return;
		}

		const resultData = await result.json();

		if (resultData.length === 0) {
			setErrorText(`No tasks found with prefix "${trimmedPrefix}".`);
			setResultSuccess(false);
			setResultList([]);
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


		{
		resultSuccess === true && <p style={{ margin: '2em 0' }}>
			<MaterialReactTable table={table} />
		</p>}

		</div>

	);
}