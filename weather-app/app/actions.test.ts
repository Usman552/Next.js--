import { describe, it, expect, vi } from "vitest";
import { getWeatherData } from "./actions";

describe("getWeatherData", () => {
  it("returns weather data when API succeeds", async () => {
    const fakeWeatherData = {
      name: "Multan",
      main: {
        temp: 35,
        feels_like: 34,
        humidity: 40,
      },
      weather: [
        {
          icon: "01d",
          description: "clear sky",
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => fakeWeatherData,
      })
    );

    const result = await getWeatherData("Multan");

    expect(result).toEqual(fakeWeatherData);
  });

  it("returns null when API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("API failed"))
    );

    const result = await getWeatherData("Multan");

    expect(result).toBeNull();
  });
});