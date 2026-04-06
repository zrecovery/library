import { createSignal } from "solid-js";

export const [alertMsg, setAlertMsg] = createSignal<string | null>(null);

export function showAlert(msg: string) {
  setAlertMsg(msg);
  setTimeout(() => setAlertMsg(null), 2000);
}
