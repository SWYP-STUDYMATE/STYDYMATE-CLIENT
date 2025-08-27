import { Page, Locator } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

export class BasePage {
  protected helpers: TestHelpers;

  constructor(protected page: Page) {
    this.helpers = new TestHelpers(page);
  }

  /**
   * 페이지 로드 대기
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 특정 URL로 이동
   */
  async goto(path: string) {
    await this.page.goto(path);
    await this.waitForLoad();
  }

  /**
   * 현재 URL 확인
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * 페이지 제목 확인
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * 요소 클릭
   */
  async click(selector: string) {
    await this.page.click(selector);
  }

  /**
   * 텍스트 입력
   */
  async fill(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  /**
   * 체크박스/라디오 버튼 선택
   */
  async check(selector: string) {
    await this.page.check(selector);
  }

  /**
   * 드롭다운 선택
   */
  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  /**
   * 요소가 보이는지 확인
   */
  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  /**
   * 요소가 활성화되었는지 확인
   */
  async isEnabled(selector: string): Promise<boolean> {
    return this.page.isEnabled(selector);
  }

  /**
   * 텍스트 내용 가져오기
   */
  async getTextContent(selector: string): Promise<string | null> {
    return this.page.textContent(selector);
  }

  /**
   * 요소의 속성 값 가져오기
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return this.page.getAttribute(selector, attribute);
  }

  /**
   * 요소 대기
   */
  async waitForSelector(selector: string, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }) {
    await this.page.waitForSelector(selector, options);
  }

  /**
   * 네트워크 응답 대기
   */
  async waitForResponse(urlPattern: string) {
    return this.page.waitForResponse(response => 
      response.url().includes(urlPattern)
    );
  }

  /**
   * 알림창 처리
   */
  async handleDialog(accept: boolean = true, text?: string) {
    this.page.on('dialog', async dialog => {
      if (text) {
        await dialog.accept(text);
      } else if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * 로컬 스토리지 설정
   */
  async setLocalStorage(key: string, value: string) {
    await this.page.evaluate(({ key, value }) => {
      localStorage.setItem(key, value);
    }, { key, value });
  }

  /**
   * 로컬 스토리지 가져오기
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return this.page.evaluate((key) => {
      return localStorage.getItem(key);
    }, key);
  }

  /**
   * 세션 스토리지 설정
   */
  async setSessionStorage(key: string, value: string) {
    await this.page.evaluate(({ key, value }) => {
      sessionStorage.setItem(key, value);
    }, { key, value });
  }

  /**
   * 쿠키 설정
   */
  async setCookie(name: string, value: string) {
    await this.page.context().addCookies([{
      name,
      value,
      domain: new URL(this.page.url()).hostname,
      path: '/'
    }]);
  }

  /**
   * 스크롤
   */
  async scrollTo(x: number, y: number) {
    await this.page.evaluate(({ x, y }) => {
      window.scrollTo(x, y);
    }, { x, y });
  }

  /**
   * 요소까지 스크롤
   */
  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * 키보드 입력
   */
  async pressKey(key: string) {
    await this.page.keyboard.press(key);
  }

  /**
   * 마우스 호버
   */
  async hover(selector: string) {
    await this.page.hover(selector);
  }

  /**
   * 드래그 앤 드롭
   */
  async dragAndDrop(sourceSelector: string, targetSelector: string) {
    await this.page.dragAndDrop(sourceSelector, targetSelector);
  }

  /**
   * 파일 업로드
   */
  async uploadFile(selector: string, filePaths: string[]) {
    await this.page.setInputFiles(selector, filePaths);
  }

  /**
   * 새 탭/창에서 링크 클릭
   */
  async clickAndWaitForNewTab(selector: string) {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.click(selector)
    ]);
    return newPage;
  }

  /**
   * 요소의 개수 확인
   */
  async getElementCount(selector: string): Promise<number> {
    return this.page.locator(selector).count();
  }

  /**
   * 모든 텍스트 내용 가져오기
   */
  async getAllTextContent(selector: string): Promise<string[]> {
    return this.page.locator(selector).allTextContents();
  }

  /**
   * CSS 스타일 확인
   */
  async getComputedStyle(selector: string, property: string): Promise<string> {
    return this.page.locator(selector).evaluate((element, property) => {
      return window.getComputedStyle(element).getPropertyValue(property);
    }, property);
  }

  /**
   * 요소의 경계 상자 정보 가져오기
   */
  async getBoundingBox(selector: string) {
    return this.page.locator(selector).boundingBox();
  }

  /**
   * 페이지 소스 가져오기
   */
  async getPageSource(): Promise<string> {
    return this.page.content();
  }

  /**
   * 콘솔 로그 수집
   */
  setupConsoleLogging() {
    const logs: string[] = [];
    this.page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    return logs;
  }

  /**
   * 네트워크 요청 모니터링
   */
  setupNetworkMonitoring() {
    const requests: any[] = [];
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date()
      });
    });
    return requests;
  }
}