import { FiSearch } from "react-icons/fi";
const Hero = () => {
  return (
    <section className="relative min-h-[500px] overflow-hidden bg-[#111415] text-white">
      {/* Background blur effects */}
      <div className="absolute inset-0">
        <div className="absolute left-[15%] top-[30%] h-40 w-40 rounded-full bg-orange-900/20 blur-[100px]" />
        <div className="absolute right-[20%] top-[20%] h-52 w-52 rounded-full bg-teal-900/20 blur-[120px]" />
        <div className="absolute bottom-0 left-[45%] h-40 w-40 rounded-full bg-yellow-900/20 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        {/* Heading */}
        <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          Find Your Dream Job Today!
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm text-gray-300 sm:text-base">
          Connecting Talent with Opportunity: Your Gateway to Career Success
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white text-gray-700 shadow-xl md:flex-row">
          {/* Job Input */}
          <div className="flex flex-1 items-center px-6 py-4">
            <input
              type="text"
              placeholder="Job Title or Company"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Location */}
          <div className="border-t border-gray-200 md:border-l md:border-t-0">
            <select className="h-full w-full bg-white px-2 py-4 text-sm text-gray-500 outline-none md:w-40 cursor-pointer ">
              <option>Select Location</option>
              <option>Pakistan</option>
              <option>Remote</option>
              <option>USA</option>
              <option>UK</option>
            </select>
          </div>

          {/* Category */}
          <div className="border-t border-gray-200 md:border-l md:border-t-0 cursor-pointer ">
            <select className="h-full w-full bg-white px-2 py-4 text-sm text-gray-500 outline-none md:w-40 cursor-pointer ">
              <option>Select Category</option>
              <option>Development</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>Finance</option>
            </select>
          </div>

          {/* Search Button */}
          <button className="flex items-center cursor-pointer justify-center gap-2 bg-teal-600 px-7 py-4 text-sm font-medium text-white transition hover:bg-teal-700">
            <FiSearch size={16} />
            Search Job
          </button>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-10 sm:gap-16">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600">
              💼
            </div>

            <div className="text-left">
              <p className="font-bold">25,850</p>
              <p className="text-xs text-gray-300">Jobs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600">
              👥
            </div>

            <div className="text-left">
              <p className="font-bold">10,250</p>
              <p className="text-xs text-gray-300">Candidates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600">
              🏢
            </div>

            <div className="text-left">
              <p className="font-bold">18,400</p>
              <p className="text-xs text-gray-300">Companies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
