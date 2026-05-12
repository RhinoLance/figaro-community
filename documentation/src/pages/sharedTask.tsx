import { useEffect, useState } from "react";

import RemoteCode from '@site/src/components/RemoteCode';
import ScriptPageHeader from '@site/src/components/ScriptPageHeader';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Layout from '@theme/Layout';
import { ITaskDraft } from "../models/IFigaroTypes";

function Invalid({ message }: { message: string }) {
	return (
		<Layout >
			<div style={{ margin: '2em', padding: '1em', border: '1px solid #ccc', borderRadius: '8px' }}>
				<h2 style={{ color: '#c00' }}>The task could not be loaded.</h2>
				<p>{message}</p>
			</div>
		</Layout>
	);	
}

export default function Content({ }) {

	const [ftd, setFtd] = useState<ITaskDraft>({
		title: 'Fetching task definition ...',
		description: '',
		script: '',
		autoRunOnConnect: false,
		autoRunPriority: 0,
		autoLock: false,
		runLocked: false
	});

	const [errorMessage, setErrorMessage] = useState<string>("");
	const [ftdPath, setFtdPath] = useState<string>("");
	
	useEffect(() => {

		(async () => {
			const params = new URLSearchParams(window.location.search);
			const ftdPath = params.get('ftdPath');

			if (!ftdPath) {
				setErrorMessage("No Figaro Task Definition path provided.");
				return;
			}

			setFtdPath(ftdPath);

			try {
				const response = await fetch(ftdPath);
				const ftdObj = await response.json();
				setFtd(ftdObj);
			} catch (error) {
				setErrorMessage("Failed to load Figaro Task Definition.");
			}
		})();

	}, []);
	
	if (errorMessage) {
		return <Invalid message={errorMessage} />;
	}
	
	return (
		<Layout>
			<ScriptPageHeader
				header="Self Published User Script"
				title={ftd.title}
				summary={ftd.description}
				installLabel={`Install ${ftd.title}`}
				ftdFileName={ftdPath}
				style={{ padding: '2em 3em' }}
			/>
			
			<div style={{ margin: '0 3em' }}>

				<p>
					<span style={{ 
						fontSize: '1.2rem', 
						color: 'rgb(255, 153, 0)',
						fontWeight: 'bold'
					}}>
						Exercise Caution
					</span>:  This script was self-published by a community member 
					and has not been reviewed by the Figaro team.  Please review 
					the script before installing.
				</p>
				<p>
					To learn more about sharing your own Figaro 
					tasks, review 
					 the <a href="/docs/community/contributing#automation-tasks"> 
					"Contributing" page</a>.
				</p>

			
				<RemoteCode 
					style={{ marginTop: '2em' }}
					language="js" 
					scriptLibraryFile={ftdPath}
					format="json" />
			</div>
		</Layout>
	);
}