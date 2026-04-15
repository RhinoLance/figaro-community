import React, { useEffect, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';

export default function RemoteCode({ url, language = 'text' }) {
	const [text, setText] = useState('');

	useEffect(() => {
		fetch(url)
			.then(r => {
			return r.status === 404
				? fetch(url.replace('/main/', '/develop/'))
				: r;
			})
			.then(r => r.text())
			.then(setText);
	}, [url]);

	const srcLink = url.replace('raw.githubusercontent.com', 'github.com').replace('/refs/heads/', '/blob/');

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