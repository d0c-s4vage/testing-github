import React from 'react';
import Link from 'next/link';

import styles from './layout.module.css';

export function PageBody({children}: React.PropsWithChildren): React.ReactElement {
  return <main className={styles.pageBody}>
    {children}
  </main>;
}

export function PageHeader(): React.ReactElement {
  return <div className={styles.pageHeader}>
    <div className={styles.pageHeaderLeft}>
      <Link href="/">Items</Link>
      <Link href="/decisions">Decisions</Link>
    </div>
    <div className={styles.pageHeaderRight}>
      Menu
    </div>
  </div>;
}

export function PageFooter(): React.ReactElement {
  return <div className={styles.pageFooter}></div>;
}
