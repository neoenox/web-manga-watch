import { load } from "cheerio";

export type SundayWebryEpisode = {
  sourceEpisodeKey: string;
  title: string;
  episodeLabel: string | null;
  episodeNumbers: number[];
  publishedAt: string;
  officialUrl: string;
  seriesTitle: string;
  authorName: string;
  isPromotional: boolean;
  isClosed: boolean;
};

const PROMOTIONAL_WORDS = /単行本|PR|キャンペーン|投票|お知らせ/i;
const EPISODE_NUMBER = /第\s*(\d+)\s*話/g;

function firstText($: ReturnType<typeof load>, selector: string): string {
  return $(selector).first().text().trim();
}

function extractPublishedAt($: ReturnType<typeof load>): string {
  const datetime = $("time[datetime]").first().attr("datetime")?.trim();
  if (datetime) return datetime;

  const text = firstText($, ".episode-header-date, .episode-date");
  const match = text.match(/(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export function parseSundayWebryEpisode(
  html: string,
  officialUrl: string,
): SundayWebryEpisode | null {
  const episodeId = officialUrl.match(/\/episode\/(\d+)/)?.[1];
  if (!episodeId) return null;

  const $ = load(html);
  const title = firstText($, ".episode-header-title, .episode-title");
  if (!title || PROMOTIONAL_WORDS.test(title)) return null;

  const episodeNumbers = [...title.matchAll(EPISODE_NUMBER)].map((match) =>
    Number(match[1]),
  );
  const episodeLabel = episodeNumbers.length
    ? episodeNumbers.map((number) => `第${number}話`).join(" / ")
    : null;
  const publishedAt = extractPublishedAt($);

  return {
    sourceEpisodeKey: `sunday-webry:${episodeId}`,
    title,
    episodeLabel,
    episodeNumbers,
    publishedAt,
    officialUrl,
    seriesTitle: firstText($, ".series-header-title, .series-title"),
    authorName: firstText($, ".series-header-author, .author-name"),
    isPromotional: false,
    isClosed: $("main").text().includes("公開は終了しました"),
  };
}
