import { test as base } from '@playwright/test';
import DogDetailSteps from '../steps/dogDetailSteps';
import CartSteps from '../steps/cartSteps';

type PageFixtures = {
    dogDetailSteps: DogDetailSteps;
    cartSteps: CartSteps;
}

export const test = base.extend<PageFixtures>({
    dogDetailSteps: async ({ page }, use) => {
        const dogDetailSteps = new DogDetailSteps(page);
        await use(dogDetailSteps);
    },
    cartSteps: async ({ page }, use) => {
        const cartSteps = new CartSteps(page);
        await use(cartSteps);
    },
});
