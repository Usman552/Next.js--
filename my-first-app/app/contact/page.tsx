export default function Contact() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16">

      <div className="w-full max-w-lg">

        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          Contact Me
        </h1>

        <form className="space-y-5">

          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded bg-gray-900 border border-gray-700 outline-none"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded bg-gray-900 border border-gray-700 outline-none"
          />

          <textarea
            placeholder="Your Message"
            rows={5}
            className="w-full p-3 rounded bg-gray-900 border border-gray-700 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded hover:bg-blue-700"
          >
            Send Message
          </button>

        </form>

      </div>

    </main>
  );
}