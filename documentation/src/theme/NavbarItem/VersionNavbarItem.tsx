import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import pkg from '@site/package.json';

export default function VersionNavbarItem(props: any): ReactNode {
  const version = pkg.version;

  return (
    <div className={clsx('navbar-item', 'version-navbar-item')}
      {...props}
    >
		v{version}
    </div>
);
}
