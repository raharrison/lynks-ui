const BROWSERS: [RegExp, string][] = [
    [/Edg\//, 'Edge'],
    [/OPR\//, 'Opera'],
    [/Firefox\//, 'Firefox'],
    [/Chrome\//, 'Chrome'],
    [/Safari\//, 'Safari'],
];

// Order matters: iOS and Android user agents also mention Mac OS and Linux
const SYSTEMS: [RegExp, string][] = [
    [/iPhone|iPad/, 'iOS'],
    [/Android/, 'Android'],
    [/Windows/, 'Windows'],
    [/Mac OS X|Macintosh/, 'macOS'],
    [/Linux/, 'Linux'],
];

/** A short "Browser on System" label for a session, falling back to the raw string. */
export function describeUserAgent(userAgent: string | null): string {
    if (!userAgent) return 'Unknown device';
    const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
    const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
    if (browser && system) return `${browser} on ${system}`;
    return browser ?? system ?? userAgent;
}
