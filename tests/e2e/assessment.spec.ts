import { test, expect } from '@playwright/test';
test('12문항 완료, 결과와 이미지 링크', async ({ page }) => {
  await page.goto('/test/');
  await expect(page.getByRole('button', { name: '다음 질문' })).toBeDisabled();
  for (let i = 0; i < 12; i++) {
    await expect(page.getByText(`QUESTION ${String(i + 1).padStart(2, '0')}`)).toBeVisible();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: i === 11 ? '결과 보기' : '다음 질문' }).click();
  }
  await expect(page).toHaveURL(/\/result\/ENFJ\//);
  await expect(page.getByRole('heading', { name: '함께 자라는 조율자' })).toBeVisible();
  await expect(page.getByRole('link', { name: '결과 이미지 저장' })).toHaveAttribute('href', '/results/ENFJ.png');
});
test('답변 수정과 새로고침 복원', async ({ page }) => {
  await page.goto('/test/');
  await page.getByRole('radio').first().check();
  await page.getByRole('button', { name: '다음 질문' }).click();
  await page.getByRole('radio').last().check();
  await page.reload();
  await expect(page.getByText('QUESTION 02')).toBeVisible();
  await expect(page.getByRole('radio').last()).toBeChecked();
  await page.getByRole('button', { name: '이전' }).click();
  await page.getByRole('radio').last().check();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17');
});
