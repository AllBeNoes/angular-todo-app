import { test, expect } from '@playwright/test';
import { clearAppState } from '../utils/helpers';
import { TodoPage } from '../pages/TodoPage';
import { SELECTORS } from '../utils/selectors';

// Тест-сьют для проверки функционала удаления задач
test.describe('Add Todo АFunctuality', () => {
  // Перед каждым тестом очищаем состояние приложения
  test.beforeEach(async ({ page }) => {
    await clearAppState(page);
  });

  // Тест проверяет корректность удаления задачи по её тексту
  test('should delete a todo item by its text', async ({ page }) => {
    const todo = new TodoPage(page);
    // Генерируем уникальный текст задачи с timestamp для изоляции тестов
    const taskText = `Test todo ${Date.now()}`;

    // Шаг 1: Открытие приложения и проверка инициализации
    await test.step('Open the Todo app and wait for initialization', async () => {
      await todo.goto();
      // Ожидаем появления списка задач с помощью poll для устойчивости к задержкам
      await expect.poll(() => page.taskList.isVisible(), {
        message: 'Task list should be visible'
      }).toBe(true);
    });

    // Шаг 2: Добавление новой тестовой задачи
    await test.step('Add a new test task', async () => {
      await todo.addTodo(taskText);
      // Проверяем, что задача добавилась в список через poll
      await expect.poll(() => todo.getTodoTexts(), {
        message: `Task "${taskText}" should be added to the list`
      }).toContain(taskText);
    });

    // Шаг 3: Получение количества задач перед удалением
    let countBefore: number;
    await test.step('Get initial tasks count', async () => {
      countBefore = await todo.taskItem.count();
      // Проверяем, что список не пустой перед удалением
      expect(countBefore).toBeGreaterThan(0);
    });

    // Шаг 4: Удаление задачи по тексту
    await test.step('Delete the task by its text', async () => {
      await todo.deleteTodoByText(taskText);
    });

    // Шаг 5: Верификация удаления задачи
    await test.step('Verify task was deleted', async () => {
      // Проверка 1: Количество задач уменьшилось на 1
      await expect.poll(async () => {
        const currentCount = await todo.taskItems.count();
        return currentCount;
      }, {
        message: 'Tasks count should decrease by 1 after deletion'
      }).toBe(countBefore - 1);

      // Проверка 2: Задачи нет в списке текстов
      await expect.poll(() => todo.getTodoTexts(), {
        message: `Task "${taskText}" should be removed from the list`
      }).not.toContain(taskText);

      // Проверка 3: Элемент задачи не отображается в DOM
      await expect.poll(async () => {
        const isVisible = await page.locator(SELECTORS.taskItem, { hasText: taskText }).isVisible();
        return isVisible;
      }).toBe(false);
    });
  });
});