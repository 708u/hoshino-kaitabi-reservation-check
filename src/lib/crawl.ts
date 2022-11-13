import { Option } from "@/lib/commandline.ts";
import { Kai, kaiTabiUrls } from "@/lib/kai.ts";
import { sendMessage } from "@/lib/slack.ts";
import { cyan, gray } from "https://deno.land/std@0.163.0/fmt/colors.ts";
import { join } from "https://deno.land/std@0.163.0/path/mod.ts";
import puppeteer, { Page } from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

export const crawlReservableKaiExists = async (
  option: Option,
  outDir: string
): Promise<void> => {
  const browser = await puppeteer.launch();
  const finishCrawl = async (page: Page, filename: string): Promise<void> => {
    await page.screenshot({
      path: join(outDir, `${filename}.png`),
    });
    await page.close();
  };

  const crawl = async (key: Kai): Promise<string> => {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 1500,
    });
    const kaiInfo = kaiTabiUrls[key];
    await page.goto(kaiInfo.url);
    try {
      // wait until reserved dialog appears.
      await page.waitForSelector(".v-stack-dialog__content", { timeout: 2000 });
      if (option.verbose) {
        console.log(gray(`${kaiInfo.name} is not available...`));
      }
      await finishCrawl(page, `${key}_reserved`);
      return "";
    } catch (_) {
      // Do nothing because catch error means reservation is available.
    }
    const calenders = await page.$$(".c-calendar");
    let reservableCounts = 0;
    for (const calender of calenders) {
      const triangles = await calender.$$(
        ".content > div > .calender-cell > .triangle"
      );
      reservableCounts += triangles.length;
    }

    if (reservableCounts === 0 && option.verbose) {
      console.log(gray(`${kaiInfo.name} is not available...`));
      await finishCrawl(page, `${key}_reserved`);
      return "";
    }

    const msg = `${kaiInfo.name} is available! reservable counts: ${reservableCounts} url: ${kaiInfo.url}`;
    console.log(cyan(msg));
    await page.screenshot({
      path: join(outDir, `${key}.png`),
    });
    await page.close();
    return msg;
  };

  const reservableKaiMessages: string[] = [];
  for (const key of option.targetReservations) {
    const slackMessage = await crawl(key);
    if (slackMessage !== "") reservableKaiMessages.push(slackMessage);
  }

  // TODO: add result object and move to main.ts
  if (option.sendNotificationEnabled && reservableKaiMessages.length > 0) {
    console.log("send result to slack");
    await sendMessage(reservableKaiMessages.join("\n"));
  }
};
