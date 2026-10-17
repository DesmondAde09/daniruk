/**
 * Copy helper. `expo-clipboard` isn't in the dependency set for this demo build,
 * so this loads it when present and otherwise resolves as if the copy succeeded
 * (the receive screen's feedback flow still works end-to-end in the mock).
 * Install `expo-clipboard` (npx expo install expo-clipboard) before shipping.
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const clipboard = require('expo-clipboard') as {
      setStringAsync: (value: string) => Promise<void>;
    };
    await clipboard.setStringAsync(text);
  } catch {
    // Module not installed: mock copy succeeds so the UI flow is demoable.
  }
}
