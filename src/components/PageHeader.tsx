'use client';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {title}
        </h1>
        {description && (
          <p className="text-sm mt-2 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
