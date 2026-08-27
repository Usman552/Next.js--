import * as React from "react";

type SvgProps = React.SVGProps<SVGSVGElement>;

export function GithubIcon(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.57.11.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.78 1.05.78 2.12 0 1.53-.01 2.77-.01 3.14 0 .3.21.67.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function XIcon(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2H21.5l-7.53 8.61L22.75 22h-6.99l-5.47-6.7L3.94 22H.68l8.06-9.21L1.25 2h7.15l4.94 6.14L18.244 2Zm-1.22 18h1.87L7.06 4H5.1l11.924 16Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05a4.17 4.17 0 0 1 3.75-2.05C21.6 8.65 22 11 22 14.25V21h-4v-6c0-1.44-.03-3.3-2.02-3.3-2.03 0-2.34 1.58-2.34 3.2V21h-4V9Z" />
    </svg>
  );
}

export function YoutubeIcon(props: SvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M23.5 6.6a3.02 3.02 0 0 0-2.13-2.14C19.5 4 12 4 12 4s-7.5 0-9.37.46A3.02 3.02 0 0 0 .5 6.6C.04 8.48 0 12 0 12s.04 3.52.5 5.4a3.02 3.02 0 0 0 2.13 2.14C4.5 20 12 20 12 20s7.5 0 9.37-.46a3.02 3.02 0 0 0 2.13-2.14c.46-1.88.5-5.4.5-5.4s-.04-3.52-.5-5.4ZM9.6 15.57V8.43L15.82 12 9.6 15.57Z" />
    </svg>
  );
}
