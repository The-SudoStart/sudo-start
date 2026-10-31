/**
 * A 3D cube with the logo's terminal icon on every face, tumbling while
 * something is working. `tone="root"` uses Root Magenta for the assistant.
 */
export function CubeLoader({
  size = 32,
  tone = 'bios',
  label = 'Loading',
}: {
  size?: number;
  tone?: 'bios' | 'root';
  label?: string;
}) {
  const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'] as const;
  return (
    <span
      className={`cube-scene cube-${tone}`}
      style={{ '--s': `${size}px` } as React.CSSProperties}
      role="img"
      aria-label={label}
    >
      <span className="cube">
        {faces.map((face, i) => (
          // Faces alternate solid and soft fills so the turn reads clearly.
          <span key={face} className={`cube-face cube-${face} ${i % 2 ? 'is-soft' : ''}`}>
            {/* The terminal icon from the logo */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 19h8" />
              <path d="m4 17 6-6-6-6" />
            </svg>
          </span>
        ))}
      </span>
    </span>
  );
}
