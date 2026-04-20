import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emptyMessage: Locator;
  readonly clearCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Shopping Cart' });
    this.emptyMessage = page.getByRole('heading', { name: 'Your cart is empty' });
    this.clearCartButton = page.getByRole('button', { name: 'Clear cart' });
  }

  async navigate(): Promise<void> {
    await this.page.goto('/cart');
  }

  getItemByName(name: string): Locator {
    return this.page.getByRole('link', { name });
  }
}
