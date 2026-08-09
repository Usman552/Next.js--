export default function Skills() {
  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Firebase",
  ];

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold mb-10">
        My Skills
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {skills.map((skill) => (
          <div
            key={skill}
            className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center"
          >
            {skill}
          </div>
        ))}
      </div>
    </main>
  );
}