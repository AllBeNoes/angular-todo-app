import { test, expect } from '@playwright/test';
import { clearAppState } from '../utils/helpers';
import { TodoPage } from '../pages/TodoPage';

const TEST_TASK_PREFIX = 'Test todo';

test.describe('Delete Todo Functionality', () => {
  let todo: TodoPage;
  let taskText: string;
  
  test.beforeEach(async ({ page }) => {
    await test.step('Initialize test data', async () => {
      await clearAppState(page);
      todo = new TodoPage(page);
      taskText = `${TEST_TASK_PREFIX} ${Date.now()}`;
      
      // Подготовка тестовых данных
      await todo.goto();
      await expect.poll(() => todo.taskList.isVisible(), {
        message: 'Task list should be visible after initialization'
      }).toBe(true);
      
      await todo.addTodo(taskText);
      await expect.poll(() => todo.getTodoTexts(), {
        message: 'Test task should be added to the list'
      }).toContain(taskText);
    });
  });

  test('should delete a todo item by its text', async () => { // Убрали параметр page, так как он не используется
    // Arrange
    const initialCount = await test.step('Get initial tasks count', async () => {
      const count = await todo.getTaskItems().count(); // Исправлено: используем getTaskItems()
      expect.soft(count, 'Should have at least one task before deletion').toBeGreaterThan(0);
      return count;
    });

    // Act
    await test.step(`Delete task "${taskText}"`, async () => {
      await todo.deleteTodoByText(taskText);
    });

    // Assert
    await test.step('Verify task was deleted', async () => {
      // Проверка уменьшения количества задач
      await expect.poll(async () => {
        const currentCount = await todo.getTaskItems().count(); // Исправлено: используем getTaskItems()
        return currentCount === initialCount - 1;
      }, {
        message: `Tasks count should decrease from ${initialCount} to ${initialCount - 1}`
      }).toBe(true);
      
      // Комплексная проверка отсутствия задачи
      await test.step('Verify task is completely removed', async () => {
        // Проверка через Page Object
        await expect.poll(() => todo.getTodoTexts(), {
          message: 'Task should not be in the texts list'
        }).not.toContain(taskText);
      });
    });
  });
});