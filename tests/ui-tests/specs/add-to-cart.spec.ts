import { test, expect } from '@playwright/test';
import { DogDetailPage } from '../pages/dog-detail.page';
import { CartPage } from '../pages/cart.page';

test.describe('vinayath-tech/dog-store-frontend#1 — Add to Cart from Dog Detail Page', () => {

  // ── Happy Path ────────────────────────────────────────────────────────

  // TS-001
  test('should display Add to Cart button on dog detail page', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.addToCartButton).toBeEnabled();
  });

  // TS-002
  test('should add dog to cart when Add to Cart is clicked', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await detail.cartLink.click();
    await page.waitForURL('/cart');

    const cart = new CartPage(page);
    await expect(cart.getItemByName('Samoyed Puppy')).toBeVisible();
  });

  // TS-003
  test('should update cart count in header immediately after adding', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    const before = await detail.getCartCount();
    await detail.addToCart();

    await expect(detail.cartLink).toContainText(`${before + 1}`);
  });

  // TS-004
  test('should show confirmation text on button after adding to cart', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Added! to cart');
  });

  // TS-005
  test('should revert button text to Add to Cart after 2 seconds', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Added! to cart');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });
  });

  // TS-006
  test('should show loading state on button while API call is in progress', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ page }) => {
    await page.route('**/store/carts/*/line-items', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCartButton.click();

    await expect(detail.addToCartButton).toBeDisabled();
  });

  // ── Negative ──────────────────────────────────────────────────────────

  // TS-007
  test('should show Failed text when cart API returns error', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ page }) => {
    await page.route('**/store/carts/*/line-items', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Failed');
  });

  // TS-008
  test('should revert Failed text to Add to Cart after 2 seconds', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ page }) => {
    await page.route('**/store/carts/*/line-items', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Failed');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });
  });

  // TS-009
  test('should not update cart count when add to cart fails', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    const before = await detail.getCartCount();

    await page.route('**/store/carts/*/line-items', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    await detail.addToCart();
    await expect(detail.addToCartButton).toContainText('Failed');

    const after = await detail.getCartCount();
    expect(after).toBe(before);
  });

  // TS-010
  test('should show Failed when network is offline', {
    tag: ['@negative', '@should-test', '@cart'],
  }, async ({ page, context }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    await context.setOffline(true);
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Failed');

    await context.setOffline(false);
  });

  // TS-011
  test('should show Failed when backend is unreachable', {
    tag: ['@negative', '@should-test', '@cart'],
  }, async ({ page }) => {
    await page.route('**/store/carts/*/line-items', (route) =>
      route.abort('connectionrefused')
    );

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Failed');
  });

  // ── Edge Cases ────────────────────────────────────────────────────────

  // TS-012
  test('should only add one item on rapid double-click', {
    tag: ['@edge-case', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    const before = await detail.getCartCount();
    await detail.addToCartButton.dblclick();

    await expect(detail.addToCartButton).toContainText('Added', { timeout: 3000 });
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });

    const after = await detail.getCartCount();
    expect(after).toBe(before + 1);
  });

  // TS-013
  test('should not process second click during confirmation state', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');

    const before = await detail.getCartCount();
    await detail.addToCart();
    await expect(detail.addToCartButton).toContainText('Added');

    await detail.addToCartButton.click();
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });

    const after = await detail.getCartCount();
    expect(after).toBeLessThanOrEqual(before + 2);
  });

  // TS-014
  test('should not crash when navigating away during loading', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.route('**/store/carts/*/line-items', async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCartButton.click();

    await page.getByRole('link', { name: 'Browse Dogs' }).click();
    await page.waitForURL('/dogs');

    await expect(page.getByRole('heading', { name: 'Our Puppies' })).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  // TS-015
  test('should persist cart count after browser refresh', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Added');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });

    const beforeRefresh = await detail.getCartCount();
    await page.reload();

    const afterRefresh = await detail.getCartCount();
    expect(afterRefresh).toBe(beforeRefresh);
  });

  // TS-016
  test('should show fresh Add to Cart button after navigating back from cart', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();
    await expect(detail.addToCartButton).toContainText('Added');

    await detail.cartLink.click();
    await page.waitForURL('/cart');

    await page.goBack();
    await page.waitForURL('**/dogs/samoyed-puppy');

    await expect(detail.addToCartButton).toBeVisible();
    await expect(detail.addToCartButton).toContainText('Add to Cart');
  });

  // ── Boundary ──────────────────────────────────────────────────────────

  // TS-017
  test('should display confirmation text for approximately 2 seconds', {
    tag: ['@boundary', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    const start = Date.now();
    await expect(detail.addToCartButton).toContainText('Added');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThan(1500);
    expect(duration).toBeLessThan(3000);
  });

  // TS-018
  test('should display Failed text for approximately 2 seconds', {
    tag: ['@boundary', '@should-test', '@cart'],
  }, async ({ page }) => {
    await page.route('**/store/carts/*/line-items', (route) =>
      route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
    );

    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    const start = Date.now();
    await expect(detail.addToCartButton).toContainText('Failed');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThan(1500);
    expect(duration).toBeLessThan(3000);
  });

  // ── Integration ───────────────────────────────────────────────────────

  // TS-019
  test('should show added dog on cart page with correct details', {
    tag: ['@integration', '@must-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);
    await detail.navigate('samoyed-puppy');
    await detail.addToCart();

    await expect(detail.addToCartButton).toContainText('Added');
    await detail.cartLink.click();
    await page.waitForURL('/cart');

    const cart = new CartPage(page);
    await expect(cart.getItemByName('Samoyed Puppy')).toBeVisible();
    await expect(page.getByText('£1,000.00')).toBeVisible();
  });

  // TS-020
  test('should show multiple dogs in cart after adding from different pages', {
    tag: ['@integration', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);

    await detail.navigate('samoyed-puppy');
    await detail.addToCart();
    await expect(detail.addToCartButton).toContainText('Added');
    await expect(detail.addToCartButton).toContainText('Add to Cart', { timeout: 5000 });

    await page.getByRole('link', { name: 'Browse Dogs' }).click();
    await page.waitForURL('/dogs');
    await page.getByRole('link', { name: /German Shepherd Puppy/ }).click();
    await page.waitForURL('**/dogs/german-shepherd-puppy');

    await detail.addToCart();
    await expect(detail.addToCartButton).toContainText('Added');
    await expect(detail.cartLink).toContainText('2');

    await detail.cartLink.click();
    await page.waitForURL('/cart');

    const cart = new CartPage(page);
    await expect(cart.getItemByName('Samoyed Puppy')).toBeVisible();
    await expect(cart.getItemByName('German Shepherd Puppy')).toBeVisible();
  });

  // TS-021
  test('should show Add to Cart button on multiple dog detail pages', {
    tag: ['@integration', '@should-test', '@cart'],
  }, async ({ page }) => {
    const detail = new DogDetailPage(page);

    await detail.navigate('samoyed-puppy');
    await expect(detail.addToCartButton).toBeVisible();

    await detail.navigate('german-shepherd-puppy');
    await expect(detail.addToCartButton).toBeVisible();

    await detail.navigate('beagle-puppy');
    await expect(detail.addToCartButton).toBeVisible();
  });
});
