import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Internal paths ("/proyectos/...", "/#videos") go through next/link so they
 * get the deploy base path; external URLs open in a new tab.
 */
export function SmartLink({ href, children, ...rest }: { href: string; children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) return <Link href={href} {...rest}>{children}</Link>;
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <span className="sr-only"> (se abre en otra pestaña)</span>
      </a>
    );
  }
  return <a href={href} {...rest}>{children}</a>;
}
