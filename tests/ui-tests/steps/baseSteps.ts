import { Page } from "playwright/test";
import { DogDetailPage } from "../pageFactory/dog-detail.page";
import { CartPage } from "../pageFactory/cart.page";

export default class BaseSteps {

    readonly page: Page;
    readonly dogDetailPage: DogDetailPage;
    readonly cartPage: CartPage;

    constructor(page: Page) {
        this.page = page;
        this.dogDetailPage = new DogDetailPage(page);
        this.cartPage = new CartPage(page);
    }
}