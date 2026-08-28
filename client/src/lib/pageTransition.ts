export function pageTransitionKey(location: string) {
  return location.split("?")[0] || "/";
}
