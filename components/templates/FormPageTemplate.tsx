import { ReactNode } from 'react';

type FormPageTemplateProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

export function FormPageTemplate({ children, title, description }: FormPageTemplateProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="rounded-xl bg-white border border-gray-200 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
