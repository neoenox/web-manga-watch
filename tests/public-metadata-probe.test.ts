import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  hasNewLatestEpisode,
  parseSundayWebryPublicMetadata,
  findSundayWebryLatestEpisodeUrl,
} from "../src/prototypes/sunday-webry-public-metadata.js";

async function fixture(name: string): Promise<string> {
  return readFile(resolve("tests/fixtures/sunday-webry", `${name}.html`), "utf8");
}

describe("Sunday Webry public metadata probe", () => {
  it("finds the official latest episode URL from the public series listing", async () => {
    const url = findSundayWebryLatestEpisodeUrl(
      await fixture("series-list"),
      "ふたりバス",
    );

    expect(url).toBe("https://www.sunday-webry.com/episode/2551460909779976003");
  });

  it("rejects non-official or unsafe episode links", () => {
    const candidate = (href: string) =>
      `<a href="${href}">ふたりバス</a>`;

    for (const href of [
      "https://example.com/episode/123",
      "//example.com/episode/123",
      "http://www.sunday-webry.com/episode/123",
      "https://www.sunday-webry.com.evil.example/episode/123",
      "javascript:/episode/123",
      "https://www.sunday-webry.com/not-an-episode/123",
    ]) {
      expect(findSundayWebryLatestEpisodeUrl(candidate(href), "ふたりバス")).toBeNull();
    }
    expect(
      findSundayWebryLatestEpisodeUrl(candidate("/episode/123"), "ふたりバス"),
    ).toBe("https://www.sunday-webry.com/episode/123");
  });

  it("keeps only public metadata", async () => {
    const metadata = parseSundayWebryPublicMetadata(
      await fixture("normal"),
      "https://www.sunday-webry.com/episode/12207421984160920209",
      "sunday-webry:ふたりバス",
    );

    expect(metadata).toEqual({
      seriesKey: "sunday-webry:ふたりバス",
      episodeKey: "sunday-webry:12207421984160920209",
      episodeLabel: "第42話",
      publishedAt: "2026-08-31",
      officialUrl: "https://www.sunday-webry.com/episode/12207421984160920209",
    });
  });

  it("detects a new episode only when the source key changes", () => {
    expect(hasNewLatestEpisode("sunday-webry:old", "sunday-webry:new")).toBe(true);
    expect(hasNewLatestEpisode("sunday-webry:same", "sunday-webry:same")).toBe(false);
  });
});
