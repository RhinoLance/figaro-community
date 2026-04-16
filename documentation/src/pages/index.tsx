import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/tutorial/intro">
            Figaro Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Figaro is a task automation tool for QMX equipped ham radio operators.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />

		<hr></hr>

		<div style={{textAlign: 'center', margin: '3em'}}>
		  <Heading as="h2">The story behind Figaro</Heading>
		  <p>
			Read the story behind how Figaro came to be, and the vision for the future of the project.
		  </p>
		  <Link
			className="button button--primary button--lg"
			to="story">
			Read the Story
		  </Link>
		</div>
      </main>
    </Layout>
  );
}
