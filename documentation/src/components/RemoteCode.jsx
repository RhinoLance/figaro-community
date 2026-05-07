import React, { useEffect, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { getEnvPaths } from '../models/Paths';

export default function RemoteCode({ 
	scriptLibraryFile: scriptFileName, 
	language = 'text',
	format="raw",
	style = {},
 }) {
	
	const [text, setText] = useState('');

	const path = scriptFileName.startsWith("http") 
			? scriptFileName
			: getEnvPaths().repo + scriptFileName;
	const fullPath = path;

	const retrieveText = async () => {
		const response = await fetch(fullPath);

		let srcText;

		switch (format) {
			case "json":
				srcText = (await response.json()).script;
				break;
			default:
				srcText = await response.text();
		}
		
		setText(srcText);
	};

	useEffect(() => {
		retrieveText();
	}, [scriptFileName, format, language]);

	const srcLink = fullPath.replace('raw.githubusercontent.com', 'github.com').replace('/refs/heads/', '/blob/');

	return (
		<div style={{ marginBottom: '1rem', ...style }}>
			<CodeBlock language={language}>{text}</CodeBlock>

			<div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
				🔗{' '}
				<a href={srcLink} target="_blank" rel="noopener noreferrer">
					{srcLink}.
				</a>
			</div>
		</div>
	
	);
}