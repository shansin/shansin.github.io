'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Oops!
      </h1>
      <p className={styles.message}>
        Something went wrong. Don&apos;t worry, it&apos;s not you—it&apos;s us.
      </p>
      <div className={styles.buttonGroup}>
        <button
          onClick={reset}
          className={styles.tryButton}
        >
          Try again
        </button>
        <Link
          href="/"
          className={styles.homeButton}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
