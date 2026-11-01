"use client";

import { useEffect, useState } from "react";
import type { Courier, CourierLocation } from "./courier-types";

type Status = "idle" | "loading" | "ready" | "error";
type Cities = { key: string; values: string[]; status: Status };
type Offices = { key: string; values: CourierLocation[]; status: Status };

export function useCourierLocations(enabled: boolean, courier: Courier | "", city: string, attempt: number) {
  const [cities, setCities] = useState<Cities>({ key: "", values: [], status: "idle" });
  const [offices, setOffices] = useState<Offices>({ key: "", values: [], status: "idle" });
  const officeKey = `${courier}:${city}`;

  useEffect(() => {
    if (!enabled || !courier) return;
    const controller = new AbortController();
    setCities({ key: courier, values: [], status: "loading" });
    fetch(`/api/courier-locations?courier=${courier}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load cities");
        const data = await response.json() as { cities?: unknown };
        if (!Array.isArray(data.cities) || !data.cities.every((value: unknown) => typeof value === "string")) throw new Error("Invalid cities");
        if (!controller.signal.aborted) setCities({ key: courier, values: data.cities, status: "ready" });
      }).catch(() => {
        if (!controller.signal.aborted) setCities({ key: courier, values: [], status: "error" });
      });
    return () => controller.abort();
  }, [enabled, courier, attempt]);

  useEffect(() => {
    if (!enabled || !courier || !city) return;
    const controller = new AbortController();
    setOffices({ key: officeKey, values: [], status: "loading" });
    fetch(`/api/courier-locations?courier=${courier}&city=${encodeURIComponent(city)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load offices");
        const data = await response.json() as { locations?: unknown };
        if (!Array.isArray(data.locations)) throw new Error("Invalid offices");
        if (!controller.signal.aborted) setOffices({ key: officeKey, values: data.locations, status: "ready" });
      }).catch(() => {
        if (!controller.signal.aborted) setOffices({ key: officeKey, values: [], status: "error" });
      });
    return () => controller.abort();
  }, [enabled, courier, city, officeKey, attempt]);

  const cityStatus = cities.key === courier ? cities.status : "idle";
  const officeStatus = city && offices.key === officeKey ? offices.status : "idle";
  const status: Status = !enabled || !courier ? "idle"
    : cityStatus === "error" || officeStatus === "error" ? "error"
    : cityStatus === "loading" || officeStatus === "loading" ? "loading"
    : "ready";
  return {
    cities: enabled && cities.key === courier ? cities.values : [],
    locations: enabled && city && offices.key === officeKey ? offices.values : [],
    status,
  };
}
