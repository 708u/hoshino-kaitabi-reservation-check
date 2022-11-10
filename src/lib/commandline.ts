import { resolve } from "https://deno.land/std@0.162.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.163.0/flags/mod.ts";

type Option = {
  verbose: boolean;
  outDirBase: string;
  targetReservations: string[];
};

export const parseArgs = (args: ReturnType<typeof parse>): Option => {
  return {
    verbose: !!args?.v || !!args?.verbose,
    outDirBase: args?.o ? resolve(args?.o) : "./out",
    targetReservations: args["_"].map((v) => String(v)),
  };
};
