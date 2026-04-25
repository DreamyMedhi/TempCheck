import Sidebar from "./Sidebar";
import Toast from "./Toast";

export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div className="lg:flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 lg:sticky lg:top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl lg:text-[28px] leading-tight text-slate-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-wrap">{actions}</div>
            )}
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
      <Toast />
    </div>
  );
}
