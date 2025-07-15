import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

interface LocationData {
  address: string;
  city: string;
  country: string;

}

interface IPInfoResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;

  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
}

const fallbackLocationData: LocationData = {
  address: "N/A",
  city: "Unknown City",
  country: "Unknown Country",

};

const isPrivateIP = (ip: string): boolean => {
  const privateRanges = [
    /^127\./,
    /^192\.168\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  return privateRanges.some((range) => range.test(ip));
};

const getClientIP = (req: NextApiRequest): string => {
  const possibleHeaders = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip",
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of possibleHeaders) {
    const headerValue = req.headers[header];
    if (headerValue) {
      const ip =
        typeof headerValue === "string"
          ? headerValue.split(",")[0].trim()
          : Array.isArray(headerValue)
          ? headerValue[0].trim()
          : "";

      if (ip && ip !== "unknown" && !isPrivateIP(ip)) {
        return ip;
      }
    }
  }

  interface ConnectionWithRemote {
    remoteAddress?: string;
  }

  const connection = req.connection as ConnectionWithRemote | undefined;
  const connectionIP =
    req.socket?.remoteAddress || connection?.remoteAddress || "";

  return connectionIP || "127.0.0.1";
};

const getLocationFromIP = async (ip: string): Promise<LocationData> => {
  try {
    const response = await axios.get<IPInfoResponse>(
      `https://ipinfo.io/${ip}/json`,
      {
        timeout: 5000,
      }
    );

    const { city, country,loc } = response.data;

    return {
      address: loc ?? fallbackLocationData.address,
      city: city ?? fallbackLocationData.city,
      country: country ?? fallbackLocationData.country,
    };
  } catch (error) {
    console.error("❌ Error fetching location:", error);
    return fallbackLocationData;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationData | { error: string }>
) {
  try {
    const ip = getClientIP(req);
    const location = await getLocationFromIP(ip);
    return res
      .status(200)
      .json({
        address: location.address,
        city: location.city,
        country: location.country,
      });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return res.status(500).json({ error: "Failed to get IP location" });
  }
}
