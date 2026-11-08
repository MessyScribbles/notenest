interface TemplateCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function TemplateCard({ title, icon, onClick }: TemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center p-6 bg-surface border border-divider rounded-xl shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-200 gap-3"
    >
      <div className="p-3 rounded-lg bg-app text-muted group-hover:text-primary group-hover:bg-primary-light transition-colors duration-200">
        {icon}
      </div>
      <span className="text-sm font-medium text-main">{title}</span>
    </button>
  );
}