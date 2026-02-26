import { ReactNode } from 'react';

type ItemDetailTemplateProps = {
  gallery: ReactNode;
  info: ReactNode;
};

export function ItemDetailTemplate({ gallery, info }: ItemDetailTemplateProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">{gallery}</div>
          <div className="mt-6 lg:mt-0 lg:col-span-2 lg:sticky lg:top-6 lg:self-start space-y-6">
            {info}
          </div>
        </div>
      </div>
    </main>
  );
}
