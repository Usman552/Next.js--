"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getWeatherData } from "./actions";
import { useState } from "react";
import type { WeatherData } from "../types/weather";
import Image from "next/image";

function SubmitButton() {
  return (
    <Button type="submit">
      <Search />
    </Button>
  );
}

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const handleSearch = async (formData: FormData) => {
    const city = formData.get("city") as string;
    const data = await getWeatherData(city);
    setWeather(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-500 p-4 flex items-center justify-center flex-col">
      <div className="w-full max-w-md space-y-4">
        <form action={handleSearch} className="flex gap-2">
          <Input
            name="city"
            type="text"
            placeholder="Enter city Name ..."
            className="bg-white/90"
            required
          />

          <SubmitButton />
        </form>
      </div>
      {weather && (
        <div className="rounded-2xl bg-white/70 p-6 text-center shadow-xl w-full max-w-md my-4">
          <h2 className="text-3xl font-bold text-gray-800">{weather.name}</h2>

          <Image
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
            width={100}
            height={100}
            className="mx-auto"
          />

          <p className="text-5xl font-bold text-blue-600">
            {Math.round(weather.main.temp)}°C
          </p>

          <p className="mt-2 capitalize text-gray-600">
            {weather.weather[0].description}
          </p>

          <p className="mt-2 text-gray-600">
            Feels like {Math.round(weather.main.feels_like)}°C
          </p>

          <p className="text-gray-600">Humidity: {weather.main.humidity}%</p>
        </div>
      )}
    </div>
  );
}
