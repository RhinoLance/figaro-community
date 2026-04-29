import React, { useEffect, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { getEnvPaths } from '../models/Paths';

export default function RemoteCode({ scriptLibraryFile: scriptFileName, language = 'text' }) {
	const [text, setText] = useState('');
	const fullPath = getEnvPaths().repo + scriptFileName;

	useEffect(() => {
		fetch(fullPath)
			.then(r => r.text())
			.then(setText);
	}, []);

	const srcLink = fullPath.replace('raw.githubusercontent.com', 'github.com').replace('/refs/heads/', '/blob/');

	return (
		<div style={{ marginBottom: '1rem' }}>
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