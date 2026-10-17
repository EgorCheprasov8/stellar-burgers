import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

/* Все запросы к бэкенду подменяются ответами из HAR-файлов */
const API_URL = '**/api';

const HAR = {
  ingredients: 'tests/hars/ingredients.har',
  user: 'tests/hars/user.har',
  order: 'tests/hars/order.har',
};

/* Данные из tests/hars/ingredients.har */
const BUN = {
  id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
};
const MAIN = {
  id: '643d69a5c3f7b9001cfa0941',
  name: 'Биокотлета из марсианской Магнолии',
  calories: '4242',
  proteins: '420',
  fat: '142',
  carbohydrates: '242',
};
const SAUCE = {
  id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
};

/* Номер заказа из tests/hars/order.har */
const ORDER_NUMBER = '91337';

const ACCESS_TOKEN = 'Bearer test-access-token';
const REFRESH_TOKEN = 'test-refresh-token';

const mockIngredients = async (page: Page): Promise<void> => {
  await page.routeFromHAR(HAR.ingredients, { url: `${API_URL}/ingredients` });
};

const addIngredient = async (page: Page, id: string): Promise<void> => {
  await page
    .getByTestId(`ingredient-${id}`)
    .getByRole('button', { name: 'Добавить' })
    .click();
};

test.describe('добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await page.goto('/');
  });

  test('булка добавляется в конструктор сверху и снизу', async ({ page }) => {
    await expect(page.getByText('Выберите булки')).toHaveCount(2);

    await addIngredient(page, BUN.id);

    await expect(page.getByTestId('constructor-bun-top')).toContainText(
      `${BUN.name} (верх)`
    );
    await expect(page.getByTestId('constructor-bun-bottom')).toContainText(
      `${BUN.name} (низ)`
    );
    await expect(page.getByText('Выберите булки')).toHaveCount(0);
  });

  test('начинка и соус добавляются в список ингредиентов конструктора', async ({
    page,
  }) => {
    const constructorIngredients = page.getByTestId('constructor-ingredients');
    await expect(constructorIngredients).toContainText('Выберите начинку');

    await addIngredient(page, MAIN.id);
    await addIngredient(page, SAUCE.id);

    await expect(constructorIngredients.getByRole('listitem')).toHaveCount(2);
    await expect(constructorIngredients).toContainText(MAIN.name);
    await expect(constructorIngredients).toContainText(SAUCE.name);
    await expect(constructorIngredients).not.toContainText('Выберите начинку');
  });
});

test.describe('модальное окно с описанием ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await mockIngredients(page);
    await page.goto('/');
    await page.getByTestId(`ingredient-${MAIN.id}`).getByRole('link').click();
  });

  test('открывается с данными ингредиента, по которому кликнули', async ({ page }) => {
    const modal = page.getByTestId('modal');

    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal.getByRole('heading', { name: MAIN.name })).toBeVisible();
    await expect(modal).toContainText(MAIN.calories);
    await expect(modal).toContainText(MAIN.proteins);
    await expect(modal).toContainText(MAIN.fat);
    await expect(modal).toContainText(MAIN.carbohydrates);
    await expect(modal).not.toContainText(BUN.name);
    await expect(page).toHaveURL(`/ingredients/${MAIN.id}`);
  });

  test('закрывается по клику на крестик', async ({ page }) => {
    await page.getByTestId('modal-close').click();

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('закрывается по клику на оверлей', async ({ page }) => {
    /* Клик в угол оверлея: центр перекрыт самим модальным окном */
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } });

    await expect(page.getByTestId('modal')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('оформление заказа', () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    /* Фейковые токены авторизации: accessToken в cookie, refreshToken в localStorage */
    await context.addCookies([
      { name: 'accessToken', value: encodeURIComponent(ACCESS_TOKEN), url: baseURL },
    ]);
    await context.addInitScript((refreshToken) => {
      window.localStorage.setItem('refreshToken', refreshToken);
    }, REFRESH_TOKEN);

    await mockIngredients(page);
    await page.routeFromHAR(HAR.user, { url: `${API_URL}/auth/user` });
    await page.routeFromHAR(HAR.order, { url: `${API_URL}/orders` });

    await page.goto('/');
  });

  test.afterEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.evaluate(() => window.localStorage.clear());
  });

  test('после оформления показывается номер заказа и конструктор очищается', async ({
    page,
  }) => {
    await addIngredient(page, BUN.id);
    await addIngredient(page, MAIN.id);
    await addIngredient(page, SAUCE.id);

    const constructorIngredients = page.getByTestId('constructor-ingredients');
    await expect(page.getByTestId('constructor-bun-top')).toContainText(BUN.name);
    await expect(constructorIngredients.getByRole('listitem')).toHaveCount(2);

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(ORDER_NUMBER);

    /* Конструктор пуст */
    await expect(page.getByTestId('constructor-bun-top')).toHaveCount(0);
    await expect(page.getByTestId('constructor-bun-bottom')).toHaveCount(0);
    await expect(page.getByText('Выберите булки')).toHaveCount(2);
    await expect(constructorIngredients).toContainText('Выберите начинку');
    await expect(constructorIngredients).not.toContainText(MAIN.name);

    await page.getByTestId('modal-close').click();

    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('order-number')).toHaveCount(0);
  });
});
