import { test, expect } from '@playwright/test';

test.describe('Project Edit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByPlaceholder('Enter administrator password...').fill('Lalit@1434');
    await page.getByRole('button', { name: /Authorize Access/i }).click();
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('can create, edit, and delete a project', async ({ page }) => {
    // 1. Create a new project
    await page.getByRole('button', { name: /New Project/i }).click();
    
    // Expect to navigate to project editor and see default title
    await expect(page.getByText('Untitled Project', { exact: false }).first()).toBeVisible();
    
    // 2. Edit project title
    const titleInput = page.getByPlaceholder('e.g. Acme Dashboard');
    await titleInput.click();
    await titleInput.fill('Playwright Test Project');
    
    // Edit short description
    const descInput = page.getByPlaceholder('Brief one-liner...');
    await descInput.click();
    await descInput.fill('This is a test project created by Playwright.');
    
    // Save project
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    // Expect success toast
    await expect(page.getByText('Project saved successfully')).toBeVisible();
    
    // 3. Go back to projects list
    await page.getByRole('button', { name: /Back/i }).click();
    
    // Ensure the project is listed
    await expect(page.getByText('Playwright Test Project')).toBeVisible();
    
    // 4. Delete the project
    // Click on the project card to edit it again
    await page.getByText('Playwright Test Project').click();
    
    // Click delete button
    await page.getByRole('button', { name: /Delete Project/i }).click();
    
    // Expect success toast and redirection back to projects
    await expect(page.getByText('Project deleted successfully')).toBeVisible();
    await expect(page.getByText('Playwright Test Project')).not.toBeVisible();
  });
});
