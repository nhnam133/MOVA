import type { ComponentProps } from 'react';

/** Native navigation avoids the incompatible Vinext client-router chunk.
 * The browser owns history, modifier-click, downloads and authentication redirects.
 * Static assets remain cached between documents; cart state persists separately.
 */
export default function Link({ children, ...props }: ComponentProps<'a'>) {
  return <a {...props}>{children}</a>;
}
