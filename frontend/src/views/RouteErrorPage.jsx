import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../shared/ui';

function FallbackContent({
  title = 'Something went wrong',
  description = 'The page could not be loaded. Please go back or return home.',
  homePath = '/',
}) {
  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl border bg-white p-10 text-center shadow-sm">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-base text-gray-600">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="min-w-[120px]">
            <Link to={homePath}>Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorPage({ homePath = '/' }) {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <FallbackContent
        homePath={homePath}
        title={error.status === 404 ? 'Page not found' : 'Something went wrong'}
        description={
          error.status === 404
            ? 'We could not find the page you were looking for. Please use the back button or return home.'
            : error.statusText || 'An unexpected routing error occurred.'
        }
      />
    );
  }

  return (
    <FallbackContent
      homePath={homePath}
      description={error?.message || 'An unexpected error occurred while loading this page.'}
    />
  );
}

export function NotFoundPage({ homePath = '/', title = 'Page not found' }) {
  return (
    <FallbackContent
      homePath={homePath}
      title={title}
      description="The page you requested does not exist. Please go back or return to a known page."
    />
  );
}
//