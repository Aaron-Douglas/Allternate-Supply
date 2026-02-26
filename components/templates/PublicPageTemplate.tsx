import { ReactNode } from 'react';

type PublicPageTemplateProps = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export function PublicPageTemplate({ children, title, description }: PublicPageTemplateProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h1>}
            {description && <p className="mt-1 text-gray-500">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
