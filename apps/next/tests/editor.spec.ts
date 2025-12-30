import { expect, test } from '@playwright/test'

test.describe('Lexical Editor', () => {
  test.beforeAll(() => {
    console.log('Test suite starting at', new Date().toISOString())
  })
  test.afterAll(() => {
    console.log('Test suite ending at', new Date().toISOString())
  })

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

    // 3. Fill in the title field
    const timestamp = new Date().toISOString()
    await page.locator('#field-title').fill(`Test Title - ${timestamp}`)

    // 4. Locate the Lexical editor
    // Lexical editors are contenteditable divs. In Payload, they are often nested.
    // We target the one inside the 'richText' field.
    const editor = page.locator('.editor [contenteditable="true"]').first()

    await expect(editor).toBeVisible()

    // 4. Interact with the editor
    await editor.click()
    await page.keyboard.type('Hello from Playwright!')

    // 5. Assert content
    await expect(editor).toContainText('Hello from Playwright!')

    // 6. Save the document
    await page.locator('#action-save').click()
    await expect(page.locator('#action-unpublish')).toBeVisible()
  })
})
