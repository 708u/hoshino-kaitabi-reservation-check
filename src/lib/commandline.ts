import { SLACK_WEBHOOK_URL } from "@/lib/environment.ts";
import { isKai, Kai, kaiTabiUrls } from "@/lib/kai.ts";
import { resolve } from "https://deno.land/std@0.162.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.163.0/flags/mod.ts";

export type Option = {
  verbose: boolean;
  outDirBase: string;
  targetReservations: Array<Kai>;
  sendNotificationEnabled: boolean;
};

export const parseArgs = (args: ReturnType<typeof parse>): Option => {
  const option = {
    verbose: !!args?.v || !!args?.verbose,
    outDirBase: args?.o ? resolve(args?.o) : "./out",
    sendNotificationEnabled: !!args?.["send-notification"],
    targetReservations: parseTargetReservations(
      args["_"].map((v) => String(v))
    ),
  };

  if (option.sendNotificationEnabled && SLACK_WEBHOOK_URL === "") {
    throw new Error(
      "$HOSHINO_KAITABI_RESERVATION_SLACK_WEBHOOK_URL must be set if --send-notification enabled"
    );
  }

  return option;
};

const parseTargetReservations = (targets: Array<string>): Array<Kai> => {
  if (targets.includes("all") || targets.length === 0)
    return Object.keys(kaiTabiUrls) as Array<Kai>;

  return targets
    .map<Kai | undefined>((v) => {
      if (isKai(v)) return v;
    })
    .filter((v): v is Kai => !!v);
};
