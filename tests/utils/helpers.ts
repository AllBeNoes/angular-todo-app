// tests/utils/helpers.ts

import { Page } from '@playwright/test';

/**
 * Очищает состояние приложения перед каждым тестом
 */
export async function clearAppState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
}
