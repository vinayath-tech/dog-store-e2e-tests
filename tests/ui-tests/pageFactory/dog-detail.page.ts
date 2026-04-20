import { Page, Locator } from '@playwright/test';

export class DogDetailPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly cartLink: Locator;
  readonly heading: Locator;
  readonly price: Locator;
  readonly browseDogsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /Add to Cart/ });
    this.cartLink = page.getByRole('link', { name: /Cart/ });
    this.heading = page.getByRole('heading', { level: 1 });
    this.price = page.locator('main').getByText(/£[\d,]+\.\d{2}/).first();
    this.browseDogsLink = page.getByRole('link', { name: 'Browse Dogs' });
  }

  async navigate(slug?: string): Promise<void> {
    if (slug) {
      await this.page.goto(`/dogs/${slug}`);
    } else {
      await this.page.goto('/dogs');
    }
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

  async clickDog(name?: string): Promise<void> {
    if (name) {
      await this.page.getByRole('link', { name: new RegExp(name) }).click();
    } else {
      await this.page.getByText('View Details →').first().click();
    }
  }
}
