export default function Home() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="text-center max-w-3xl">

        <p className="text-blue-400 text-base sm:text-lg mb-3">
          Hello, I am
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Usman Qasim
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6">
          Software Engineer & Web Developer
        </h2>

        <p className="text-gray-400 text-base sm:text-lg leading-7">
          I build modern and responsive web applications using
          React, Next.js, TypeScript and other modern technologies.
        </p>

      </div>
    </main>
  );
}