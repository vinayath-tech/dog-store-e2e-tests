import { test } from '../fixtures/pageFixtures';

test.describe('Verify dog details page loads',{tag: '@wip'}, () => {
  test('Dog details page loads', async ({ dogDetailSteps }) => {
    
    await dogDetailSteps.navigateToDogDetails();
  });
});