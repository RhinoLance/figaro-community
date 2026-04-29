import React, { useMemo, useState } from 'react';
import CodeBlock from '@theme/CodeBlock';
import styles from './TaskDefinitionBuilder.module.css';

const COLOR_OPTIONS = [
  '#D63031',
  '#F97316',
  '#F59E0B',
  '#22c55e',
  '#4DB6AC',
  '#2D3A8C',
  '#8b5cf6',
  '#ec4899',
];

export default function TaskDefinitionBuilder() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [script, setScript] = useState('');
  const [color, setColor] = useState('#22c55e');
  const [autoRunOnConnect, setAutoRunOnConnect] = useState(false);
  const [autoRunPriority, setAutoRunPriority] = useState(0);
  const [autoLock, setAutoLock] = useState(false);
  const [runLocked, setRunLocked] = useState(false);

  const taskDefinition = useMemo(() => {
    const task = {
      title,
      description,
      script,
      autoRunOnConnect,
      autoRunPriority,
      autoLock,
      runLocked,
    };

    if (color.trim()) {
      task.color = color;
    }

    return task;
  }, [title, description, script, color, autoRunOnConnect, autoRunPriority, autoLock, runLocked]);

  const taskDefinitionJson = useMemo(
    () => JSON.stringify(taskDefinition, null, 2),
    [taskDefinition]
  );

  const downloadFileName = useMemo(() => {
    const base = (title || 'figaro-task')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'figaro-task';

    return `${base}.json`;
  }, [title]);

  return (
    <div className={styles.builder}>
      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.field}>
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-description">Description</label>
            <input
              id="task-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Colour</label>
            <div className={styles.colorPalette}>
              {COLOR_OPTIONS.map((option) => {
                const selected = color.toLowerCase() === option.toLowerCase();

                return (
                  <button
                    key={option}
                    type="button"
                    className={styles.colorDot}
                    onClick={() => setColor(option)}
                    style={{
                      backgroundColor: option,
                      borderWidth: selected ? 0 : 2,
                      borderColor: '#f8fafc',
                    }}
                    aria-label={`Set task colour to ${option}`}
                    aria-pressed={selected}
                    title={option}
                  />
                );
              })}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="task-priority">Auto Run Priority</label>
            <input
              id="task-priority"
              type="number"
              value={autoRunPriority}
              onChange={(event) => setAutoRunPriority(Number(event.target.value) || 0)}
            />
          </div>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={autoRunOnConnect}
              onChange={(event) => setAutoRunOnConnect(event.target.checked)}
            />
            Auto Run On Connect
          </label>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={autoLock}
              onChange={(event) => setAutoLock(event.target.checked)}
            />
            Auto Lock
          </label>

          <label className={styles.row}>
            <input
              type="checkbox"
              checked={runLocked}
              onChange={(event) => setRunLocked(event.target.checked)}
            />
            Run Locked
          </label>
		  
		  <div className={styles.field}>
            <label htmlFor="task-script">Script</label>
            <textarea
              id="task-script"
              value={script}
              onChange={(event) => setScript(event.target.value)}
			  style={{ height: '200px' }}
            />
          </div>
        </div>

          

        <div className={styles.panel}>
          <div className={styles.codePreview}>
            <CodeBlock language="json">{taskDefinitionJson}</CodeBlock>
          </div>
          <a
            className={styles.downloadLink}
            href={`data:application/json;charset=utf-8,${encodeURIComponent(taskDefinitionJson)}`}
            download={downloadFileName}
          >
            Download JSON
          </a>
          <p className={styles.jsonHint}>
            This is the live JSON that can be saved as your FTD file.
          </p>
        </div>
      </div>
    </div>
  );
}
