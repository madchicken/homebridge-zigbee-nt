export async function sleep(time) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), time));
}
