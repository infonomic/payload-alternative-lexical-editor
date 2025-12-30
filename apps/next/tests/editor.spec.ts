import { expect, test } from '@playwright/test'

test.describe('Lexical Editor', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login using the default credentials from payload.config.ts
    await page.goto('/admin/login')
    await page.getByLabel('Email').fill('dev@payloadcms.com')
    await page.getByLabel('Password').fill('test')
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page.locator('.modular-dashboard')).toBeVisible()
  })

  test('should allow typing in the rich text editor', async ({ page }) => {
    // 2. Navigate to the "Full" collection (which likely has the editor)
    await page.getByRole('link', { name: 'Show all Full' }).click()
    await page.getByRole('link', { name: 'Create new Full' }).click()

    // 3. Locate the Lexical editor
    // Lexical editors are contenteditable divs. In Payload, they are often nested.
    // We target the one inside the 'richText' field.
    const editor = page.locator('.field-type.richText [contenteditable="true"]').first()

    await expect(editor).toBeVisible()

    // 4. Interact with the editor
    await editor.click()
    await page.keyboard.type('Hello from Playwright!')

    // 5. Assert content
    await expect(editor).toContainText('Hello from Playwright!')

    // 6. Save the document
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.getByText('successfully created')).toBeVisible()
  })
})
