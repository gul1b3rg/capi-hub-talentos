import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerLinks?: {
    label: string;
    to: string;
  }[];
}

const AuthLayout = ({ title, subtitle, children, footerLinks = [] }: AuthLayoutProps) => (
  <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-gradient-to-b from-background to-white/70 px-4 py-12">
    <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/90 p-8 shadow-2xl backdrop-blur">
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Hub CAPI</p>
        <h1 className="mt-2 text-2xl font-semibold text-secondary">{title}</h1>
        <p className="mt-1 text-sm text-secondary/70">{subtitle}</p>
      </div>
      {children}
      {footerLinks.length > 0 && (
        <div className="mt-8 space-y-1 text-center text-sm">
          {footerLinks.map((item) => (
            <p key={item.to} className="text-secondary/70">
              {item.label}{' '}
              <Link to={item.to} className="font-semibold text-primary hover:underline">
                aquí
              </Link>
            </p>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default AuthLayout;
