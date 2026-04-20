import { expect } from "playwright/test";
import BaseSteps from "./baseSteps";

export default class DogDetailSteps extends BaseSteps {

    async navigateToDogDetails(slug?: string) {
        if (slug) {
            await this.dogDetailPage.navigate(slug);
        } else {
            await this.dogDetailPage.navigate();
            await this.dogDetailPage.clickDog();
        }
        await expect(this.dogDetailPage.heading).toBeVisible();
    }

    async verifyAddToCartButtonVisible() {
        await expect(this.dogDetailPage.addToCartButton).toBeVisible();
        await expect(this.dogDetailPage.addToCartButton).toBeEnabled();
    }

    async clickAddToCart() {
        await this.dogDetailPage.addToCart();
    }

    async doubleClickAddToCart() {
        await this.dogDetailPage.addToCartButton.dblclick();
    }

    async verifyButtonText(expectedText: string) {
        await expect(this.dogDetailPage.addToCartButton).toContainText(expectedText);
    }

    async verifyButtonTextWithTimeout(expectedText: string, timeout: number) {
        await expect(this.dogDetailPage.addToCartButton).toContainText(expectedText, { timeout });
    }

    async verifyButtonDisabled() {
        await expect(this.dogDetailPage.addToCartButton).toBeDisabled();
    }

    async verifyCartCount(expected: number) {
        await expect(this.dogDetailPage.cartLink).toContainText(`${expected}`);
    }

    async getCartCount(): Promise<number> {
        return this.dogDetailPage.getCartCount();
    }

    async navigateToCart() {
        await this.dogDetailPage.cartLink.click();
        await this.page.waitForURL('/cart');
    }

    async navigateToBrowseDogs() {
        await this.dogDetailPage.browseDogsLink.click();
        await this.page.waitForURL('/dogs');
    }

    async clickDogFromBrowsePage(dogName: string) {
        await this.dogDetailPage.clickDog(dogName);
    }

    async interceptCartApiWithError() {
        await this.page.route('**/store/carts/*/line-items', (route) =>
            route.fulfill({ status: 500, body: JSON.stringify({ message: 'Internal Server Error' }) })
        );
    }

    async interceptCartApiWithDelay(delayMs: number) {
        await this.page.route('**/store/carts/*/line-items', async (route) => {
            await new Promise((r) => setTimeout(r, delayMs));
            await route.continue();
        });
    }

    async interceptCartApiWithAbort() {
        await this.page.route('**/store/carts/*/line-items', (route) =>
            route.abort('connectionrefused')
        );
    }
}
