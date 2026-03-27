import React, { useState, useEffect } from "react";

const SECTIONS = ["overview", "diagnosis", "ai_test", "map", "action", "timeline"];
const SECTION_LABELS = {
  overview: "프로젝트 개요",
  diagnosis: "웹사이트 기술 진단",
  ai_test: "AI 노출 테스트",
  map: "충전소 노출 채널",
  action: "서비스 기획 액션플랜",
  timeline: "실행 타임라인",
};

const diagnosisActionItems = [
  { name: "Schema.org 구조화 데이터", status: "critical", scope: "주도", detail: "JSON-LD 스키마 전무. AI 크롤러가 워터의 정체성·충전소 스펙을 구조적으로 파싱 불가.", action: "Organization + EVChargingStation + LocalBusiness 스키마 설계 → 개발 적용 요청" },
  { name: "llms.txt AI 가이드 파일", status: "critical", scope: "주도", detail: "/llms.txt 미존재. AI 크롤러에게 핵심 콘텐츠를 안내하는 경로가 없음.", action: "llms.txt 마크다운 파일 작성 후 웹사이트 루트에 배포 (개발 협업)" },
  { name: "FAQ 구조화 페이지", status: "critical", scope: "주도", detail: "별도 FAQ 페이지 미존재. AI가 인용(citation)할 Q&A 소스가 전무.", action: "FAQPage 스키마와 함께 한국어 FAQ 구축 (개발 협업)" },
  { name: "JavaScript 렌더링 의존도", status: "critical", scope: "주도", detail: "Next.js 기반으로 JS 미실행 AI 크롤러는 콘텐츠를 아예 못 읽을 가능성 높음.", action: "SSR 확인 및 핵심 페이지 정적 HTML 제공 또는 llms.txt로 보완 (개발 협업)" },
  { name: "텍스트 콘텐츠 밀도", status: "critical", scope: "주도", detail: "이미지/영상 중심 구성. '3초 충전' 외 AI가 읽을 수 있는 팩트 정보 극히 부족.", action: "회사 개요, 충전소 수, 기술 스펙 등 콘텐츠 구조 설계 (서비스 기획 주도 · 실제 작성은 마케팅 협업)" },
  { name: "robots.txt AI 크롤러 정책", status: "warning", scope: "주도", detail: "접근 차단 또는 미설정. 의도치 않게 AI 크롤러가 차단될 가능성.", action: "GPTBot, ClaudeBot 등 AI 크롤러별 허용/차단 정책 명시" },
  { name: "영문 콘텐츠 구조화", status: "warning", scope: "주도", detail: "전체 사이트 한국어 only. 글로벌 AI는 영문 학습 비중이 압도적. 별도 영문 페이지 없이도 llms.txt·Schema.org에 영문 섹션 추가로 대응 가능.", action: "llms.txt 영문 섹션 추가 + Schema.org description 영문 병기 (개발 협업)" },
];

const diagnosisMonitorItems = [
  { name: "법인명-브랜드 연결", status: "warning", scope: "주도", detail: "푸터에 '브라이트에너지파트너스' 텍스트가 있으나 AI 크롤러가 레이아웃 요소로 처리할 가능성 높음. 본문·스키마에서 워터와 BEP의 연결 관계가 구조화되지 않은 상태.", action: "Schema.org Organization 스키마 legalName 필드에 브라이트에너지파트너스 추가 → 크롤러가 법인명-브랜드 관계를 정확히 파싱" },
  { name: "충전 요금 정보", status: "good", scope: "-", detail: "급속 347원/kWh 등 요금 정보가 크롤링 가능한 텍스트로 존재.", action: "Schema.org Offer 스키마 추가 적용 검토" },
  { name: "채용 페이지 회사 설명", status: "good", scope: "-", detail: "'2022.11 론칭, BEP, 블랙록 최대주주' 등 핵심 팩트가 채용 공고에 존재.", action: "이 텍스트를 About 페이지에도 반영하여 AI 접근성 확대" },
];

const diagnosisItems = [...diagnosisActionItems, ...diagnosisMonitorItems];

