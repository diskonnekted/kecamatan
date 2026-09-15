/**
 * Komponen grafik ringan untuk halaman analitik — CSS murni (inline style),
 * tanpa library chart dan tanpa JS klien. Aman untuk server component.
 */

export const CHART_PALETTE = [
  '#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2',
  '#db2777', '#65a30d', '#ea580c', '#4f46e5', '#0d9488', '#b45309',
  '#9333ea', '#64748b',
];

export function fmtNum(n: number): string {
  return n.toLocaleString('id-ID');
}

export function BarList({
  rows,
  color = 'var(--color-primary)',
  maxRows,
}: {
  rows: { label: string; value: number }[];
  color?: string;
  maxRows?: number;
}) {
  const data = (maxRows ? rows.slice(0, maxRows) : rows).filter((r) => r.value > 0);
  if (data.length === 0) return null;
  const max = Math.max(...data.map((r) => r.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {data.map((r) => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.label}
            </span>
            <span style={{ color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {fmtNum(r.value)}
            </span>
          </div>
          <div style={{ height: '0.5rem', borderRadius: '9999px', background: 'var(--color-muted)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.max(2, Math.round((r.value / max) * 100))}%`,
                background: color,
                borderRadius: '9999px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ rows, size = 150 }: { rows: { label: string; value: number }[]; size?: number }) {
  const data = rows.filter((r) => r.value > 0);
  const total = data.reduce((s, r) => s + r.value, 0);
  if (total === 0) return null;
  let acc = 0;
  const stops = data.map((r, i) => {
    const from = (acc / total) * 360;
    acc += r.value;
    const to = (acc / total) * 360;
    return `${CHART_PALETTE[i % CHART_PALETTE.length]} ${from}deg ${to}deg`;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
      <div
        role="img"
        aria-label={data.map((r) => `${r.label} ${fmtNum(r.value)}`).join(', ')}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${stops.join(', ')})`,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '22%',
            borderRadius: '50%',
            background: 'var(--color-card, #fff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)', fontVariantNumeric: 'tabular-nums' }}>
            {fmtNum(total)}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted-foreground)' }}>total</span>
        </div>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '10rem' }}>
        {data.map((r, i) => (
          <li key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
            <span
              style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '0.2rem',
                background: CHART_PALETTE[i % CHART_PALETTE.length],
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'var(--color-foreground)', flex: 1 }}>{r.label}</span>
            <span style={{ color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtNum(r.value)} ({Math.round((r.value / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pyramid({ rows }: { rows: { label: string; laki: number; perempuan: number }[] }) {
  const data = rows.filter((r) => r.laki > 0 || r.perempuan > 0);
  if (data.length === 0) return null;
  const max = Math.max(...data.map((r) => Math.max(r.laki, r.perempuan)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 5.5rem 1fr', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
        <span style={{ textAlign: 'right' }}>Laki-laki</span>
        <span style={{ textAlign: 'center' }}>Umur</span>
        <span>Perempuan</span>
      </div>
      {data.map((r) => (
        <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '1fr 5.5rem 1fr', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtNum(r.laki)}
            </span>
            <div style={{ height: '0.85rem', width: `${Math.max(2, Math.round((r.laki / max) * 100))}%`, maxWidth: '100%', background: '#2563eb', borderRadius: '0.25rem 0 0 0.25rem' }} />
          </div>
          <span
            title={r.label}
            style={{ textAlign: 'center', fontSize: '0.6875rem', fontWeight: 600, lineHeight: 1.15, color: 'var(--color-foreground)', overflowWrap: 'anywhere', minWidth: 0 }}
          >
            {r.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ height: '0.85rem', width: `${Math.max(2, Math.round((r.perempuan / max) * 100))}%`, maxWidth: '100%', background: '#db2777', borderRadius: '0 0.25rem 0.25rem 0' }} />
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted-foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {fmtNum(r.perempuan)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
