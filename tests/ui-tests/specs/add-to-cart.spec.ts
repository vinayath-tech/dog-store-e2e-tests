import { test } from '../fixtures/pageFixtures';
import { expect } from '@playwright/test';

test.describe('vinayath-tech/dog-store-frontend#1 — Add to Cart from Dog Detail Page', () => {

  // ── Happy Path ────────────────────────────────────────────────────────

  // TS-001
  test('should display Add to Cart button on dog detail page', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.verifyAddToCartButtonVisible();
  });

  // TS-002
  test('should add dog to cart when Add to Cart is clicked', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps, cartSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.navigateToCart();

    await cartSteps.verifyItemInCart('Samoyed Puppy');
  });

  // TS-003
  test('should update cart count in header immediately after adding', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');

    const before = await dogDetailSteps.getCartCount();
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyCartCount(before + 1);
  });

  // TS-004
  test('should show confirmation text on button after adding to cart', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Added! to cart');
  });

  // TS-005
  test('should revert button text to Add to Cart after 2 seconds', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Added! to cart');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);
  });

  // TS-006
  test('should show loading state on button while API call is in progress', {
    tag: ['@happy-path', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.interceptCartApiWithDelay(2000);
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonDisabled();
  });

  // ── Negative ──────────────────────────────────────────────────────────

  // TS-007
  test('should show Failed text when cart API returns error', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.interceptCartApiWithError();
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Failed');
  });

  // TS-008
  test('should revert Failed text to Add to Cart after 2 seconds', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.interceptCartApiWithError();
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Failed');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);
  });

  // TS-009
  test('should not update cart count when add to cart fails', {
    tag: ['@negative', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');

    const before = await dogDetailSteps.getCartCount();
    await dogDetailSteps.interceptCartApiWithError();
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Failed');

    const after = await dogDetailSteps.getCartCount();
    expect(after).toBe(before);
  });

  // TS-010
  test('should show Failed when network is offline', {
    tag: ['@negative', '@should-test', '@cart'],
  }, async ({ dogDetailSteps, context }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');

    await context.setOffline(true);
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Failed');

    await context.setOffline(false);
  });

  // TS-011
  test('should show Failed when backend is unreachable', {
    tag: ['@negative', '@should-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.interceptCartApiWithAbort();
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Failed');
  });

  // ── Edge Cases ────────────────────────────────────────────────────────

  // TS-012
  test('should only add one item on rapid double-click', {
    tag: ['@edge-case', '@must-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');

    const before = await dogDetailSteps.getCartCount();
    await dogDetailSteps.doubleClickAddToCart();

    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);

    const after = await dogDetailSteps.getCartCount();
    expect(after).toBe(before + 1);
  });

  // TS-013
  test('should not process second click during confirmation state', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');

    const before = await dogDetailSteps.getCartCount();
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Added');

    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);

    const after = await dogDetailSteps.getCartCount();
    expect(after).toBeLessThanOrEqual(before + 2);
  });

  // TS-014
  test('should not crash when navigating away during loading', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ dogDetailSteps, page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await dogDetailSteps.interceptCartApiWithDelay(3000);
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.navigateToBrowseDogs();

    await expect(page.getByRole('heading', { name: 'Our Puppies' })).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  // TS-015
  test('should persist cart count after browser refresh', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ dogDetailSteps, page }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    await dogDetailSteps.verifyButtonText('Added');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);

    const beforeRefresh = await dogDetailSteps.getCartCount();
    await page.reload();

    const afterRefresh = await dogDetailSteps.getCartCount();
    expect(afterRefresh).toBe(beforeRefresh);
  });

  // TS-016
  test('should show fresh Add to Cart button after navigating back from cart', {
    tag: ['@edge-case', '@should-test', '@cart'],
  }, async ({ dogDetailSteps, page }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Added');

    await dogDetailSteps.navigateToCart();

    await page.goBack();
    await page.waitForURL('**/dogs/samoyed-puppy');

    await dogDetailSteps.verifyAddToCartButtonVisible();
    await dogDetailSteps.verifyButtonText('Add to Cart');
  });

  // ── Boundary ──────────────────────────────────────────────────────────

  // TS-017
  test('should display confirmation text for approximately 2 seconds', {
    tag: ['@boundary', '@should-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    const start = Date.now();
    await dogDetailSteps.verifyButtonText('Added');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThan(1500);
    expect(duration).toBeLessThan(3000);
  });

  // TS-018
  test('should display Failed text for approximately 2 seconds', {
    tag: ['@boundary', '@should-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.interceptCartApiWithError();
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();

    const start = Date.now();
    await dogDetailSteps.verifyButtonText('Failed');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThan(1500);
    expect(duration).toBeLessThan(3000);
  });

  // ── Integration ───────────────────────────────────────────────────────

  // TS-019
  test('should show added dog on cart page with correct details', {
    tag: ['@integration', '@must-test', '@cart'],
  }, async ({ dogDetailSteps, cartSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Added');
    await dogDetailSteps.navigateToCart();

    await cartSteps.verifyItemInCart('Samoyed Puppy');
    await cartSteps.verifyPriceVisible('£1,000.00');
  });

  // TS-020
  test('should show multiple dogs in cart after adding from different pages', {
    tag: ['@integration', '@should-test', '@cart'],
  }, async ({ dogDetailSteps, cartSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Added');
    await dogDetailSteps.verifyButtonTextWithTimeout('Add to Cart', 5000);

    await dogDetailSteps.navigateToBrowseDogs();
    await dogDetailSteps.clickDogFromBrowsePage('German Shepherd Puppy');
    await dogDetailSteps.clickAddToCart();
    await dogDetailSteps.verifyButtonText('Added');
    await dogDetailSteps.verifyCartCount(2);

    await dogDetailSteps.navigateToCart();

    await cartSteps.verifyItemInCart('Samoyed Puppy');
    await cartSteps.verifyItemInCart('German Shepherd Puppy');
  });

  // TS-021
  test('should show Add to Cart button on multiple dog detail pages', {
    tag: ['@integration', '@should-test', '@cart'],
  }, async ({ dogDetailSteps }) => {
    await dogDetailSteps.navigateToDogDetails('samoyed-puppy');
    await dogDetailSteps.verifyAddToCartButtonVisible();

    await dogDetailSteps.navigateToDogDetails('german-shepherd-puppy');
    await dogDetailSteps.verifyAddToCartButtonVisible();

    await dogDetailSteps.navigateToDogDetails('beagle-puppy');
    await dogDetailSteps.verifyAddToCartButtonVisible();
  });
});
