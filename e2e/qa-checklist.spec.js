import { test, expect } from "./fixtures/auth.fixture";

// QA Checklist mapped E2E tests (모바일 기준)
// 참고: 일부 라우트/백엔드/장치 권한/WebRTC가 필요한 항목은 test.fixme 로 표시해 TDD 가이드를 남깁니다.

// 1) 메인

test.describe("메인", () => {
  test("메인 페이지 진입 및 핵심 섹션 노출", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/main");
    await expect(
      authenticatedPage.locator('div:has-text("안녕하세요")')
    ).toBeVisible(); // GreetingCard
  });
});

// 2) 로그인/동의/콜백

test.describe("로그인 플로우", () => {
  test("로그인 기본 UI", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Language Mate에 오신 것을 환영해요!")
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "네이버로 로그인" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Google 로그인" })
    ).toBeVisible();
  });

  test("네이버 콜백 메시지", async ({ page }) => {
    await page.goto("/login/oauth2/code/naver");
    await expect(
      page.locator("text=/네이버 로그인 (처리 중|성공|실패)/")
    ).toBeVisible();
  });

  test("약관 동의 필수 체크 전/후 완료 버튼 상태", async ({
    context,
    page,
  }) => {
    await context.addInitScript(() => {
      localStorage.setItem("accessToken", "mock");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("isNewUser", "true");
    });
    await page.goto("/agreement");
    const complete = page.getByRole("button", { name: "완료" });
    await expect(complete).toBeDisabled();
    await page.check("#age-checkbox");
    await page.check("#terms-checkbox");
    await page.check("#privacy-checkbox");
    await expect(complete).toBeEnabled();
  });

  test("회원가입 완료 화면 진입", async ({ context, page }) => {
    await context.addInitScript(() => {
      localStorage.setItem("accessToken", "mock");
      localStorage.setItem("isAuthenticated", "true");
    });
    await page.goto("/signup-complete");
    await expect(page.getByText(/회원가입이 완료되었어요!/)).toBeVisible();
  });
});

// 3) 분석 대시보드 (API Stub)

test.describe("분석 대시보드", () => {
  test("대시보드 카드/차트 렌더링 - API 스텁", async ({ page }) => {
    await page.route("**/api/v1/analytics/dashboard", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            overview: {
              last24h: {
                count: 123,
                avgDuration: 123,
                errorRate: 0.01,
                p50Duration: 50,
                p95Duration: 120,
                p99Duration: 250,
                avgCpuTime: 30,
              },
            },
            topPaths: [{ path: "/api/a", count: 10 }],
            errorsByStatus: {},
            geoDistribution: [{ country: "KR", count: 10 }],
            realtime: { activeUsers: 3 },
          },
        }),
      });
    });
    await page.goto("/analytics");
    await expect(page.getByText("Analytics Dashboard")).toBeVisible();
    await expect(page.getByText("Total Requests")).toBeVisible();
  });
});

// 4) 채팅

test.describe("채팅", () => {
  test("채팅 페이지 로드 및 검색/빈상태 확인", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/chat");
    const search = authenticatedPage.getByPlaceholder("채팅방을 검색해보세요");
    const empty = authenticatedPage.getByText("채팅방이 없습니다");
    await expect(search.or(empty)).toBeVisible();
  });
});

// 5) 매칭 (라우트 미정 상태) -> TDD 안내

test.describe("매칭", () => {
  test.fixme(
    "매칭 프로필/목록 라우트가 App 라우터에 추가되면 구현",
    async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/matching");
      await expect(authenticatedPage.getByText("매칭 프로필")).toBeVisible();
    }
  );
});

// 6) 프로필

test.describe("프로필", () => {
  test("프로필 페이지 진입", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/profile");
    await expect(
      authenticatedPage.getByRole("heading", { name: "프로필" })
    ).toBeVisible();
  });
});

// 7) 스케줄

test.describe("스케줄", () => {
  test("스케줄 페이지: 캘린더+리스트 일부 텍스트", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/schedule");
    await expect(authenticatedPage.getByText("세션 스케줄")).toBeVisible();
  });
});

// 8) 세션: 리스트/캘린더/예약/체크

