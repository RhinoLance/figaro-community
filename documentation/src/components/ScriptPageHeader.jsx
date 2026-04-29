import React from 'react';
import InstallTaskButton from './InstallTaskButton';
import styles from './ScriptPageHeader.module.css';

export default function ScriptPageHeader({
  title,
  summary,
  installLabel,
  ftdFileName,
}) {
  return (
    <section className={styles.header}>
      <div className={styles.content}>
        <p className={styles.kicker}>Community Script</p>
        <h1 className={styles.title}>{title}</h1>
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </div>
      <div className={styles.actions}>
        <InstallTaskButton
          ftdFileName={ftdFileName}
          label={installLabel}
          className={styles.installButton}
        />
      </div>
    </section>
  );
}
