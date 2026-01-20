import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: 'var(--spacing-md)'
        }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold' }}>404</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>Page not found</p>
            <Link href="/" style={{
                color: 'var(--accent)',
                textDecoration: 'underline',
                fontSize: '1.2rem'
            }}>
                Return Home
            </Link>
        </div>
    );
}
