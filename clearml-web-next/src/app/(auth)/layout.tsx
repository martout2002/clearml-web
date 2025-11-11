import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - ClearML',
  description: 'Sign in to ClearML',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* ClearML Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            ClearML
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Machine Learning Operations Platform
          </p>
        </div>

        {/* Auth content */}
        {children}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} ClearML. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
