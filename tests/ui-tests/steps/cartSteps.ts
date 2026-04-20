import { expect } from "playwright/test";
import BaseSteps from "./baseSteps";

export default class CartSteps extends BaseSteps {

    async navigateToCart() {
        await this.cartPage.navigate();
    }

    async verifyItemInCart(itemName: string) {
        await expect(this.cartPage.getItemByName(itemName)).toBeVisible();
    }

    async verifyPriceVisible(price: string) {
        await expect(this.page.getByText(price)).toBeVisible();
    }

    async verifyCartEmpty() {
        await expect(this.cartPage.emptyMessage).toBeVisible();
    }
}
