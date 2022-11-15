import { parseArgs } from "@/lib/commandline.ts";
import { crawlReservableKaiExists } from "@/lib/crawl.ts";
import { format } from "https://deno.land/std@0.163.0/datetime/mod.ts";
import { parse } from "https://deno.land/std@0.163.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.163.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.163.0/path/mod.ts";

(async () => {
  console.log("start");
  const option = parseArgs(parse(Deno.args));
  const outDir = join(
    option.outDirBase,
    "screenshot",
    format(new Date(), "yyyyMMddHHmmss")
  );

  if (option.screenshotEnabled) ensureDir(outDir);

  await crawlReservableKaiExists(option, outDir);

  console.log("done.");
  Deno.exit();
})();
