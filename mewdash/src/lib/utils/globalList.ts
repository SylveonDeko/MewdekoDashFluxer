import { m } from "$lib/i18n";
import type { GlobalListAction, GlobalListCategory } from "$lib/api/globallist/models";

/** The label of a category */
export function categoryLabel(category: GlobalListCategory): string {
  switch (category) {
    case "Scamming": return m.globallist.categoryScamming();
    case "Raiding": return m.globallist.categoryRaiding();
    case "SpamBot": return m.globallist.categorySpamBot();
    case "Harassment": return m.globallist.categoryHarassment();
    case "Nsfw": return m.globallist.categoryNsfw();
    case "Impersonation": return m.globallist.categoryImpersonation();
    default: return m.globallist.categoryOther();
  }
}

/** The label of an action */
export function actionLabel(action: GlobalListAction): string {
  switch (action) {
    case "Ignore": return m.globallist.actionIgnore();
    case "Alert": return m.globallist.actionAlert();
    case "QuarantineRole": return m.globallist.actionQuarantineRole();
    case "Kick": return m.common.actionKick();
    default: return m.common.actionBan();
  }
}

/** Reads a UTC timestamp the bot sent without a zone and shows it in the viewer's locale */
export function formatDate(value: string | null | undefined): string {
  if (!value) return m.common.unknown();
  const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(utc).toLocaleString();
}

/** The sentence for an error name the bot answered with, or the raw message when it is not one */
export function errorText(err: unknown, fallback: string): string {
  const name = err instanceof Error ? err.message.trim() : "";
  switch (name) {
    case "NotOptedIn": return m.globallist.errorNotOptedIn();
    case "Blocked": return m.globallist.errorBlocked();
    case "DailyCap": return m.globallist.errorDailyCap();
    case "NoEvidence": return m.globallist.errorNoEvidence();
    case "NoReason": return m.globallist.errorNoReason();
    case "InvalidTarget": return m.globallist.errorInvalidTarget();
    case "AlreadyListed": return m.globallist.errorAlreadyListed();
    case "AlreadyReported": return m.globallist.errorAlreadyReported();
    case "InvalidImage": return m.globallist.errorInvalidImage();
    case "NotAllowed": return m.globallist.errorNotAllowed();
    case "NotOpen": return m.globallist.errorNotOpen();
    default: return fallback;
  }
}

/** Reads a file as a data URI */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
