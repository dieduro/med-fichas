import {defineConfig} from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {baseURL: "http://localhost:3187", headless: true},
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 3187",
    url: "http://localhost:3187",
    reuseExistingServer: false,
  },
});
