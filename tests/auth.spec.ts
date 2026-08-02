import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    // Should be redirected to /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h1')).toContainText('PORTFOLIO CONTROL');
  });

  test('shows error on incorrect password', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter administrator password...').fill('wrongpassword');
    await page.getByRole('button', { name: /Authorize Access/i }).click();
    
    // Expect error toast
    await expect(page.getByText('Incorrect password')).toBeVisible();
  });

  test('successful login and navigation to projects', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Enter administrator password...').fill('Lalit@1434');
    await page.getByRole('button', { name: /Authorize Access/i }).click();
    
    // Expect redirection to dashboard
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByText('Projects', { exact: true })).toBeVisible();
  });
});
