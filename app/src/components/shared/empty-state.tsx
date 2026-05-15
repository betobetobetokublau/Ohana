interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-surface border border-line rounded-md p-8 text-center">
      <p className="font-serif italic font-light text-lg text-ink">{title}</p>
      {description && (
        <p className="italic-serif text-[14px] mt-2 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
