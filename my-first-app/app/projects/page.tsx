export default function Projects() {
  return (
    <main className="min-h-screen max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10">
        My Projects
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Todo App */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">
            Todo App
          </h2>

          <p className="text-gray-400 mb-5">
            Todo application built with React, TypeScript,
            Tailwind CSS and Firebase.
          </p>

          <a
            href="https://todo-app-2026-68fed.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            View Project
          </a>
        </div>

        {/* Expense Tracker */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">
            Expense Tracker
          </h2>

          <p className="text-gray-400 mb-5">
            Expense management application with Firebase integration.
          </p>

          <a
            href="#"
            className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            View Project
          </a>
        </div>

        {/* Portfolio */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">
            Next.js Portfolio
          </h2>

          <p className="text-gray-400 mb-5">
            Portfolio website built with Next.js, TypeScript
            and Tailwind CSS.
          </p>

          <a
            href="#"
            className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            View Project
          </a>
        </div>

      </div>
    </main>
  );
}