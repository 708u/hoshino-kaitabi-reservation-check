import { SLACK_WEBHOOK_URL } from "@/lib/environment.ts";

export const noticeMessage = async (text: string): Promise<void> => {
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({ text: text }),
    });
  } catch (e) {
    throw new Error("slack notification failed", { cause: e });
  }
};
