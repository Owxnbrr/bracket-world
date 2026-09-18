import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const pick = (page: Page, match: string, team: string) => page.getByRole('button', { name: `Choisir ${team}, ${match}`, exact: true }).click();
const match = (page: Page, id: string) => page.getByTestId(`match-${id}`);

async function fillBracket(page: Page) {
  for (const [id, team] of [
    ['L1-A', 'Twisted Minds'], ['L1-B', 'Manchester City'], ['L1-C', 'Team Falcons'], ['L1-D', 'Team Vitality'],
    ['L2-A', 'Twisted Minds'], ['L2-B', 'Team Falcons'], ['UQF-A', 'Karmine Corp'], ['UQF-B', 'NRG'],
    ['LQF-A', 'Virtus.pro'], ['LQF-B', 'Team Falcons'], ['SF-A', 'Karmine Corp'], ['SF-B', 'NRG'], ['GF', 'Karmine Corp'],
  ] as const) await pick(page, id, team);
}

test('les sept scénarios : propagation, changement, champion, recharge et réinitialisation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('.match-card')).toHaveCount(13);
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await pick(page, 'L1-A', 'Twisted Minds');
  await pick(page, 'L1-B', 'Manchester City');
  await expect(match(page, 'L2-A')).toContainText('Twisted Minds');
  await expect(match(page, 'L2-A')).toContainText('Manchester City');
  await pick(page, 'UQF-A', 'Karmine Corp');
  await expect(match(page, 'SF-A')).toContainText('Karmine Corp');
  await expect(match(page, 'LQF-A')).toContainText('Virtus.pro');
  await pick(page, 'LQF-A', 'Virtus.pro');
  await expect(match(page, 'SF-A')).toContainText('Virtus.pro');
  await fillBracket(page);
  await expect(page.getByTestId('champion')).toContainText('Karmine Corp');
  await expect(page.locator('progress')).toHaveAttribute('value', '13');
  await page.screenshot({ path: 'test-results/bracket-complete.png', fullPage: true });
  await pick(page, 'UQF-A', 'Virtus.pro');
  await expect(match(page, 'LQF-A')).toContainText('Karmine Corp');
  await expect(match(page, 'SF-A')).toContainText('Virtus.pro');
  await expect(match(page, 'LQF-A').locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(match(page, 'SF-A').locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(match(page, 'GF').locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.getByTestId('champion')).not.toContainText('Karmine Corp');
  await expect(match(page, 'SF-B').locator('[aria-pressed="true"]')).toHaveText('NRG');
  await fillBracket(page);
  await page.reload();
  await expect(page.locator('progress')).toHaveAttribute('value', '13');
  await expect(page.getByTestId('champion')).toContainText('Karmine Corp');
  await page.getByRole('button', { name: 'Réinitialiser mes pronostics' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Conserver mes choix' }).click();
  await expect(page.getByTestId('champion')).toContainText('Karmine Corp');
  await page.getByRole('button', { name: 'Réinitialiser mes pronostics' }).click();
  await page.getByRole('button', { name: 'Tout réinitialiser' }).click();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  expect(await page.evaluate(() => localStorage.getItem('rlcs-playoffs-predictions'))).toBeNull();
  await page.reload();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/bracket-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('connecteurs alignés après redimensionnement et défilement mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('[data-connection]')).toHaveCount(14);
  const verifyConnections = async () => {
    const paths = await page.locator('[data-connection]').evaluateAll((elements) => {
      const bounds = document.querySelector('.bracket-board')!.getBoundingClientRect();
      return elements.map((element) => {
        const id = element.getAttribute('data-connection')!;
        const parts = id.match(/^(.*)-(LQF-[AB]|L2-[AB]|SF-[AB]|GF)-(\d)$/)!;
        const card = document.querySelector(`[data-match-id="${parts[2]}"] [data-team-slot="${parts[3]}"]`)!.getBoundingClientRect();
        const origin = document.querySelector(`[data-match-id="${parts[1]}"]`)!.getBoundingClientRect();
        const path = element as SVGPathElement;
        const endpoint = path.getPointAtLength(path.getTotalLength());
        const coordinates = path.getAttribute('d')!.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        return { x: endpoint.x, y: endpoint.y, targetX: card.left - bounds.left, targetY: card.top + card.height / 2 - bounds.top, sameColumn: Math.abs(origin.left - card.left) < 2, lane: coordinates[2]!, sourceLeft: origin.left - bounds.left };
      });
    });
    for (const point of paths) {
      expect(Math.abs(point.x - point.targetX)).toBeLessThan(1);
      expect(Math.abs(point.y - point.targetY)).toBeLessThan(1);
      if (point.sameColumn) expect(point.lane).toBeLessThan(point.sourceLeft);
    }
  };
  await verifyConnections();
  await page.setViewportSize({ width: 390, height: 844 });
  const scroller = page.getByRole('region', { name: /Bracket interactif/ });
  await expect(scroller).toBeVisible();
  expect(await scroller.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await scroller.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await verifyConnections();
  await expect(match(page, 'GF')).toBeInViewport();
  await page.screenshot({ path: 'test-results/bracket-mobile-final.png', fullPage: true });
  await scroller.evaluate((element) => { element.scrollLeft = 0; });
  await page.screenshot({ path: 'test-results/bracket-mobile.png', fullPage: true });
});

test('un logo illisible affiche les initiales et reste cliquable au clavier', async ({ page }) => {
  await page.route('**/logos/karmine-corp.png', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: 'invalid image' }));
  await page.goto('/');
  const row = page.getByRole('button', { name: 'Choisir Karmine Corp, UQF-A', exact: true });
  await expect(row.locator('.team-initials')).toHaveText('KC');
  await row.focus();
  await page.keyboard.press('Enter');
  await expect(row).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Réinitialiser mes pronostics' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(row).toHaveAttribute('aria-pressed', 'true');
});

test('une sauvegarde corrompue et un stockage bloqué ne font pas planter le bracket', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('rlcs-playoffs-predictions', '{broken'));
  await page.goto('/');
  await expect(page.locator('progress')).toHaveAttribute('value', '0');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError'); }; });
  await pick(page, 'UQF-A', 'Karmine Corp');
  await expect(match(page, 'SF-A')).toContainText('Karmine Corp');
  await expect(page.getByText('Sauvegarde indisponible dans ce navigateur')).toBeVisible();
});
