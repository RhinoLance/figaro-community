import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  Img?: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
   title: 'Easy to Use',
    Img: 'img/3-tasks.png',
    description: (
      <>
        Simple, re-usable tasks are only a tap away, from setting the clock
		to checking your SWR.  Access pre-built tasks from the 
		community library, or create your own with the built-in scripting 
		engine.
      </>
    ),
  },
  {
    title: 'Customizable',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Figaro uses provides a simple scripting engine with JavaScript, allowing 
		you to create tasks which are as simple or complex as you need.  And 
		when you've created something cool, share it with the community!
      </>
    ),
  },
  {
    title: 'Unlock the power',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Unlock the power of your QMX, especially for field users with where 
		speed and simplicity are key.
      </>
    ),
  },
];

function Feature({title, Svg, Img, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {/* <img width="200"src={Img} /> */}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
