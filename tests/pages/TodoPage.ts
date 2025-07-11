// TodoPage.ts
import { Page, Locator } from '@playwright/test';
import { SELECTORS } from '../utils/selectors';

export class TodoPage {
  readonly page: Page;
  readonly input: Locator;
  readonly addButton: Locator;
  readonly taskList: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.input = page.locator(SELECTORS.input);
    this.addButton = page.locator(SELECTORS.addButton);
    this.taskList = page.locator(SELECTORS.taskList);
  }

  // Базовые методы
  async goto() {
    await this.page.goto('/');
  }

  async addTodo(text: string) {
    await this.input.fill(text);
    await this.addButton.click();
  }

  // Оптимизированные методы работы с задачами
  getTaskItems() {
    return this.taskList.locator(SELECTORS.taskItem);
  }

  async getTodoTexts(): Promise<string[]> {
    const titles = this.getTaskItems().locator(SELECTORS.taskTitle);
    return titles.allTextContents().then(texts => texts.map(t => t.trim()));
  }

  async deleteTodo(index: number) {
    await this.getTaskItems()
      .nth(index)
      .locator(SELECTORS.deleteButton)
      .click();
  }

  async toggleTodo(index: number) {
    await this.getTaskItems()
      .nth(index)
      .locator(SELECTORS.taskCheckbox)
      .click();
  }

  async deleteTodoByText(taskText: string) {
    await this.getTaskItems()
      .filter({ hasText: taskText })
      .locator(SELECTORS.deleteButton)
      .click();
  }
  
  // Дополнительные полезные методы
  async getTaskByText(taskText: string) {
    return this.getTaskItems().filter({ hasText: taskText });
  }
  
  async getTaskCount() {
    return this.getTaskItems().count();
  }
}