import { parseArgs } from "@/lib/commandline.ts";
import { SLACK_WEBHOOK_URL } from "@/lib/environment.ts";
import { kaiTabiUrls } from "@/lib/kai.ts";
import { format } from "https://deno.land/std@0.163.0/datetime/mod.ts";
import { parse } from "https://deno.land/std@0.163.0/flags/mod.ts";
import { cyan, gray } from "https://deno.land/std@0.163.0/fmt/colors.ts";
import { ensureDir } from "https://deno.land/std@0.163.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.163.0/path/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

(async () => {
  console.log("start");
  const option = parseArgs(parse(Deno.args));

  if (option.sendNotificationEnabled) {
    if (SLACK_WEBHOOK_URL === "") {
      throw new Error(
        "$HOSHINO_KAITABI_RESERVATION_SLACK_WEBHOOK_URL must be set if --send-notification enabled"
      );
    }
  }

  const outDir = join(
    option.outDirBase,
    "screenshot",
    format(new Date(), "yyyyMMddHHmmss")
  );
  ensureDir(outDir);

  const reservableKais: string[] = [];
  const browser = await puppeteer.launch();
  for (const key in kaiTabiUrls) {
    if (
      option.targetReservations.length > 0 &&
      !option.targetReservations.includes(key)
    ) {
      continue;
    }

    const page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 1500,
    });
    const kaiInfo = kaiTabiUrls[key];
    await page.goto(kaiInfo.url);
    let screenshotName = key;
    try {
      // wait until reserved dialog appears.
      await page.waitForSelector(".v-stack-dialog__content", { timeout: 2000 });
      if (option.verbose) {
        console.log(gray(`${kaiInfo.name} is not available...`));
      }
      screenshotName = `${screenshotName}_reserved`;
    } catch (_) {
      // catch error means reservation is available because reserved dialog is not appeared.
      const msg = `${kaiInfo.name} is available! url: ${kaiInfo.url}`;
      console.log(cyan(msg));
      screenshotName = `${screenshotName}_ok`;
      reservableKais.push(msg);
    }

    await page.screenshot({
      path: join(outDir, `${screenshotName}.png`),
    });
    await page.close();
  }

  await browser.close();

  if (option.sendNotificationEnabled) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify({ text: reservableKais.join("\n") }),
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  console.log("done.");
})();
