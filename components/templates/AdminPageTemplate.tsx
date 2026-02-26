import { ReactNode } from 'react';

type AdminPageTemplateProps = {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function AdminPageTemplate({ children, title, description, actions }: AdminPageTemplateProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
