import { SLACK_WEBHOOK_URL } from "@/lib/environment.ts";
import { resolve } from "https://deno.land/std@0.162.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.163.0/flags/mod.ts";

type Option = {
  verbose: boolean;
  outDirBase: string;
  targetReservations: string[];
  sendNotificationEnabled: boolean;
};

export const parseArgs = (args: ReturnType<typeof parse>): Option => {
  const option = {
    verbose: !!args?.v || !!args?.verbose,
    outDirBase: args?.o ? resolve(args?.o) : "./out",
    targetReservations: args["_"].map((v) => String(v)),
    sendNotificationEnabled: !!args?.["send-notification"],
  };

  if (option.sendNotificationEnabled) {
    if (SLACK_WEBHOOK_URL === "") {
      throw new Error(
        "$HOSHINO_KAITABI_RESERVATION_SLACK_WEBHOOK_URL must be set if --send-notification enabled"
      );
    }
  }

  return option;
};
