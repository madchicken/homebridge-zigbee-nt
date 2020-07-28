export function parseModelName(model: string): string {
  // Remove non-ascii symbols
  return !model
    ? model
    : model
        .replace(/[^ -~]+/g, '')
        .replace(/[^\x00-\x7F]/g, '') // eslint-disable-line no-control-regex
        .trim();
}
