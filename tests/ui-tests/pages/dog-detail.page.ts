import { Page, Locator } from '@playwright/test';

export class DogDetailPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly cartLink: Locator;
  readonly heading: Locator;
  readonly price: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /Add to Cart/ });
    this.cartLink = page.getByRole('link', { name: /Cart/ });
    this.heading = page.getByRole('heading', { level: 1 });
    this.price = page.locator('main').getByText(/£[\d,]+\.\d{2}/).first();
  }

  async navigate(slug: string): Promise<void> {
    await this.page.goto(`/dogs/${slug}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async getCartCount(): Promise<number> {
    const badge = this.page.locator('nav a[href="/cart"] span');
    if (await badge.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await badge.textContent();
      return parseInt(text ?? '0', 10);
    }
    return 0;
  }
}