test.describe("세션", () => {
  test("세션 리스트", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/sessions");
    await expect(
      authenticatedPage.getByRole("heading", { name: "세션" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText(/예정된 세션|완료된 세션/)
    ).toBeVisible();
  });

  test("세션 캘린더", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/sessions/calendar");
    await expect(
      authenticatedPage.getByRole("heading", { name: "세션 캘린더" })
    ).toBeVisible();
  });

  test("세션 예약 생성", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/session/schedule/new");
    await expect(
      authenticatedPage.getByRole("heading", { name: "새 세션 예약" })
    ).toBeVisible();
    await expect(authenticatedPage.getByText("예약 완료")).toBeVisible();
  });

  test("오디오 연결 확인", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/session/audio-check");
    await expect(
      authenticatedPage.getByRole("heading", { name: "음성 세션 연결 확인" })
    ).toBeVisible();
    await expect(authenticatedPage.getByText("세션 시작하기")).toBeVisible();
  });

  test("비디오 연결 확인", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/session/video-check");
    await expect(
      authenticatedPage.getByRole("heading", { name: "화상 세션 연결 확인" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText("화상 세션 시작하기")
    ).toBeVisible();
  });

  test.fixme(
    "오디오/비디오 룸(실제 WebRTC 세션) - 시뮬레이션/Mock 필요",
    async ({ authenticatedPage }) => {
      await authenticatedPage.goto("/session/audio/test-room");
      await expect(authenticatedPage.getByText("음성 세션")).toBeVisible();
    }
  );
});

// 9) 레벨 테스트 (상세 플로우는 별도 파일에 존재)

test.describe("레벨 테스트(진입만)", () => {
  test("인트로/시작 버튼 존재", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/level-test");
    await expect(
      authenticatedPage.getByRole("heading", { name: "AI 레벨 테스트" })
    ).toBeVisible();
    await expect(
      authenticatedPage.getByRole("button", { name: "시작하기" })
    ).toBeVisible();
  });
});

// 10) 온보딩 - 정보 단계 (API Stub)

test.describe("온보딩 - 정보", () => {
  test("1단계: 영어 이름 입력 시 버튼 활성화", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/onboarding-info/1");
    await authenticatedPage
      .getByPlaceholder("닉네임을 입력해주세요")
      .fill("MinHan");
    await expect(
      authenticatedPage.getByRole("button", { name: "다음" })
    ).toBeEnabled();
  });

  test("2단계: 거주지 옵션 로드(Mock) 및 선택", async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem("accessToken", "mock");
      localStorage.setItem("isAuthenticated", "true");
    });
    await page.route("**/user/locations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { locationId: 1, city: "Seoul", country: "KR", timezone: "UTC+9" },
        ]),
      });
    });
    await page.goto("/onboarding-info/2");
    await page.getByText("거주지 & 시간대").click();
    await page.getByText("Seoul, KR (UTC+9)").click();
    await expect(page.getByRole("button", { name: "다음" })).toBeEnabled();
  });

  test("3단계: 프로필 사진 업로드 UI 노출", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/onboarding-info/3");
    await expect(
      authenticatedPage.getByText("프로필 사진을 업로드 해주세요.")
    ).toBeVisible();
    await expect(
      authenticatedPage.getByText(/사진 선택|카메라로 사진 찍기/)
    ).toBeVisible();
  });

  test("4단계: 자기소개 입력 시 다음 버튼 활성화", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/onboarding-info/4");
    await authenticatedPage
      .getByPlaceholder(/안녕하세요 현재 영어/)
      .fill("소개 텍스트");
    await expect(
      authenticatedPage.getByRole("button", { name: "다음" })
    ).toBeEnabled();
  });

  test("완료 화면 컴포넌트 노출", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/onboarding-info/complete");
    await expect(authenticatedPage.getByText(/기본 정보 작성/)).toBeVisible();
  });
});

// 11) 온보딩 - 언어 (API Stub)

test.describe("온보딩 - 언어", () => {
  test("모국어 선택 단계(Mock)", async ({ page }) => {
    await page.route("**/onboarding/language/languages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { languageId: 1, languageName: "Korean" },
          { languageId: 2, languageName: "English" },
        ]),
      });
    });
    await page.goto("/onboarding-lang/1");
    await page.getByText("모국어 선택").click();
    await page.getByText("Korean").click();
    await expect(page.getByRole("button", { name: "다음" })).toBeEnabled();
  });
});

// 12) 비디오 컨트롤 데모 (참고)

test.describe("비디오 컨트롤 데모", () => {
  test("데모 페이지 로드", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/session/video-controls-demo");
    await expect(
      authenticatedPage.getByText("VideoControls Component Demo")
    ).toBeVisible();
  });
});
