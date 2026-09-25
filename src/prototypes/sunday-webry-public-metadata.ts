import { load } from "cheerio";
import { parseSundayWebryEpisode } from "../adapters/sunday-webry.js";

export type SundayWebryPublicMetadata = {
  seriesKey: string;
  episodeKey: string;
  episodeLabel: string | null;
  publishedAt: string;
  officialUrl: string;
};

const BASE_URL = "https://www.sunday-webry.com";

export function findSundayWebryLatestEpisodeUrl(
  html: string,
  seriesTitle: string,
): string | null {
  const $ = load(html);
  const card = $("a[href*='/episode/']")
    .filter((_, element) => {
      const text = $(element).text();
      const alt = $(element).find("img").attr("alt") ?? "";
      return text.includes(seriesTitle) || alt === seriesTitle;
    })
    .first();
  const href = card.attr("href");
  return href ? new URL(href, BASE_URL).toString() : null;
}

export function parseSundayWebryPublicMetadata(
  html: string,
  officialUrl: string,
  seriesKey: string,
): SundayWebryPublicMetadata | null {
  const episode = parseSundayWebryEpisode(html, officialUrl);
  if (!episode) return null;

  return {
    seriesKey,
    episodeKey: episode.sourceEpisodeKey,
    episodeLabel: episode.episodeLabel,
    publishedAt: episode.publishedAt,
    officialUrl: episode.officialUrl,
  };
}

export function hasNewLatestEpisode(
  previousEpisodeKey: string | null,
  currentEpisodeKey: string | null,
): boolean {
  return Boolean(currentEpisodeKey && currentEpisodeKey !== previousEpisodeKey);
}
