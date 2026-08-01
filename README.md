# HANARYON OFFICIAL

한아련 사이트. 정적 파일 + Supabase.

## 1. 배포 순서

| 순서 | 위치 | 할 일 |
|---|---|---|
| 1 | Supabase → New project | 프로젝트 생성. Settings → API 에서 **Project URL**, **anon public** 키 복사 |
| 2 | Authentication → Users → Add user | 관리자 이메일·비밀번호 입력, **Auto Confirm User 켜기** |
| 3 | SQL Editor | `supabase_setup.sql` 전체 붙여넣고 Run |
| 4 | 로컬 | 연결 값 확인 (이미 채워져 있음, 2장 참고) |
| 5 | GitHub | 이 폴더 전체를 레포 루트에 업로드 |
| 6 | Cloudflare Pages | Connect to Git → 레포 선택 → Framework = None, 빌드 명령 비움 → Deploy |
| 7 | GitHub → Settings → Secrets → Actions | `SUPABASE_URL`, `SUPABASE_ANON_KEY` 등록 (keep-alive용) |

⚠️ **2번을 3번보다 먼저.** 계정 없이 SQL을 먼저 실행하면 쓰기 권한이 `authenticated` 로 잠겨 본인도 관리자에서 저장할 수 없다.

## 2. 연결 값

프로젝트 `layavdvfxmcgqxqcvtmq` 기준으로 이미 채워져 있다. 프로젝트를 새로 만들면 아래 두 곳을 교체한다.

| 파일 | 행 |
|---|---|
| `supabase.js` | 2~3 (URL, anon key) |
| `overlay/index.html` | 38 (자체 createClient) |

## 3. 폴더

```
index.html          메인 (16:9 커버)
style.css           서브 페이지 공통
supabase.js         DB 헬퍼 · 테마 · 문구 시스템
fx.js               입자 · 페이지 전환 · 카드 틸트
supabase_setup.sql  테이블 + RLS 정책
assets/             배경 일러스트
profile/ schedule/ song/ work/ diary/ dress/
admin/              관리자
overlay/            OBS 브라우저 소스 (700×120)
.github/workflows/  Supabase keep-alive (월·목)
```

## 4. 관리자

- 주소: `배포주소/admin/`
- 로그인: Supabase Authentication 에 등록한 **이메일 + 비밀번호**
- 코드에 비밀번호가 없다. 변경·분실·관리자 추가는 Supabase 대시보드에서 처리
- 탭: 메인 · 프로필 · 일정 · 노래책 · 업보 · 일기 · 옷장 · 문구 · 테마 · 문의

권한은 DB에서 나뉜다.

| 동작 | 권한 |
|---|---|
| 읽기 | 누구나 |
| 등록·수정·삭제 | 로그인한 관리자 |
| 일기 댓글 등록 | 누구나 |
| 문의 전송 | 누구나 |
| 문의 열람 | 로그인한 관리자만 |

## 5. SOOP 게시글 임베드

`EMBED_BLOCK` 은 iframe 높이를 픽셀로 고정한다. 메인 커버는 16:9 로 고정되어 있고 그 아래로 늘어나지 않는다.

```html
<iframe src="배포주소" height="900" scrolling="no"
        style="width:100%;border:0;display:block;"></iframe>
```

페이지별 권장 높이. 한 값만 쓸 수 있으면 **큰 쪽**을 쓴다(여백이 남는 편이 스크롤바 2개보다 낫다).

| 페이지 | 데스크톱 폭(≈1000px) | 모바일 폭(≈390px) |
|---|---|---|
| 메인 | 570 | 1100 |
| 프로필 | 3600 | 4800 |
| 일정 | 1760 | 1720 |
| 노래책 | 1020 | 1110 |
| 업보 | 950 | 1060 |
| 일기 | 1060 | 1130 |
| 옷장 | 1190 | 1330 |

## 6. 이미지

Storage 를 쓰지 않고 주소만 저장한다. SOOP 비공개 게시판에 올린 뒤 이미지 우클릭 → 이미지 주소 복사(글 주소 아님, `https://stimg.sooplive.com/...`).

| 칸 | 권장 비율 |
|---|---|
| 프로필 사진 | 1:1 |
| 메인 사진 | 16:9 |
| 옷장 | 3:4 (900×1200) |
| 일기 | 자유 |

프로필 사진은 SOOP 아이디만 넣으면 자동으로 붙는다. 직접 주소를 넣으면 그쪽이 우선.

## 7. 오버레이

OBS → 브라우저 소스 → `배포주소/overlay/` , 폭 700 · 높이 120.
관리자 노래책 탭에서 곡을 지정하면 1.5초 안에 바뀐다.

## 8. 재배포

바뀐 파일 덮어쓰기 → Commit → 1~2분 대기 → 브라우저에서 **Ctrl+Shift+R**.
