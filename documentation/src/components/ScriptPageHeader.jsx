import React from 'react';
import InstallTaskButton from './InstallTaskButton';

import styles from './ScriptPageHeader.module.css';

export default function ScriptPageHeader({
  header = "Community Script",
  title,
  summary,
  installLabel,
  ftdFileName,
  reqFirmware = "",
  style,
}) {
  return (
    <section className={styles.header} style={style}>
      <div className={styles.content}>
        <p className={styles.kicker}>{header}</p>
        <h1 className={styles.title}>{title}</h1>
        {summary ? <p className={styles.summary}>{summary}</p> : null}
	  </div>
      <div className={styles.actions}>
        <InstallTaskButton
          ftdFileName={ftdFileName}
          label={installLabel}
          className={styles.installButton}
		  showQrCode={true}
        />

		<div className={styles.firmware} title="Minimum required QMX firmware">
			{displayReqVersion(reqFirmware)}
		</div>
      </div>
    </section>
  );
}

function displayReqVersion(version) {
	if( version === "") return version;

	return `🏷️ ≥${version}`;
}
