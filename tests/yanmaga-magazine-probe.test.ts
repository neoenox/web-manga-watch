import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { probeYanmagaMagazine } from "../src/prototypes/yanmaga-magazine-public-metadata.js";

async function fixture(name: string): Promise<string> {
  return readFile(resolve("tests/fixtures/yanmaga-magazine", `${name}.html`), "utf8");
}

describe("Yanmaga Magazine public metadata probe", () => {
  it("extracts metadata without fetching the Comic Days link", async () => {
    const result = probeYanmagaMagazine(await fixture("home"), "妹は知っている");

    expect(result).toEqual({
      status: "ok",
      seriesTitle: "妹は知っている",
      authorName: "雁木万里",
      episodeTitle: "第８６話　働く男",
      publishedAt: "2026-08-31",
      episodeKey: "yanmaga-magazine:12207421984151793511",
      officialUrl: "https://comic-days.com/episode/12207421984151793511",
    });
  });

  it("fails closed when the target work is not listed", async () => {
    const result = probeYanmagaMagazine(await fixture("home"), "存在しない作品");

    expect(result).toEqual({
      status: "failure",
      reason: "target_not_found",
    });
  });

  it("rejects non-Comic Days links instead of following them", async () => {
    const html = (await fixture("home")).replace(
      "https://comic-days.com/episode/12207421984151793511",
      "https://example.com/episode/1",
    );

    expect(probeYanmagaMagazine(html, "妹は知っている")).toEqual({
      status: "failure",
      reason: "unexpected_link_host",
    });
  });
});
