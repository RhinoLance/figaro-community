import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  Img?: string;
  Video?: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
   title: 'Made for Field Ops, Useful for All',
    Img: 'img/Figaro-field.jpeg',
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
    title: 'Unlocking the Power',
    Video: 'video/qmx-scan-480.mp4',
    description: (
      <>
        Unlock the power of your QMX by adding new functionality, like
		scanning, frequency hopping, setting a fixed qqrp power output per band, 
		and more.  The possibilities are endless!
      </>
    ),
  },
  {
    title: 'A Platform for Hacking',
    Img: "img/vsCode.png",
    description: (
      <>
        Figaro's JavaScript engine is accessible to all.  Create tasks which are 
		as simple or complex as you need.  And when you've created something 
		cool, let the community see how far they can extend it!
      </>
    ),
  },
];

function Feature({title, Svg, Img, Video, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
	  <div className="text--center">
        {Img && <img width="300" src={Img} style={{borderRadius: '8px'}} />}
		{Video && <video width="335" src={Video} autoPlay loop muted playsInline style={{borderRadius: '8px'}} />}
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