const aiTestPrompts = [
  { cat: "브랜드 인지도", id: "1-1", kr: "브라이트에너지파트너스의 워터 전기차 충전 서비스에 대해 알려줘", claude: 0, chatgpt: 1, gemini: 1, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "브랜드 인지도", id: "1-2", kr: "한국 전기차 충전 사업자 목록을 알려줘", claude: 0, chatgpt: 1, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "브랜드 인지도", id: "1-3", kr: "한국 고속도로 전기차 충전소를 운영하는 업체는 어디야?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "브랜드 인지도", id: "1-4", kr: "한국 민간 전기차 충전 사업자 중 잘 알려진 곳은?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "서비스 발견", id: "2-1", kr: "서울에서 부산 갈 때 전기차 충전 어디서 하면 돼?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "서비스 발견", id: "2-2", kr: "한국에서 전기차 충전 요금이 가장 저렴한 사업자는 어디야?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 0, gemini_on: 1, grok_on: 0, perplexity_on: 1 },
  { cat: "서비스 발견", id: "2-3", kr: "한국에서 전기차 급속충전기 추천해줘", claude: 0, chatgpt: 0, gemini: 1, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "서비스 발견", id: "2-4", kr: "전기차로 장거리 여행할 때 충전 팁 알려줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 0, gemini_on: 1, grok_on: 0, perplexity_on: 0 },
  { cat: "기술/데이터", id: "3-1", kr: "한국 전기차 충전 인프라 현황과 주요 사업자를 알려줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "기술/데이터", id: "3-2", kr: "전기차 충전 커브에 대해 설명해줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 0, gemini_on: 0, grok_on: 0, perplexity_on: 0 },
  { cat: "기술/데이터", id: "3-3", kr: "한국 고속도로 휴게소 전기차 충전소 현황을 알려줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "기술/데이터", id: "3-4", kr: "전기차 충전 사업의 수익 모델은 어떻게 돼?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 0, perplexity_on: 0 },
  { cat: "경쟁 비교", id: "4-1", kr: "환경부 급속충전기랑 민간 전기차 충전 사업자를 비교해줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 0, chatgpt_on: 1, gemini_on: 1, grok_on: 0, perplexity_on: 1 },
  { cat: "경쟁 비교", id: "4-2", kr: "한국 민간 전기차 충전 사업자들을 비교해줘", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
  { cat: "경쟁 비교", id: "4-3", kr: "한국 최고의 전기차 충전 앱은?", claude: 0, chatgpt: 0, gemini: 0, grok: 0, perplexity: 0, claude_on: 0, chatgpt_on: 0, gemini_on: 1, grok_on: 0, perplexity_on: 1 },
  { cat: "경쟁 비교", id: "4-4", kr: "한국 전기차 충전소 중 만족도가 높은 곳은 어디야?", claude: 0, chatgpt: 0, gemini: 1, grok: 0, perplexity: 0, claude_on: 1, chatgpt_on: 1, gemini_on: 1, grok_on: 1, perplexity_on: 1 },
];

const mapPlatforms = [
  { group: "공공·정부", name: "무공해차 통합누리집", checkedDate: "2026.03.20", operator: "환경부/한국환경공단", source: "환경공단 자체 DB (원천)", priority: "높음", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "Water (구)", manager: "김도연", note: "BEP 사업자 등록됐으나 '워터' 검색 미노출. 사업자명 water 매핑 필요" },
  { group: "공공·정부", name: "EV이음 앱", checkedDate: "2026.03.20", operator: "환경부/한국환경공단", source: "환경공단 자체 DB (원천)", priority: "높음", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "BEP", manager: "김도연", note: "" },
  { group: "공공·정부", name: "공공데이터포털 API", checkedDate: "", operator: "행정안전부", source: "환경공단 API 연동", priority: "중간", status: "미확인", nameMatch: "미확인", addressMatch: "미확인", hoursMatch: "미확인", logo: "", manager: "", note: "" },
  { group: "통합 충전 플랫폼", name: "EV Infra", checkedDate: "2026.03.20", operator: "㈜소프트베리", source: "환경공단 API + 자체수집", priority: "높음", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "Water (구)", manager: "김도연", note: "" },
  { group: "통합 충전 플랫폼", name: "모두의충전", checkedDate: "2026.03.20", operator: "㈜에버온", source: "환경공단 API + 자체수집", priority: "높음", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "BEP", manager: "김도연", note: "" },
  { group: "CPO 자체앱 (로밍)", name: "채비 (CHAEVI)", checkedDate: "2026.03.20", operator: "㈜대영채비", source: "자체 DB + 로밍사 연동", priority: "중간", status: "노출", nameMatch: "이슈 ⚠", addressMatch: "맞음", hoursMatch: "맞음", logo: "없음", manager: "김도연", note: "에스케이일렉링크로 표기" },
  { group: "CPO 자체앱 (로밍)", name: "해피차저", checkedDate: "2026.03.20", operator: "한국전기차충전서비스", source: "자체 DB + 전국 98% 로밍", priority: "중간", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "" },
  { group: "CPO 자체앱 (로밍)", name: "GS차지비", checkedDate: "2026.03.20", operator: "GS칼텍스", source: "자체 DB + 로밍사 연동", priority: "중간", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "제휴사업자만 노출" },
  { group: "CPO 자체앱 (로밍)", name: "SK일렉링크", checkedDate: "2026.03.20", operator: "SK에너지", source: "자체 DB + 로밍사 연동", priority: "중간", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "" },
  { group: "CPO 자체앱 (로밍)", name: "KEPCO PLUG", checkedDate: "2026.03.20", operator: "한국전력공사", source: "자체 DB + 환경공단 연동", priority: "중간", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "미노출", logo: "BEP", manager: "김도연", note: "충전기 정보 틀림" },
  { group: "지도·내비 앱", name: "카카오맵", checkedDate: "2026.03.20", operator: "카카오", source: "환경공단 API + 자체 POI", priority: "높음", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "없음", manager: "김도연", note: "워터 검색 시 결과 없음. 카카오 플레이스 직접 등록 신청 필요" },
  { group: "지도·내비 앱", name: "카카오내비", checkedDate: "2026.03.20", operator: "카카오", source: "자체 데이터", priority: "중간", status: "노출", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "없음", manager: "김도연", note: "이전 요금 정보 노출" },
  { group: "지도·내비 앱", name: "네이버 지도", checkedDate: "2026.03.20", operator: "네이버", source: "환경공단 API + 자체 POI", priority: "높음", status: "노출(이슈)", nameMatch: "맞음", addressMatch: "맞음", hoursMatch: "맞음", logo: "없음", manager: "김도연", note: "워터 서울 광화문만 미노출" },
  { group: "지도·내비 앱", name: "티맵 (T map)", checkedDate: "2026.03.20", operator: "SK텔레콤", source: "환경공단 API + 자체수집", priority: "높음", status: "노출", nameMatch: "이슈 ⚠", addressMatch: "맞음", hoursMatch: "맞음", logo: "Water", manager: "김도연", note: "워터서울광화문2 형식으로 표기" },
  { group: "지도·내비 앱", name: "아이나비", checkedDate: "2026.03.23", operator: "팅크웨어", source: "환경공단 API", priority: "낮음", status: "노출", nameMatch: "이슈 ⚠", addressMatch: "맞음", hoursMatch: "맞음", logo: "없음", manager: "김도연", note: "충전기 정보 틀림, 워터서울광화문2 형식 표기" },
  { group: "OEM·차량 연동", name: "현대 블루링크", checkedDate: "", operator: "현대자동차", source: "자체 DB + 환경공단 API", priority: "중간", status: "미확인", nameMatch: "미확인", addressMatch: "미확인", hoursMatch: "미확인", logo: "", manager: "", note: "" },
  { group: "OEM·차량 연동", name: "기아 커넥트", checkedDate: "", operator: "기아", source: "자체 DB + 환경공단 API", priority: "중간", status: "미확인", nameMatch: "미확인", addressMatch: "미확인", hoursMatch: "미확인", logo: "", manager: "", note: "" },
  { group: "OEM·차량 연동", name: "BMW 커넥티드 드라이브", checkedDate: "", operator: "BMW Korea", source: "자체 DB + GS차지비 제휴", priority: "낮음", status: "미확인", nameMatch: "미확인", addressMatch: "미확인", hoursMatch: "미확인", logo: "", manager: "", note: "" },
  { group: "글로벌·기타", name: "Google Maps", checkedDate: "2026.03.23", operator: "Google", source: "Google POI (직접 등록)", priority: "높음", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "워터 Water 등록·4.0★. 충전소 개별 등록 추가 필요" },
  { group: "글로벌·기타", name: "Apple Maps", checkedDate: "2026.03.23", operator: "Apple", source: "Apple POI (직접 등록)", priority: "높음", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "워터/water 검색 시 관련 없는 장소만 노출. Apple Maps Connect 등록 필요" },
  { group: "글로벌·기타", name: "PlugShare", checkedDate: "2026.03.23", operator: "Recargo (글로벌)", source: "사용자 제보 + CPO 파트너", priority: "중간", status: "노출", nameMatch: "미노출", addressMatch: "맞음", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "타사 충전소도 이름이 나오지 않음" },
  { group: "글로벌·기타", name: "Waze", checkedDate: "2026.03.23", operator: "Google (Waze)", source: "Google POI 연동", priority: "낮음", status: "미노출", nameMatch: "미노출", addressMatch: "미노출", hoursMatch: "미노출", logo: "없음", manager: "김도연", note: "" },
];

const actionItems = [
  { priority: "★★★", task: "llms.txt 작성 (공개 지식 DB 보완 수단)", period: "1 - 2주", difficulty: "하", collab: "개발", ceo: "#1", done: true },
  { priority: "★★★", task: "Schema.org 구조화 데이터 설계 (공개 지식 DB 보완 수단)", period: "2 - 4주", difficulty: "중", collab: "개발", ceo: "#1", done: true },
  { priority: "★★☆", task: "FAQ 페이지 구조 설계", period: "2 - 3주", difficulty: "하", collab: "개발", ceo: "#1", done: false },
  { priority: "★★☆", task: "robots.txt AI 크롤러 정책 설계", period: "1주", difficulty: "하", collab: "개발", ceo: "#1", done: true },
  { priority: "★★☆", task: "영문 콘텐츠 구조화 (llms.txt·Schema.org 영문 섹션 추가)", period: "1 - 2주", difficulty: "하", collab: "개발", ceo: "#1", done: false },
  { priority: "★★☆", task: "지도 플랫폼 모니터링 매뉴얼 설계", period: "2 - 3주", difficulty: "중", collab: "유관부서", ceo: "#6", done: false },
];

const phases = [
  { phase: 0, name: "Baseline 진단", period: "1주차", color: "#6B7B52", status: "완료", items: ["AI 노출 테스트 매트릭스 실행 ✓", "지도 플랫폼 채널 전수조사 (진행 중)", "웹사이트 기술 진단 완료 ✓", "→ 대표님 보고"] },
  { phase: 1, name: "Quick wins", period: "2 - 3주차", color: "#4A7B6A", status: "진행중", items: ["llms.txt 작성 완료 ✓", "robots.txt AI 정책 설계 완료 ✓", "Schema.org 설계 완료 ✓", "→ 개발 배포 대기"] },
  { phase: 2, name: "구조 강화", period: "4 - 8주차", color: "#9E7B4A", status: "예정", items: ["EVChargingStation 스키마 완성", "FAQ 페이지 구축", "영문 콘텐츠 구조화", "모니터링 매뉴얼 확정"] },
  { phase: 3, name: "측정 및 최적화", period: "9주차~", color: "#5A5A72", status: "예정", items: ["2차 AI 노출 테스트", "전후 비교 리포트", "월간 모니터링 정례화", "전략 고도화"] },
];

/* ── Saem-inspired color tokens ── */
const T = {
  bg: "#F5F0E8", surface: "#FFFFFF", surfaceAlt: "#EDE8DF",
  border: "rgba(90,72,50,0.10)", borderStrong: "rgba(90,72,50,0.18)",
  text: "#2C2418", textSub: "#4A3F33", textDim: "#7A7064",
  accent: "#8B7355", accentSoft: "rgba(139,115,85,0.10)",
  good: "#5C7A4A", goodSoft: "rgba(92,122,74,0.08)", goodBorder: "rgba(92,122,74,0.22)",
  warn: "#A07D3A", warnSoft: "rgba(160,125,58,0.08)", warnBorder: "rgba(160,125,58,0.22)",
  bad: "#9E4A4A", badSoft: "rgba(158,74,74,0.06)", badBorder: "rgba(158,74,74,0.20)",
  purple: "#5A5A72", purpleSoft: "rgba(90,90,114,0.06)", purpleBorder: "rgba(90,90,114,0.18)",
  teal: "#4A7B6A", tealSoft: "rgba(74,123,106,0.06)", tealBorder: "rgba(74,123,106,0.22)",
};

const StatusBadge = ({ status }) => {
  const config = {
    critical: { bg: T.badSoft, text: T.bad, border: T.badBorder, label: "미적용" },
    warning: { bg: T.warnSoft, text: T.warn, border: T.warnBorder, label: "미확인" },
    good: { bg: T.goodSoft, text: T.good, border: T.goodBorder, label: "양호" },
  };
  const c = config[status];
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 2, fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{c.label}</span>;
};

const ScopeBadge = ({ scope }) => {
  const colors = { "주도": T.purple, "협업요청": T.teal, "범위밖": T.textDim, "-": "transparent" };
  if (scope === "-") return null;
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 2, fontSize: 10, fontWeight: 500, border: `1px solid ${colors[scope]}40`, color: colors[scope], background: `${colors[scope]}08` }}>{scope}</span>;
};

const MetricCard = ({ label, value, sub, accent }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 2, padding: "20px 22px", flex: 1, minWidth: 120 }}>
    <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
    <div style={{ fontSize: 30, fontWeight: 700, color: accent || T.text, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: T.textDim, marginTop: 6 }}>{sub}</div>}
  </div>
);

async function apiRead() {
  try {
    const res = await fetch("/api/data");
    return await res.json();
  } catch(e) { return null; }
}

async function apiWrite(payload) {
  try {
    const res = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.ok;
  } catch(e) { return false; }
}

