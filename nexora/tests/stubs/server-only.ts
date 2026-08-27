// Empty stub used by Vitest via a resolve alias so that files starting with
// `import "server-only"` can be imported inside tests. The real `server-only`
// package throws when imported outside a Next.js Server Component context,
// which correctly guards the production build but breaks unit tests.
export {};
