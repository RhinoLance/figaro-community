import React from 'react';
import clsx from 'clsx';
import { getEnvPaths } from '../models/Paths';
import styles from './InstallTaskButton.module.css';

export default function InstallTaskButton({
	ftdFileName,
	className,
}) {
	const envPaths = getEnvPaths();
	const ftdPath = envPaths.repo + ftdFileName;



	if (!ftdPath) {
		return null;
	}

	const installTask = () => {
		if (typeof window === 'undefined') {
			return;
		}

		const isAndroid =
			typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
		const urlPrefix = isAndroid ? `${envPaths.app}://open?` : `${envPaths.figaro}?`;
		const installUrl = `${urlPrefix}INSTALL_TASK=${encodeURIComponent(ftdPath)}`;

		window.open(installUrl, 'figaro:app');
	};

	return (
		<div className={clsx(styles.container, className)}>
			<button
				type="button"
				className="button button--primary"
				onClick={installTask}>
				Install
			</button>

			<div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
				🔗{' '}
				<a href={ftdPath} target="_blank" rel="noopener noreferrer">
					{ftdFileName}
				</a>
			</div>
		</div>
	);
}