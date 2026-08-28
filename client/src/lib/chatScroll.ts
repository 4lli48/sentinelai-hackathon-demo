export function chatScrollBehavior(messageCount: number, reducedMotion: boolean): ScrollBehavior {
  return reducedMotion || messageCount <= 1 ? "auto" : "smooth";
}
