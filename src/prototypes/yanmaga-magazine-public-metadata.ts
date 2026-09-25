import { load } from "cheerio";

export type YanmagaMagazineProbeResult =
  | {
      status: "ok";
      seriesTitle: string;
      authorName: string;
      episodeTitle: string;
      publishedAt: string;
      episodeKey: string;
      officialUrl: string;
    }
  | {
      status: "failure";
      reason: "target_not_found" | "missing_metadata" | "unexpected_link_host";
    };

function normalizeDate(value: string): string | null {
  const match = value.trim().match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export function probeYanmagaMagazine(
  html: string,
  targetSeriesTitle: string,
): YanmagaMagazineProbeResult {
  const $ = load(html);
  const item = $("li.epThumb")
    .filter((_, element) => $(element).find("h3").first().text().trim() === targetSeriesTitle)
    .first();

  if (!item.length) return { status: "failure", reason: "target_not_found" };

  const link = item.find("a[href]").first().attr("href");
  const episodeTitle = item.find(".subTtl").first().text().trim();
  const publishedAt = normalizeDate(item.find(".updateDT").first().text());
  const authorName = item.find(".author").first().text().trim();
  if (!link || !episodeTitle || !publishedAt || !authorName) {
    return { status: "failure", reason: "missing_metadata" };
  }

  const url = new URL(link, "https://magazine.yanmaga.jp/");
  if (url.hostname !== "comic-days.com") {
    return { status: "failure", reason: "unexpected_link_host" };
  }

  const episodeId = url.pathname.match(/^\/episode\/(\d+)$/)?.[1];
  if (!episodeId) return { status: "failure", reason: "missing_metadata" };

  return {
    status: "ok",
    seriesTitle: targetSeriesTitle,
    authorName,
    episodeTitle,
    publishedAt,
    episodeKey: `yanmaga-magazine:${episodeId}`,
    officialUrl: url.toString(),
  };
}
