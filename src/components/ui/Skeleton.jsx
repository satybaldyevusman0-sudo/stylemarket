// Loading skeleton UI
export function Skeleton({ w = '100%', h = 16, r = 8, className = '' }) {
  return <span className={`skeleton ${className}`} style={{ width: w, height: h, borderRadius: r }} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="card uni-card" aria-busy="true">
      <Skeleton h={150} r={0} />
      <div className="uni-card__body">
        <Skeleton w="70%" h={20} />
        <Skeleton w="40%" />
        <Skeleton h={48} />
        <Skeleton w="55%" h={28} />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return <div className="grid grid--cards">{Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}</div>;
}

export function DetailSkeleton() {
  return (
    <div className="container section" aria-busy="true">
      <Skeleton h={260} r={20} />
      <div className="detail-grid" style={{ marginTop: 24 }}>
        <div className="stack"><Skeleton w="60%" h={32} /><Skeleton h={90} /><Skeleton h={160} /></div>
        <div className="stack"><Skeleton h={220} r={16} /></div>
      </div>
    </div>
  );
}

export function RowsSkeleton({ rows = 5 }) {
  return <div className="stack">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={44} />)}</div>;
}