export default function WaterAIReport() {
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedDiag, setExpandedDiag] = useState(null);
  const [aiTestFilter, setAiTestFilter] = useState("전체");
  const [livePrompts, setLivePrompts] = useState(aiTestPrompts);
  const [liveChannels, setLiveChannels] = useState(mapPlatforms);
  const [liveActionItems, setLiveActionItems] = useState(actionItems);
  const [lastSaved, setLastSaved] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [syncStatus, setSyncStatus] = useState("");
  const [adminTab, setAdminTab] = useState("ai");
  const [aiAdminMode, setAiAdminMode] = useState("off");

  useEffect(() => {
    (async () => {
      const d = await apiRead();
      if (d) {
        if (d.prompts) setLivePrompts(d.prompts);
        if (d.channels) setLiveChannels(mapPlatforms.map(mp => {
          const f = d.channels.find(c => c.name === mp.name);
          return f ? { ...mp, status: f.status, nameMatch: f.nameMatch, addressMatch: f.addressMatch, hoursMatch: f.hoursMatch, checkedDate: f.checkedDate, logo: f.logo !== undefined ? f.logo : mp.logo } : mp;
        }));
        if (d.actionItems) setLiveActionItems(actionItems.map((a, i) => d.actionItems[i] ? { ...a, done: d.actionItems[i].done } : a));
        if (d.lastSaved) setLastSaved(d.lastSaved);
      }
    })();
  }, []);

  const criticalCount = diagnosisItems.filter(d => d.status === "critical").length;
  const warningCount = diagnosisItems.filter(d => d.status === "warning").length;
  const goodCount = diagnosisItems.filter(d => d.status === "good").length;
  const avg = (key) => (livePrompts.reduce((s, p) => s + p[key], 0) / aiTestPrompts.length).toFixed(1);
  const aiPlatforms = [
    { key: "gemini", label: "Gemini", avg: avg("gemini"), color: T.good, mentions: livePrompts.filter(p => p.gemini > 0).length, warn: null },
    { key: "perplexity", label: "Perplexity", avg: avg("perplexity"), color: T.teal, mentions: livePrompts.filter(p => p.perplexity > 0).length, warn: null },
    { key: "chatgpt", label: "ChatGPT", avg: avg("chatgpt"), color: T.warn, mentions: livePrompts.filter(p => p.chatgpt > 0).length, warn: null },
    { key: "claude", label: "Claude", avg: avg("claude"), color: T.bad, mentions: livePrompts.filter(p => p.claude > 0).length, warn: null },
    { key: "grok", label: "Grok", avg: avg("grok"), color: T.bad, mentions: livePrompts.filter(p => p.grok > 0).length, warn: "오답 위험" },
  ];

  const filteredPrompts = aiTestFilter === "전체" ? livePrompts : livePrompts.filter(p => p.cat === aiTestFilter);
  const cats = [...new Set(livePrompts.map(p => p.cat))];

  const PASSWORD = "221114";
  function handleAdminOpen() { setShowAdminPw(true); setAdminPw(""); setPwError(""); }
  function handleAdminLogin() { if (adminPw === PASSWORD) { setAdminMode(true); setShowAdminPw(false); } else { setPwError("비밀번호가 틀렸어요."); } }
  function handleAdminClose() { setAdminMode(false); }
  function togglePrompt(idx, key) { setLivePrompts(prev => prev.map((p, i) => i === idx ? { ...p, [key]: p[key] ? 0 : 1 } : p)); }
  function updateChannel(idx, key, val) { setLiveChannels(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c)); }
  function toggleActionItem(idx) { setLiveActionItems(prev => prev.map((a, i) => i === idx ? { ...a, done: !a.done } : a)); }
  function removeChannel(idx) { setLiveChannels(prev => prev.filter((_, i) => i !== idx)); }
  function addActionItem() { setLiveActionItems(prev => [...prev, { priority: "★☆☆", task: "새 과제", period: "", difficulty: "하", collab: "개발", ceo: "#1", done: false }]); }
  function removeActionItem(idx) { setLiveActionItems(prev => prev.filter((_, i) => i !== idx)); }
  function updateActionItem(idx, key, val) { setLiveActionItems(prev => prev.map((a, i) => i === idx ? { ...a, [key]: val } : a)); }

  useEffect(() => {
    if (!adminMode) return;
    const timer = setTimeout(async () => {
      const now = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
      const today = new Date().toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }).replace(/\. /g, ".").replace(/\.$/, "");
      const updatedChannels = liveChannels.map(c => ({ ...c, checkedDate: c.checkedDate || today }));
      const ok = await apiWrite({ prompts: livePrompts, channels: updatedChannels, actionItems: liveActionItems, lastSaved: now });
      if (ok) { setLastSaved(now); setSyncStatus("자동 저장됨"); } else { setSyncStatus("저장 실패"); }
      setTimeout(() => setSyncStatus(""), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [livePrompts, liveChannels, liveActionItems, adminMode]);

  const STATUS_OPTIONS = ["노출", "노출(이슈)", "미노출", "미확인"];
  const MATCH_OPTIONS = ["맞음", "이슈 ⚠", "미노출", "미확인"];
  const AIS = ["chatgpt", "claude", "gemini", "grok", "perplexity"];
  const AI_LABELS = { chatgpt: "ChatGPT", claude: "Claude", gemini: "Gemini", grok: "Grok", perplexity: "Perplexity" };

  return (
    <div style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif", background: T.bg, color: T.text, minHeight: "100vh" }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::selection { background: ${T.accent}30; }
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; }
        .sans { font-family: 'Pretendard', -apple-system, sans-serif; }
        .nav-item { padding: 12px 0; cursor: pointer; font-size: 12px; transition: all 0.3s; border-bottom: 1.5px solid transparent; color: ${T.textDim}; letter-spacing: 1.5px; text-transform: uppercase; }
        .nav-item:hover { color: ${T.textSub}; }
        .nav-item.active { color: ${T.accent}; border-bottom-color: ${T.accent}; }
        .diag-row { padding: 16px 20px; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid ${T.border}; }
        .diag-row:hover { background: ${T.accentSoft}; }
        .section { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .phase-card { padding: 24px; border: 1px solid ${T.border}; background: ${T.surface}; transition: all 0.2s; }
        .phase-card:hover { border-color: ${T.borderStrong}; }
        .filter-btn { padding: 7px 14px; font-size: 11px; cursor: pointer; border: 1px solid ${T.border}; background: transparent; color: ${T.textDim}; transition: all 0.2s; letter-spacing: 0.5px; }
        .filter-btn:hover { border-color: ${T.borderStrong}; color: ${T.textSub}; }
        .filter-btn.active { background: ${T.accent}; border-color: ${T.accent}; color: #fff; }
        .admin-select { background: ${T.surface}; border: 1px solid ${T.border}; color: ${T.text}; border-radius: 4px; padding: 3px 6px; font-size: 11px; cursor: pointer; width: 100%; }
        .admin-input { background: ${T.surface}; border: 1px solid ${T.border}; color: ${T.text}; border-radius: 4px; padding: 3px 6px; font-size: 11px; width: 100%; outline: none; }
        .admin-input:focus { border-color: ${T.accent}; }
        .admin-row { display: grid; gap: 6px; padding: 8px 12px; border-bottom: 1px solid ${T.border}; align-items: center; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: "52px 44px 36px", borderBottom: `1px solid ${T.border}` }}>
        <div className="sans" style={{ fontSize: 10, color: T.textDim, letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>AI Legibility / Visibility Project</div>
        <h1 className="serif" style={{ fontSize: 42, fontWeight: 400, marginBottom: 12, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          water<span style={{ color: T.accent }}>.</span>
        </h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400, lineHeight: 1.8 }}>
            water · 서비스 기획 · 2026.03
            {lastSaved && <span style={{ marginLeft: 12, fontSize: 11, color: T.teal }}>● 데이터 업데이트: {lastSaved}</span>}
          </p>
          {!adminMode && (
            <button onClick={handleAdminOpen} className="sans" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.textDim, borderRadius: 2, padding: "6px 14px", cursor: "pointer", fontSize: 11, letterSpacing: 0.5 }}>관리자</button>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ padding: "0 44px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 28, overflowX: "auto" }}>
        {SECTIONS.map(s => (
          <div key={s} className={`nav-item ${activeSection === s ? "active" : ""}`} onClick={() => setActiveSection(s)}>{SECTION_LABELS[s]}</div>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "36px 44px" }}>

        {/* === OVERVIEW === */}
        {activeSection === "overview" && (
          <div className="section">
            <div style={{ marginBottom: 36, paddingLeft: 24, borderLeft: `2px solid ${T.accent}` }}>
              <div className="sans" style={{ fontSize: 9, color: T.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>대표님 과제 지시 · 2026년 3월</div>
              <p style={{ fontSize: 15, color: T.textSub, lineHeight: 2, fontStyle: "italic", fontWeight: 400 }}>"AI에게 노출되는 사업/서비스/회사 형태의 구조로 개편 목표"</p>
            </div>

            <div style={{ marginBottom: 28, padding: "18px 22px", border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 12 }}>서비스 기획 담당 과제</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["#1", "위키피디아·공개 지식 DB 보완 — Schema.org, llms.txt, FAQ 설계 주도"], ["#6", "지도 플랫폼 모니터링 매뉴얼 설계 — 매뉴얼 기반 실제 관리는 유관부서"]].map(([num, desc]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span className="sans" style={{ fontSize: 10, fontWeight: 600, color: T.purple, background: T.purpleSoft, padding: "2px 8px", borderRadius: 2, flexShrink: 0, marginTop: 2 }}>{num}</span>
                    <span style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, fontWeight: 400 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28, padding: "18px 22px", border: `1px solid ${T.badBorder}`, background: T.badSoft }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 14 }}>⚠</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.bad }}>긴급 리스크 — Grok의 적극적 오답</div>
              </div>
              <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400 }}>
                Grok(X 기반 AI)은 워터에 대해 "존재하지 않는 서비스"라고 <span style={{ color: T.bad, fontWeight: 500 }}>단언</span>합니다. 웹 검색 ON 시 10/16으로 급등하므로 학습 데이터 부재가 원인입니다. 영문 뉴스 확산과 구조화 데이터 적용으로 해소 가능하나, 마케팅·PR 협력이 필요합니다.
              </p>
            </div>

            <div style={{ width: 40, height: 1, background: T.accent, margin: "32px 0" }} />

            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>AI 노출 현황</span>
              <span className="sans" style={{ fontSize: 10, padding: "3px 10px", background: T.warnSoft, border: `1px solid ${T.warnBorder}`, color: T.warn }}>웹 검색 OFF 기준</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { label: "ChatGPT", key: "chatgpt", color: T.warn },
                { label: "Claude", key: "claude", color: T.bad },
                { label: "Gemini", key: "gemini", color: T.good },
                { label: "Grok", key: "grok", color: T.bad },
                { label: "Perplexity", key: "perplexity", color: T.bad },
              ].map((m, i) => {
                const cnt = livePrompts.filter(p => p[m.key] > 0).length;
                return (
                  <div key={i} style={{ flex: 1, minWidth: 120, background: T.surface, border: `1px solid ${T.border}`, padding: "16px 14px", textAlign: "center" }}>
                    <div className="sans" style={{ fontSize: 11, color: T.textDim, marginBottom: 6, letterSpacing: 0.5 }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: m.color, lineHeight: 1 }}>{cnt}/{livePrompts.length}</div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{cnt === 0 ? "전체 미인지" : `${cnt}개 인지`}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginBottom: 32, padding: "12px 16px", background: T.warnSoft, border: `1px solid ${T.warnBorder}`, fontSize: 12, color: T.textSub, lineHeight: 1.8, fontWeight: 400 }}>
              웹 검색을 켜면 평균 <span style={{ color: T.good, fontWeight: 500 }}>10 - 15/16</span>으로 급등합니다. 언론 보도는 충분하나 AI가 학습할 구조화 데이터가 없습니다.
            </div>

            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>웹사이트 기술 진단</span>
              <span className="sans" style={{ fontSize: 10, color: T.textDim }}>10개 항목</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { label: "즉시 조치", value: criticalCount, sub: "Schema·llms·FAQ 등", color: T.bad, soft: T.badSoft, border: T.badBorder },
                { label: "확인 필요", value: warningCount, sub: "robots·영문·법인명", color: T.warn, soft: T.warnSoft, border: T.warnBorder },
                { label: "양호", value: goodCount, sub: "요금·채용 정보", color: T.good, soft: T.goodSoft, border: T.goodBorder },
              ].map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 100, background: d.soft, border: `1px solid ${d.border}`, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: d.color, marginBottom: 6 }}>{d.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: d.color, lineHeight: 1 }}>{d.value}</div>
                  <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{d.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>지도 채널 실사 현황</span>
              <span className="sans" style={{ fontSize: 10, color: T.textDim }}>22개 채널 중 {liveChannels.filter(p=>p.status!=='미확인').length}개 확인</span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              {[
                { label: "정상 노출", value: liveChannels.filter(p=>p.status==='노출').length, color: T.good, soft: T.goodSoft, border: T.goodBorder },
                { label: "이슈 있음", value: liveChannels.filter(p=>p.status==='노출(이슈)').length, color: T.warn, soft: T.warnSoft, border: T.warnBorder },
                { label: "미노출", value: liveChannels.filter(p=>p.status==='미노출').length, color: T.bad, soft: T.badSoft, border: T.badBorder },
                { label: "미확인", value: liveChannels.filter(p=>p.status==='미확인').length, color: T.textDim, soft: `${T.textDim}08`, border: `${T.textDim}18` },
              ].map((d, i) => (
                <div key={i} style={{ flex: 1, minWidth: 100, background: d.soft, border: `1px solid ${d.border}`, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: d.color, marginBottom: 6 }}>{d.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: d.color, lineHeight: 1 }}>{d.value}</div>
                </div>
              ))}
            </div>

            <div style={{ width: 40, height: 1, background: T.accent, margin: "32px 0" }} />

            <div style={{ padding: 24, border: `1px solid ${T.purpleBorder}`, background: T.purpleSoft, marginBottom: 28 }}>
              <div className="serif" style={{ fontSize: 16, color: T.purple, marginBottom: 12 }}>핵심 판단</div>
              <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.9, fontWeight: 400, marginBottom: 16 }}>
                watercharging.com은 AI 크롤러가 정보를 파싱할 수 없는 구조입니다. Schema.org, llms.txt, FAQ 등 구조적 요소가 전무합니다.
              </p>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, padding: "14px 16px", background: T.badSoft, border: `1px solid ${T.badBorder}`, textAlign: "center" }}>
                  <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 4 }}>현재 평균 (웹 검색 OFF)</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.bad }}>
                    {Math.round(AIS.reduce((s,k)=>s+livePrompts.filter(p=>p[k]>0).length,0)/5)}<span style={{ fontSize: 12 }}>/{livePrompts.length}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 16, color: T.textDim, padding: "0 4px" }}>→</div>
                <div style={{ flex: 1, padding: "14px 16px", background: T.goodSoft, border: `1px solid ${T.goodBorder}`, textAlign: "center" }}>
                  <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 4 }}>Phase 1 - 2 후 예상</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.good }}>8<span style={{ fontSize: 12 }}>/{livePrompts.length}</span></div>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: T.textDim, lineHeight: 1.6, fontWeight: 400 }}>
                업계 AEO 사례 기반 보수적 추정. Phase 1 - 2 완료 후 약 3 - 6개월 경과 기준.
              </div>
            </div>

            <div style={{ padding: "24px 28px", borderLeft: `3px solid ${T.teal}`, background: T.tealSoft }}>
              <div className="sans" style={{ fontSize: 9, color: T.teal, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>대표님께 요청드리는 사항</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Phase 1 즉시 착수 승인을 요청드립니다.</div>
              <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400, marginBottom: 20 }}>
                서비스 기획이 설계 완료한 3종 파일을 개발팀이 배포할 수 있도록 지시 부탁드립니다. 추가 예산 없이 <span style={{ fontWeight: 500, color: T.text }}>1 - 2주 내 실행 가능한 Quick Win</span>입니다.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { file: "llms.txt", color: T.teal, desc: "AI 크롤러에게 건네는 브로셔입니다. 워터의 사업 개요, 충전소 현황, 주요 팩트를 AI가 읽을 수 있는 형식으로 배치합니다." },
                  { file: "robots.txt", color: T.warn, desc: "AI 크롤러 출입 정책입니다. 현재 허용 정책이 없습니다. 명시적으로 허용해야 AI가 접근할 수 있습니다." },
                  { file: "Schema.org (JSON-LD)", color: T.purple, desc: "워터가 전국 고속도로 휴게소 중심의 전기차 급속충전 네트워크를 운영한다는 사실을 AI가 정확하게 이해하도록 구조화하는 코드입니다." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "14px 16px", background: `${T.bg}cc`, borderLeft: `2px solid ${item.color}`, alignItems: "flex-start" }}>
                    <span className="sans" style={{ fontSize: 12, fontWeight: 500, color: item.color, minWidth: 140, paddingTop: 2, letterSpacing: 0.5 }}>{item.file}</span>
                    <span style={{ fontSize: 12, color: T.textDim, lineHeight: 1.7, fontWeight: 400 }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === DIAGNOSIS === */}
        {activeSection === "diagnosis" && (
          <div className="section">
            <div style={{ marginBottom: 28 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>웹사이트 기술 진단</h2>
              <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400, lineHeight: 1.8 }}>AI 크롤러 관점에서 watercharging.com 구조·콘텐츠·기술 요소 분석. 항목 선택 시 상세 확인.</p>
            </div>

            <div className="sans" style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 11, color: T.textDim }}>
              {[["미적용", T.bad, criticalCount], ["미확인", T.warn, warningCount], ["양호", T.good, goodCount]].map(([l, c, n]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: c, display: "inline-block" }} />{l} ({n})
                </span>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>실행 과제</div>
                <span className="sans" style={{ fontSize: 10, color: T.teal, padding: "2px 10px", background: T.tealSoft, border: `1px solid ${T.tealBorder}` }}>한 번 실행 후 완료</span>
              </div>
              {diagnosisActionItems.map((item, i) => (
                <div key={i} className="diag-row" onClick={() => setExpandedDiag(expandedDiag === `a${i}` ? null : `a${i}`)} style={{ background: expandedDiag === `a${i}` ? T.accentSoft : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <StatusBadge status={item.status} />
                      <span style={{ fontSize: 14, fontWeight: 400 }}>{item.name}</span>
                    </div>
                    <ScopeBadge scope={item.scope} />
                  </div>
                  {expandedDiag === `a${i}` && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400, marginBottom: 10 }}>{item.detail}</div>
                      <div style={{ fontSize: 13, color: T.teal, lineHeight: 1.7, fontWeight: 400 }}>→ {item.action}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>주기적 모니터링</div>
                <span className="sans" style={{ fontSize: 10, color: T.warn, padding: "2px 10px", background: T.warnSoft, border: `1px solid ${T.warnBorder}` }}>지속 관리 필요</span>
              </div>
              {diagnosisMonitorItems.map((item, i) => (
                <div key={i} className="diag-row" onClick={() => setExpandedDiag(expandedDiag === `m${i}` ? null : `m${i}`)} style={{ background: expandedDiag === `m${i}` ? T.accentSoft : "transparent" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <StatusBadge status={item.status} />
                      <span style={{ fontSize: 14, fontWeight: 400 }}>{item.name}</span>
                    </div>
                    <ScopeBadge scope={item.scope} />
                  </div>
                  {expandedDiag === `m${i}` && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400, marginBottom: 10 }}>{item.detail}</div>
                      <div style={{ fontSize: 13, color: T.teal, lineHeight: 1.7, fontWeight: 400 }}>→ {item.action}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === AI TEST (abbreviated — keeping all functional blocks, restyled) === */}
        {activeSection === "ai_test" && (
          <div className="section">
            <div style={{ marginBottom: 24 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>AI 노출 테스트</h2>
              <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400, lineHeight: 1.8, marginBottom: 12 }}>16개 프롬프트 × 5개 AI. 웹 검색 OFF 기준 — AI가 학습 데이터만으로 워터를 얼마나 인지하는지 측정합니다.</p>
              <div style={{ padding: "10px 14px", background: T.warnSoft, border: `1px solid ${T.warnBorder}`, fontSize: 12, color: T.textSub, fontWeight: 400 }}>
                ⚠ <span style={{ color: T.warn, fontWeight: 500 }}>1인 1회 측정 · Phase 3 재측정 예정</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              {[
                { label: "ChatGPT", key: "chatgpt", color: T.warn, note: null },
                { label: "Claude", key: "claude", color: T.bad, note: null },
                { label: "Gemini", key: "gemini", color: T.good, note: null },
                { label: "Grok", key: "grok", color: T.bad, note: "오답 위험" },
                { label: "Perplexity", key: "perplexity", color: T.bad, note: null },
              ].map((ai, i) => {
                const mentions = livePrompts.filter(p => p[ai.key] > 0).length;
                return (
                  <div key={i} style={{ flex: 1, minWidth: 110, background: T.surface, border: `1px solid ${T.border}`, padding: "16px 12px", textAlign: "center" }}>
                    <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>{ai.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: ai.color, lineHeight: 1 }}>{mentions}</div>
                    <div className="sans" style={{ fontSize: 10, color: T.textDim, marginTop: 3 }}>/ {livePrompts.length}개 언급</div>
                    {ai.note && <div className="sans" style={{ fontSize: 9, color: T.bad, marginTop: 4, padding: "1px 6px", background: T.badSoft, display: "inline-block" }}>{ai.note}</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[
                { text: "AI마다 결과가 다릅니다.", sub: "Gemini는 3개 언급하고, Grok은 \"존재하지 않는 서비스\"라고 단언합니다.", color: T.bad, soft: T.badSoft, border: T.badBorder },
                { text: "이름을 직접 물어야 겨우 인지하는 수준입니다.", sub: "\"급속충전기 추천해줘\" 같은 자연스러운 질문에서는 워터가 등장하지 않습니다.", color: T.warn, soft: T.warnSoft, border: T.warnBorder },
                { text: "근본 원인은 구조화 데이터 부재입니다.", sub: "Schema.org, llms.txt, FAQ 없이는 AI가 워터를 체계적으로 학습할 경로가 없습니다.", color: T.good, soft: T.goodSoft, border: T.goodBorder },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 18px", border: `1px solid ${item.border}`, background: item.soft, fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400 }}>
                  <span style={{ color: item.color, fontWeight: 500 }}>{item.text}</span> {item.sub}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>프롬프트별 상세 결과 (웹 검색 OFF)</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {["전체", ...cats].map(c => (
                <button key={c} className={`filter-btn ${aiTestFilter === c ? "active" : ""}`} onClick={() => setAiTestFilter(c)}>{c}</button>
              ))}
            </div>
            <div className="sans" style={{ display: "grid", gridTemplateColumns: "40px 1fr repeat(5, 42px)", gap: 4, padding: "8px 10px", fontSize: 10, color: T.textDim, borderBottom: `1px solid ${T.border}`, marginBottom: 4, letterSpacing: 0.5 }}>
              <span>#</span><span>프롬프트</span>
              <span style={{ textAlign: "center" }}>GPT</span><span style={{ textAlign: "center" }}>Claude</span><span style={{ textAlign: "center" }}>Gemini</span><span style={{ textAlign: "center" }}>Grok</span><span style={{ textAlign: "center" }}>Perp.</span>
            </div>
            {filteredPrompts.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr repeat(5, 42px)", gap: 4, padding: "10px", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <span className="sans" style={{ fontSize: 10, color: T.textDim }}>{p.id}</span>
                <span style={{ fontSize: 12, fontWeight: 400 }}>{p.kr}</span>
                {["chatgpt", "claude", "gemini", "grok", "perplexity"].map(ai => (
                  <div key={ai} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: p[ai] > 0 ? T.good : T.bad }}>{p[ai] > 0 ? "●" : "○"}</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="sans" style={{ marginTop: 6, fontSize: 11, color: T.textDim }}>● 언급 &nbsp; ○ 미언급</div>

            {/* ON vs OFF */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>웹 검색 ON vs OFF 비교</div>
              <p style={{ fontSize: 12, color: T.textDim, marginBottom: 14, fontWeight: 400 }}>웹 검색 OFF는 학습 데이터 기반 인지도, ON은 실제 사용 환경 노출입니다.</p>
              <div style={{ border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 14 }}>
                <div className="sans" style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: 4, padding: "8px 14px", fontSize: 10, color: T.textDim, background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, letterSpacing: 0.5 }}>
                  <span>AI</span><span style={{ textAlign: "center" }}>OFF</span><span style={{ textAlign: "center" }}>ON</span><span style={{ textAlign: "center" }}>변화</span>
                </div>
                {[
                  { ai: "ChatGPT", off: livePrompts.filter(p=>p.chatgpt>0).length, on: livePrompts.filter(p=>p.chatgpt_on>0).length, note: "웹 검색 ON 시 고속도로·비교 맥락에서 언급" },
                  { ai: "Claude", off: livePrompts.filter(p=>p.claude>0).length, on: livePrompts.filter(p=>p.claude_on>0).length, note: "웹 검색 ON 시 뉴스 기사 기반 전면 인지" },
                  { ai: "Gemini", off: livePrompts.filter(p=>p.gemini>0).length, on: livePrompts.filter(p=>p.gemini_on>0).length, note: "OFF/ON 차이 가장 극명" },
                  { ai: "Grok", off: livePrompts.filter(p=>p.grok>0).length, on: livePrompts.filter(p=>p.grok_on>0).length, note: "웹 검색 ON 시 고속도로 1위 수준으로 급등" },
                  { ai: "Perplexity", off: livePrompts.filter(p=>p.perplexity>0).length, on: livePrompts.filter(p=>p.perplexity_on>0).length, note: "웹 검색 ON 시 가장 높은 언급률" },
                ].map((r, i, arr) => {
                  const diff = r.on - r.off;
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: 4, padding: "12px 14px", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{r.ai}</div>
                        <div style={{ fontSize: 11, color: T.textDim, fontWeight: 400 }}>{r.note}</div>
                      </div>
                      <span className="sans" style={{ fontSize: 13, fontWeight: 500, color: r.off >= 8 ? T.good : r.off >= 3 ? T.warn : T.bad, textAlign: "center" }}>{r.off}/16</span>
                      <span className="sans" style={{ fontSize: 13, fontWeight: 500, color: r.on >= 8 ? T.good : r.on >= 3 ? T.warn : T.bad, textAlign: "center" }}>{r.on}/16</span>
                      <span className="sans" style={{ fontSize: 13, fontWeight: 600, color: diff > 0 ? T.good : T.textDim, textAlign: "center" }}>{diff > 0 ? `+${diff}` : diff}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "14px 18px", border: `1px solid ${T.purpleBorder}`, background: T.purpleSoft, fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400 }}>
                <span style={{ color: T.purple, fontWeight: 500 }}>언론 보도는 충분합니다. 구조화 데이터가 없습니다.</span> llms.txt · Schema.org 배포 후 웹 검색 ON 환경에서 즉각적인 개선 효과를 기대할 수 있습니다.
              </div>
            </div>

            {/* 타CPO 비교 */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>타 CPO 인지도 비교 (웹 검색 OFF)</div>
              <p style={{ fontSize: 12, color: T.textDim, marginBottom: 14, fontWeight: 400 }}>CPO 이름 없이 자연스러운 질문 16개를 동일하게 실행했을 때 AI가 자발적으로 언급한 횟수입니다.</p>
              <div style={{ border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 14 }}>
                <div className="sans" style={{ display: "grid", gridTemplateColumns: "1.6fr 70px 70px 70px 70px 70px 70px", gap: 4, padding: "8px 14px", fontSize: 10, color: T.textDim, background: T.surfaceAlt, borderBottom: `1px solid ${T.border}` }}>
                  <span>사업자</span><span style={{textAlign:"center"}}>ChatGPT</span><span style={{textAlign:"center"}}>Claude</span><span style={{textAlign:"center"}}>Gemini</span><span style={{textAlign:"center"}}>Grok</span><span style={{textAlign:"center"}}>Perplexity</span><span style={{textAlign:"center"}}>합계</span>
                </div>
                {[
                  { name: "환경부 (공공)", gpt: 16, claude: 16, gemini: 16, grok: 16, perp: 16 },
                  { name: "현대자동차 (E-pit)", gpt: 12, claude: 14, gemini: 14, grok: 13, perp: 13 },
                  { name: "SK일렉링크", gpt: 11, claude: 13, gemini: 12, grok: 12, perp: 11 },
                  { name: "한국전력 (KEPCO Plug)", gpt: 9, claude: 11, gemini: 10, grok: 9, perp: 8 },
                  { name: "채비 (Chaevi)", gpt: 7, claude: 9, gemini: 8, grok: 8, perp: 9 },
                  { name: "이지차저", gpt: 5, claude: 5, gemini: 5, grok: 5, perp: 4 },
                  { name: "SK시그넷", gpt: 4, claude: 4, gemini: 4, grok: 4, perp: 3 },
                ].map((c, i, arr) => {
                  const total = c.gpt + c.claude + c.gemini + c.grok + c.perp;
                  const vals = [c.gpt, c.claude, c.gemini, c.grok, c.perp];
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 70px 70px 70px 70px 70px 70px", gap: 4, padding: "10px 14px", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <span style={{ fontSize: 13, fontWeight: 400 }}>{c.name}</span>
                      {vals.map((v, j) => (
                        <span key={j} className="sans" style={{ fontSize: 13, fontWeight: 500, color: v >= 12 ? T.good : v >= 6 ? T.warn : T.bad, textAlign: "center" }}>{v}/16</span>
                      ))}
                      <span className="sans" style={{ fontSize: 13, fontWeight: 600, color: T.purple, textAlign: "center" }}>{total}/80</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "14px 18px", border: `1px solid ${T.badBorder}`, background: T.badSoft, fontSize: 13, color: T.textSub, lineHeight: 1.8, fontWeight: 400 }}>
                <span style={{ color: T.bad, fontWeight: 500 }}>water (워터)</span> — 자연 질문 16개에서 5개 AI 모두 <span style={{ color: T.bad, fontWeight: 500 }}>0/80 미언급</span>. 타 CPO는 웹 검색 없이도 AI가 알고 있는 반면, 워터는 이름을 직접 물어야 겨우 인지합니다.
              </div>
            </div>

            {/* 개선 시뮬레이션 */}
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>개선 시뮬레이션</div>
              <p style={{ fontSize: 12, color: T.textDim, marginBottom: 14, fontWeight: 400 }}>Phase 1 - 2 완료 후 3 - 6개월 내 예상 변화 (업계 AEO 사례 기반 보수적 추정)</p>
              {[
                { ai: "ChatGPT", key: "chatgpt", after: 10, color: T.warn, reason: "Schema.org + 영문 콘텐츠 적용 시 서비스 발견·비교 개선 예상" },
                { ai: "Claude", key: "claude", after: 8, color: T.bad, reason: "llms.txt + FAQ 구조화 시 크롤러 접근 개선" },
                { ai: "Gemini", key: "gemini", after: 8, color: T.good, reason: "이미 일부 학습. Schema 강화 시 더 많은 맥락에서 언급" },
                { ai: "Grok", key: "grok", after: 6, color: T.bad, reason: "영문 뉴스 확대 및 구조화 데이터 적용 시 오답 해소" },
                { ai: "Perplexity", key: "perplexity", after: 10, color: T.teal, reason: "검색 기반 AI로 웹사이트 구조화 후 즉각 반영 가능성 높음" },
              ].map((s, i) => {
                const now = livePrompts.filter(p => p[s.key] > 0).length;
                const total = livePrompts.length;
                return (
                  <div key={i} style={{ marginBottom: 10, padding: 16, border: `1px solid ${T.border}`, background: T.surface }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: s.color, minWidth: 80 }}>{s.ai}</span>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                        <span className="sans" style={{ fontSize: 13, fontWeight: 600, color: T.bad, minWidth: 36 }}>{now}/{total}</span>
                        <div style={{ flex: 1, position: "relative", height: 4, background: `${T.textDim}20` }}>
                          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(now/total)*100}%`, background: T.bad }} />
                          <div style={{ position: "absolute", left: `${(now/total)*100}%`, top: 0, height: "100%", width: `${((s.after-now)/total)*100}%`, background: s.color, opacity: 0.6 }} />
                        </div>
                        <span className="sans" style={{ fontSize: 13, fontWeight: 600, color: s.color, minWidth: 36 }}>{s.after}/{total}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: T.textDim, paddingLeft: 94, fontWeight: 400 }}>{s.reason}</div>
                  </div>
                );
              })}
              <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
                <div style={{ flex: 1, padding: 16, background: T.surface, border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 4 }}>현재 평균</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: T.bad }}>{Math.round(AIS.reduce((s,k)=>s+livePrompts.filter(p=>p[k]>0).length,0)/5)}<span style={{ fontSize: 12 }}>/{livePrompts.length}</span></div>
                </div>
                <div style={{ flex: 1, padding: 16, background: T.goodSoft, border: `1px solid ${T.goodBorder}`, textAlign: "center" }}>
                  <div className="sans" style={{ fontSize: 10, color: T.textDim, marginBottom: 4 }}>Phase 1 - 2 후 예상</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: T.good }}>8<span style={{ fontSize: 12 }}>/{livePrompts.length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === MAP === */}
        {activeSection === "map" && (
          <div className="section">
            <div style={{ marginBottom: 20 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>충전소 노출 채널 체크리스트</h2>
              <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400, lineHeight: 1.8 }}>대표님 과제 #6. 서비스 기획이 매뉴얼 설계 주도, 실제 수행은 유관부서. 22개 채널 전수 확인 기준.</p>
            </div>
            <div className="sans" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18, padding: "12px 16px", background: T.surfaceAlt, border: `1px solid ${T.border}`, fontSize: 11, color: T.textDim }}>
              {[[T.good,"노출 ✓"],[T.warn,"이슈 ⚠"],[T.bad,"미노출"],[T.textDim,"미확인"]].map(([c,l]) => (
                <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: c, display: "inline-block" }} />{l}
                </span>
              ))}
              <span style={{ marginLeft: "auto", color: T.textDim }}>확인 항목: 노출상태 · 명칭일치 · 주소일치 · 운영시간</span>
            </div>

            <div style={{ marginBottom: 20, padding: "16px 18px", border: `1px solid ${T.purpleBorder}`, background: T.purpleSoft }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.purple, marginBottom: 12 }}>데이터 흐름 구조 — 왜 여러 앱에 동시에 뜨는가</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                {[
                  { step: "①", title: "환경공단 (원천)", desc: "대부분 앱이 이 API를 구독", color: T.good },
                  { step: "②", title: "지도 앱 POI", desc: "카카오·네이버는 자체 POI 별도. 직접 수정 신청 필요", color: T.warn },
                  { step: "③", title: "Google·Apple", desc: "환경공단 API 미사용. 직접 등록 필요", color: T.bad },
                  { step: "④", title: "CPO 자체앱", desc: "로밍 협약 있는 CPO 앱에 자동 노출", color: T.textDim },
                ].map(f => (
                  <div key={f.step} style={{ padding: "10px 12px", background: T.surface, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: f.color, marginBottom: 4 }}>{f.step} {f.title}</div>
                    <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, fontWeight: 400 }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20, padding: "12px 16px", border: `1px solid ${T.border}`, background: T.surface }}>
              <div className="sans" style={{ fontSize: 11, fontWeight: 500, color: T.textDim, marginBottom: 8, letterSpacing: 1 }}>로고 표기 범례</div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[["Water", T.good, "신규 로고 — 정상"], ["Water (구)", T.textDim, "구 로고 — 교체 필요"], ["BEP", T.teal, "'BEP' 텍스트 — 브랜드 미일치"], ["없음", T.bad, "로고 미등록"]].map(([l, c, d]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span className="sans" style={{ fontSize: 11, fontWeight: 600, color: c, minWidth: 56 }}>{l}</span>
                    <span style={{ fontSize: 11, color: T.textDim, fontWeight: 400 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {(() => {
              const sc = { "노출": T.good, "노출(이슈)": T.warn, "미노출": T.bad, "미확인": T.textDim };
              const sl = { "노출": "노출 ✓", "노출(이슈)": "이슈 ⚠", "미노출": "미노출", "미확인": "미확인" };
              const mc = { "맞음": T.good, "이슈 ⚠": T.warn, "미노출": T.bad, "미확인": T.textDim };
              const ml = { "맞음": "✓", "이슈 ⚠": "⚠", "미노출": "✗", "미확인": "—" };
              const logoC = { "Water": T.good, "Water (구)": T.textDim, "BEP": T.teal, "없음": T.bad };
              const COLS = "1.4fr 70px 44px 44px 44px 64px 1fr 64px 72px";
              const groups = [...new Set(liveChannels.map(p => p.group))];
              return (
                <div style={{ border: `1px solid ${T.border}`, overflow: "hidden" }}>
                  <div className="sans" style={{ display: "grid", gridTemplateColumns: COLS, gap: 6, padding: "8px 14px", fontSize: 10, color: T.textDim, background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`, letterSpacing: 0.5 }}>
                    <span>채널명</span><span>노출 상태</span>
                    <span style={{textAlign:"center"}}>명칭</span><span style={{textAlign:"center"}}>주소</span><span style={{textAlign:"center"}}>운영시간</span>
                    <span style={{textAlign:"center"}}>로고</span><span>비고</span><span style={{textAlign:"center"}}>담당</span><span style={{textAlign:"center"}}>확인일자</span>
                  </div>
                  {groups.map(group => (
                    <div key={group}>
                      <div style={{ padding: "7px 14px", background: T.accentSoft, borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }}>
                        <span className="sans" style={{ fontSize: 10, fontWeight: 600, color: T.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>{group}</span>
                      </div>
                      {liveChannels.filter(p => p.group === group).map((p, i, arr) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: COLS, gap: 6, padding: "11px 14px", alignItems: "center", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", background: p.status === "노출" ? T.goodSoft : p.status === "노출(이슈)" ? T.warnSoft : p.status === "미노출" ? T.badSoft : "transparent" }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                            {p.source && <span style={{ fontSize: 10, color: T.textDim, marginLeft: 6, fontWeight: 400 }}>{p.source}</span>}
                          </div>
                          <span className="sans" style={{ fontSize: 11, fontWeight: 600, color: sc[p.status] }}>{sl[p.status]}</span>
                          {[p.nameMatch, p.addressMatch, p.hoursMatch].map((v, j) => (
                            <span key={j} style={{ fontSize: 14, fontWeight: 600, color: mc[v] || T.textDim, textAlign: "center" }}>{ml[v] || "—"}</span>
                          ))}
                          <span className="sans" style={{ fontSize: 11, fontWeight: 500, color: logoC[p.logo] || T.textDim, textAlign: "center" }}>{p.logo || "—"}</span>
                          <span style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, fontWeight: 400 }}>{p.note || ""}</span>
                          <span className="sans" style={{ fontSize: 11, fontWeight: 500, color: p.manager === "김도연" ? T.bad : T.textDim, textAlign: "center" }}>{p.manager || "—"}</span>
                          <span className="sans" style={{ fontSize: 11, color: p.checkedDate ? T.good : T.textDim, textAlign: "center" }}>{p.checkedDate || "—"}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}

            <div style={{ marginTop: 12, padding: "14px 18px", border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.textDim, marginBottom: 10 }}>확인 우선순위 권고</div>
              {[
                { rank: "1순위", items: "환경공단 ev.or.kr", desc: "여기가 맞으면 대부분 자동 해결", color: T.bad },
                { rank: "2순위", items: "카카오맵 · 네이버지도 · 티맵", desc: "실사용자 수 가장 많음", color: T.warn },
                { rank: "3순위", items: "EV Infra · 모두의충전", desc: "전기차 전용 앱 주 이용자", color: T.warn },
                { rank: "4순위", items: "Google Maps · Apple Maps", desc: "외국인 및 일반 검색 유입", color: T.good },
                { rank: "5순위", items: "CPO 자체앱 (로밍 협약사)", desc: "로밍 협약 현황 확인 후 점검", color: T.textDim },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", fontSize: 13, alignItems: "baseline" }}>
                  <span className="sans" style={{ fontSize: 12, fontWeight: 600, color: r.color, minWidth: 40 }}>{r.rank}</span>
                  <span style={{ fontWeight: 400, minWidth: 180 }}>{r.items}</span>
                  <span style={{ color: T.textDim, fontWeight: 400 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ACTION === */}
        {activeSection === "action" && (
          <div className="section">
            <div style={{ marginBottom: 20 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>서비스 기획 액션플랜</h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400 }}>서비스 기획 직접 할당 범위. 설계는 서비스 기획, 매뉴얼 기반 실행은 유관부서.</p>
                <span className="sans" style={{ fontSize: 11, padding: "3px 10px", background: T.goodSoft, border: `1px solid ${T.goodBorder}`, color: T.good, fontWeight: 500, flexShrink: 0 }}>
                  설계 완료 {liveActionItems.filter(a=>a.done).length}/{liveActionItems.length}
                </span>
              </div>
            </div>

            <div className="sans" style={{ display: "grid", gridTemplateColumns: "44px 1fr 70px 50px 70px 50px", gap: 8, padding: "8px 14px", fontSize: 10, color: T.textDim, borderBottom: `1px solid ${T.border}`, letterSpacing: 0.5, marginBottom: 4 }}>
              <span>상태</span><span>과제</span><span>기간</span><span>난이도</span><span>협업</span><span>CEO</span>
            </div>

            {liveActionItems.map((a, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr 70px 50px 70px 50px", gap: 8, padding: "14px 16px", borderBottom: `1px solid ${T.border}`, alignItems: "center", fontSize: 13, background: a.done ? T.goodSoft : "transparent" }}>
                <span style={{ fontSize: 14, textAlign: "center" }}>{a.done ? "✓" : "○"}</span>
                <span style={{ fontWeight: 400, color: a.done ? T.good : T.text }}>{a.task}{a.done ? " — 설계 완료" : ""}</span>
                <span className="sans" style={{ fontSize: 11, color: T.textDim }}>{a.period}</span>
                <span className="sans" style={{ fontSize: 11, color: T.textDim }}>{a.difficulty}</span>
                <span className="sans" style={{ fontSize: 11, color: T.teal }}>{a.collab}</span>
                <span className="sans" style={{ fontSize: 11, color: T.purple, fontWeight: 500 }}>{a.ceo}</span>
              </div>
            ))}

            <div style={{ marginTop: 28, padding: 24, border: `1px solid ${T.purpleBorder}`, background: T.purpleSoft }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.purple, marginBottom: 12 }}>핵심 용어 참고</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["AEO","AI 답변 엔진에서 브랜드 노출 최적화"],["GEO","생성형 검색 결과 노출 최적화"],["Schema.org","AI가 이해하는 표준 구조화 데이터"],["llms.txt","AI 크롤러용 사이트 가이드 파일"],["E-E-A-T","AI가 콘텐츠 신뢰도 평가하는 기준"],["Citation","AI 답변 시 출처 참조/링크"]].map(([term, desc], i) => (
                  <div key={i} style={{ fontSize: 13, lineHeight: 1.6 }}>
                    <span style={{ color: T.purple, fontWeight: 500 }}>{term}</span>
                    <span style={{ color: T.textDim, fontWeight: 400 }}> — {desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === TIMELINE === */}
        {activeSection === "timeline" && (
          <div className="section">
            <div style={{ marginBottom: 28 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>실행 타임라인</h2>
              <p style={{ fontSize: 13, color: T.textDim, fontWeight: 400, lineHeight: 1.8 }}>서비스 기획 담당 범위 내 4개 Phase.</p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {phases.map((p, i) => {
                const ss = { "완료": { bg: T.goodSoft, color: T.good, label: "완료" }, "진행중": { bg: T.tealSoft, color: T.teal, label: "진행 중" }, "예정": { bg: `${T.textDim}10`, color: T.textDim, label: "예정" } }[p.status];
                return (
                  <div key={i} className="phase-card" style={{ borderLeft: `3px solid ${p.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="sans" style={{ fontSize: 10, fontWeight: 500, color: p.color, letterSpacing: 1.5, textTransform: "uppercase" }}>Phase {p.phase}</span>
                        <span className="serif" style={{ fontSize: 16 }}>{p.name}</span>
                        <span className="sans" style={{ fontSize: 10, padding: "3px 10px", background: ss.bg, color: ss.color, letterSpacing: 0.5 }}>{ss.label}</span>
                      </div>
                      <span className="sans" style={{ fontSize: 11, color: T.textDim }}>{p.period}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {p.items.map((item, j) => (
                        <span key={j} className="sans" style={{ fontSize: 11, padding: "6px 14px", background: item.includes("✓") ? T.goodSoft : "transparent", border: `1px solid ${item.includes("✓") ? T.goodBorder : item.startsWith("→") ? `${p.color}30` : T.border}`, color: item.includes("✓") ? T.good : item.startsWith("→") ? p.color : T.textSub, fontWeight: 400 }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ width: "100%", height: 1, background: T.border, margin: "28px 0" }} />

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 200, padding: 20, border: `1px solid ${T.tealBorder}`, background: T.tealSoft }}>
                <div className="sans" style={{ fontSize: 9, color: T.teal, letterSpacing: 2, marginBottom: 8 }}>과제 #1 연결</div>
                <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, fontWeight: 400 }}>위키피디아·공개 지식 DB 보완이 핵심 목표. Schema.org, llms.txt, FAQ 설계·산출이 서비스 기획 기여 범위</div>
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: 20, border: `1px solid ${T.accent}30`, background: T.accentSoft }}>
                <div className="sans" style={{ fontSize: 9, color: T.accent, letterSpacing: 2, marginBottom: 8 }}>과제 #6 연결</div>
                <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, fontWeight: 400 }}>22개 채널 전수조사 + 체크리스트 + 모니터링 매뉴얼 설계 → 매뉴얼 기반 실제 수행은 유관부서</div>
              </div>
            </div>

            <div style={{ padding: 24, border: `1px solid ${T.purpleBorder}`, background: T.purpleSoft }}>
              <div className="sans" style={{ fontSize: 9, color: T.purple, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Phase 3 이후 — 장기 비전</div>
              <p style={{ fontSize: 13, color: T.textSub, lineHeight: 2, fontWeight: 400 }}>
                대표님께서는 과제 지시 전 Claude와의 대화에서 <span style={{ color: T.text, fontWeight: 500 }}>MCP(Model Context Protocol) 서버 구축</span>을 장기 목표로 언급했습니다.
                사용자가 AI에게 "서울-부산 중간에 충전 예약해줘"라고 하면 AI가 워터 서버를 직접 호출해 예약·결제까지 완료하는 구조입니다.
                한국 CPO 최초 구현 시 강력한 차별화 포인트이자 PR 소재가 됩니다.
                Phase 1~2의 구조화 데이터 작업이 이 장기 비전의 기술적 토대입니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "28px 44px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surfaceAlt }}>
        <span className="serif" style={{ fontSize: 20, color: T.textDim }}>water<span style={{ color: T.accent }}>.</span></span>
        <span className="sans" style={{ fontSize: 10, color: T.textDim, letterSpacing: 2 }}>AI Legibility Project · 서비스 기획 · 2026.03 · Confidential</span>
      </div>

      {/* ── 비밀번호 모달 ── */}
      {showAdminPw && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,24,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: T.bg, border: `1px solid ${T.border}`, padding: 32, width: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>관리자 로그인</div>
            <div style={{ fontSize: 12, color: T.textDim, marginBottom: 16, fontWeight: 400 }}>비밀번호 6자리를 입력하세요.</div>
            <input type="password" value={adminPw} onChange={e => setAdminPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminLogin()} maxLength={6} placeholder="••••••" autoFocus
              style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, padding: "10px 14px", fontSize: 18, width: "100%", outline: "none", letterSpacing: 8, textAlign: "center", boxSizing: "border-box" }} />
            {pwError && <div style={{ fontSize: 12, color: T.bad, marginTop: 8 }}>{pwError}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAdminPw(false)} style={{ flex: 1, padding: 9, border: `1px solid ${T.border}`, background: "transparent", color: T.textDim, cursor: "pointer", fontSize: 12 }}>취소</button>
              <button onClick={handleAdminLogin} style={{ flex: 1, padding: 9, border: "none", background: T.accent, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 관리자 편집 패널 ── */}
      {adminMode && (
        <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 150, overflowY: "auto" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>관리자 편집 모드</div>
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 2, fontWeight: 400 }}>변경 사항은 1초 후 자동 저장됩니다.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {syncStatus && <span className="sans" style={{ fontSize: 12, color: syncStatus === "자동 저장됨" ? T.teal : T.bad }}>● {syncStatus}</span>}
                <button onClick={handleAdminClose} style={{ background: T.badSoft, border: `1px solid ${T.badBorder}`, color: T.bad, padding: "8px 18px", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>✕ 닫기</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[["ai", "AI 노출 테스트"], ["channel", "충전소 채널"], ["action", "액션플랜"]].map(([k, label]) => (
                <button key={k} onClick={() => setAdminTab(k)} className="sans"
                  style={{ padding: "7px 16px", cursor: "pointer", fontSize: 12, border: `1px solid ${adminTab === k ? T.accent : T.border}`, background: adminTab === k ? T.accentSoft : "transparent", color: adminTab === k ? T.accent : T.textDim }}>
                  {label}
                </button>
              ))}
            </div>

            {adminTab === "ai" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span className="sans" style={{ fontSize: 12, color: T.textDim }}>웹 검색</span>
                  {["off", "on"].map(m => (
                    <button key={m} onClick={() => setAiAdminMode(m)} className="sans"
                      style={{ padding: "4px 12px", cursor: "pointer", fontSize: 11, border: `1px solid ${aiAdminMode === m ? T.tealBorder : T.border}`, background: aiAdminMode === m ? T.tealSoft : "transparent", color: aiAdminMode === m ? T.teal : T.textDim }}>
                      {m.toUpperCase()}
                    </button>
                  ))}
                  <span className="sans" style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>☑ = 워터 언급 · ☐ = 미언급</span>
                </div>
                {cats.map(cat => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div className="sans" style={{ fontSize: 11, fontWeight: 500, color: T.text, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                    <div style={{ border: `1px solid ${T.border}`, overflow: "hidden" }}>
                      <div className="admin-row" style={{ gridTemplateColumns: "1fr 52px 52px 52px 52px 52px", background: T.surfaceAlt }}>
                        <div className="sans" style={{ fontSize: 11, color: T.textDim }}>프롬프트</div>
                        {AIS.map(ai => <div key={ai} className="sans" style={{ fontSize: 11, color: T.textDim, textAlign: "center" }}>{AI_LABELS[ai].slice(0,4)}</div>)}
                      </div>
                      {livePrompts.map((p, i) => p.cat !== cat ? null : (
                        <div key={p.id} className="admin-row" style={{ gridTemplateColumns: "1fr 52px 52px 52px 52px 52px" }}>
                          <div style={{ fontSize: 11, color: T.textSub }}><span style={{ color: T.teal, marginRight: 6 }}>{p.id}</span>{p.kr}</div>
                          {AIS.map(ai => {
                            const key = aiAdminMode === "off" ? ai : ai + "_on";
                            return (
                              <div key={ai} onClick={() => togglePrompt(i, key)} style={{ textAlign: "center", fontSize: 16, cursor: "pointer", userSelect: "none" }}>{p[key] ? "☑" : "☐"}</div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "channel" && (
              <div>
                {[...new Set(liveChannels.map(c => c.group))].map(group => (
                  <div key={group} style={{ marginBottom: 18 }}>
                    <div className="sans" style={{ fontSize: 11, fontWeight: 500, color: T.text, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{group}</div>
                    <div style={{ border: `1px solid ${T.border}`, marginBottom: 6 }}>
                      <div className="admin-row" style={{ gridTemplateColumns: "110px 110px 84px 60px 60px 60px 60px 1fr 32px", background: T.surfaceAlt }}>
                        {["그룹", "채널명", "노출 상태", "명칭", "주소", "시간", "로고", "비고", ""].map(h => (
                          <div key={h} className="sans" style={{ fontSize: 11, color: T.textDim }}>{h}</div>
                        ))}
                      </div>
                      {liveChannels.map((c, i) => c.group !== group ? null : (
                        <div key={i} className="admin-row" style={{ gridTemplateColumns: "110px 110px 84px 60px 60px 60px 60px 1fr 32px" }}>
                          <select className="admin-select" value={c.group} onChange={e => updateChannel(i, "group", e.target.value)}>
                            {["공공·정부","통합 충전 플랫폼","CPO 자체앱 (로밍)","지도·내비 앱","OEM·차량 연동","글로벌·기타"].map(g => <option key={g}>{g}</option>)}
                          </select>
                          <input className="admin-input" value={c.name} onChange={e => updateChannel(i, "name", e.target.value)} />
                          <select className="admin-select" value={c.status} onChange={e => updateChannel(i, "status", e.target.value)}>
                            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <select className="admin-select" value={c.nameMatch} onChange={e => updateChannel(i, "nameMatch", e.target.value)}>
                            {MATCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <select className="admin-select" value={c.addressMatch} onChange={e => updateChannel(i, "addressMatch", e.target.value)}>
                            {MATCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <select className="admin-select" value={c.hoursMatch} onChange={e => updateChannel(i, "hoursMatch", e.target.value)}>
                            {MATCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <input className="admin-input" value={c.logo || ""} onChange={e => updateChannel(i, "logo", e.target.value)} />
                          <input className="admin-input" value={c.note || ""} onChange={e => updateChannel(i, "note", e.target.value)} />
                          <button onClick={e => { e.stopPropagation(); removeChannel(i); }} style={{ background: T.badSoft, border: `1px solid ${T.badBorder}`, color: T.bad, cursor: "pointer", fontSize: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setLiveChannels(prev => [...prev, { group, name: "새 채널", checkedDate: "", operator: "", source: "", priority: "중간", status: "미확인", nameMatch: "미확인", addressMatch: "미확인", hoursMatch: "미확인", logo: "", manager: "", note: "" }])} style={{ padding: "6px 14px", border: `1px dashed ${T.accent}50`, background: "transparent", color: T.accent, cursor: "pointer", fontSize: 11, width: "100%" }}>
                      + {group} 채널 추가
                    </button>
                  </div>
                ))}
              </div>
            )}

            {adminTab === "action" && (
              <div>
                <div style={{ border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 8 }}>
                  <div className="admin-row" style={{ gridTemplateColumns: "1fr 80px 50px 50px 50px 60px 36px", background: T.surfaceAlt }}>
                    {["과제명", "기간", "난이도", "협업", "CEO", "완료", ""].map(h => (
                      <div key={h} className="sans" style={{ fontSize: 11, color: T.textDim }}>{h}</div>
                    ))}
                  </div>
                  {liveActionItems.map((a, i) => (
                    <div key={i} className="admin-row" style={{ gridTemplateColumns: "1fr 80px 50px 50px 50px 60px 36px" }}>
                      <input className="admin-input" value={a.task} onChange={e => updateActionItem(i, "task", e.target.value)} />
                      <input className="admin-input" value={a.period || ""} onChange={e => updateActionItem(i, "period", e.target.value)} />
                      <select className="admin-select" value={a.difficulty} onChange={e => updateActionItem(i, "difficulty", e.target.value)}>
                        {["하", "중", "상"].map(o => <option key={o}>{o}</option>)}
                      </select>
                      <select className="admin-select" value={a.collab} onChange={e => updateActionItem(i, "collab", e.target.value)}>
                        {["개발", "유관부서", "마케팅", "디자인", "전사"].map(o => <option key={o}>{o}</option>)}
                      </select>
                      <select className="admin-select" value={a.ceo} onChange={e => updateActionItem(i, "ceo", e.target.value)}>
                        {["#1", "#2", "#3", "#4", "#5", "#6"].map(o => <option key={o}>{o}</option>)}
                      </select>
                      <div onClick={() => toggleActionItem(i)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 18, height: 18, border: `2px solid ${a.done ? T.teal : T.border}`, background: a.done ? T.teal : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {a.done && <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>✓</span>}
                        </div>
                        <span className="sans" style={{ fontSize: 11, color: a.done ? T.teal : T.textDim }}>{a.done ? "완료" : "진행중"}</span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeActionItem(i); }} style={{ background: T.badSoft, border: `1px solid ${T.badBorder}`, color: T.bad, cursor: "pointer", fontSize: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={addActionItem} style={{ padding: "8px 16px", border: `1px dashed ${T.tealBorder}`, background: "transparent", color: T.teal, cursor: "pointer", fontSize: 12, width: "100%" }}>+ 과제 추가</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
