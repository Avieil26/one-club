import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const tempDir = (process.env.TEMP || 'C:/Users/aviel/AppData/Local/Temp') + '/fc-career-preview';
const desktopDir = 'C:/Users/aviel/Desktop';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function toB64(filePath, mime = 'image/png') {
  if (!fs.existsSync(filePath)) return '';
  return `data:${mime};base64,` + fs.readFileSync(filePath).toString('base64');
}

const bgB64 = toB64('C:/Users/aviel/Desktop/career-training-hub.png');

// Portraits
const gloukhPhoto = toB64(tempDir + '/gloukh.png');
const khalailiPhoto = toB64(tempDir + '/khalaili.png');
const peretzPhoto = toB64(tempDir + '/peretz.png');
const endrickPhoto = toB64(tempDir + '/endrick.png');
const ardaPhoto = toB64(tempDir + '/arda.png');

// Badges & Flags
const israelFlag = toB64(tempDir + '/israel.png');
const brazilFlag = toB64(tempDir + '/brazil.png');
const turkeyFlag = toB64(tempDir + '/turkey.png');
const salzburgCrest = toB64(tempDir + '/salzburg.png');
const bayernCrest = toB64(tempDir + '/bayern.png');
const realCrest = toB64(tempDir + '/real.png');

const baseCss = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 430px;
    height: 932px;
    overflow: hidden;
    margin: 0;
    padding: 0;
    background: #090e17;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    direction: ltr;
  }
  .screen-wrap {
    width: 430px;
    height: 932px;
    position: relative;
    overflow: hidden;
    direction: rtl;
    display: flex;
    flex-direction: column;
  }
  .bg-photo {
    position: absolute;
    inset: 0;
    width: 430px;
    height: 932px;
    background-image: url('${bgB64}');
    background-size: cover;
    background-position: center top;
    z-index: 0;
  }
  .bg-glass-wash {
    position: absolute;
    inset: 0;
    width: 430px;
    height: 932px;
    background: linear-gradient(180deg, 
      rgba(8, 14, 22, 0.35) 0%, 
      rgba(8, 14, 22, 0.30) 40%, 
      rgba(8, 14, 22, 0.48) 100%
    );
    z-index: 1;
    pointer-events: none;
  }
  .ui-layer {
    position: relative;
    z-index: 2;
    width: 430px;
    height: 932px;
    padding: 34px 16px 20px 16px;
    display: flex;
    flex-direction: column;
  }
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .btn-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 13px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.22);
    backdrop-filter: blur(12px);
    color: #f1f5f9;
    font-size: 11.5px;
    font-weight: 700;
  }
  .fc-career-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(0, 255, 140, 0.16);
    border: 1px solid rgba(0, 255, 140, 0.45);
    backdrop-filter: blur(12px);
    color: #00ff8c;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.5px;
  }
  .fc-career-badge .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00ff8c;
    box-shadow: 0 0 8px #00ff8c;
  }
  .title-block {
    margin-bottom: 10px;
  }
  .title-text {
    font-size: 24px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  }
  .subtitle-text {
    font-size: 11.5px;
    color: #cbd5e1;
    font-weight: 600;
    margin-top: 2px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }
  .category-tabs {
    display: flex;
    gap: 7px;
    margin-bottom: 10px;
    overflow-x: auto;
  }
  .cat-tab {
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(12px);
    color: #94a3b8;
    white-space: nowrap;
  }
  .cat-tab.active {
    background: linear-gradient(135deg, #00ff8c 0%, #00b862 100%);
    color: #022010;
    border-color: #55ffb0;
    box-shadow: 0 0 14px rgba(0, 255, 140, 0.35);
  }
  .cat-tab.israel-pill {
    background: rgba(56, 189, 248, 0.18);
    border-color: rgba(56, 189, 248, 0.45);
    color: #7dd3fc;
  }
  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
  }
  .card-item {
    position: relative;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(14, 24, 38, 0.76) 0%, rgba(9, 16, 26, 0.72) 100%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-top: 1px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(18px);
    box-shadow: 0 10px 26px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.18);
    padding: 11px 13px;
    display: flex;
    gap: 12px;
    align-items: center;
    overflow: hidden;
  }
  .card-item::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #00ff8c 0%, rgba(0, 255, 140, 0.2) 100%);
  }
  .card-item.israel-card::before {
    background: linear-gradient(180deg, #38bdf8 0%, rgba(56, 189, 248, 0.2) 100%);
  }
  .player-cutout-box {
    position: relative;
    width: 78px;
    height: 98px;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-radius: 12px;
    background: radial-gradient(circle at 50% 30%, rgba(35, 52, 75, 0.8) 0%, rgba(12, 20, 32, 0.85) 90%);
    border: 1px solid rgba(255, 255, 255, 0.22);
    box-shadow: 0 6px 14px rgba(0,0,0,0.3);
    overflow: hidden;
  }
  .player-cutout-box img.portrait {
    width: 86px;
    height: auto;
    object-fit: cover;
    transform: translateY(3px);
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.45));
  }
  .pos-badge {
    position: absolute;
    top: 4px;
    right: 4px;
    padding: 2px 5px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    font-size: 8.5px;
    font-weight: 900;
  }
  .card-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .player-name-h3 {
    font-size: 16.5px;
    font-weight: 900;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .growth-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    border-radius: 7px;
    background: rgba(0, 255, 140, 0.16);
    border: 1px solid rgba(0, 255, 140, 0.45);
    color: #00ff8c;
    font-size: 10px;
    font-weight: 900;
    white-space: nowrap;
  }
  .meta-sub-row {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    color: #cbd5e1;
    font-weight: 600;
  }
  .meta-sub-row img.crest {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }
  .meta-sub-row img.flag {
    width: 15px;
    height: 10px;
    object-fit: cover;
    border-radius: 2px;
  }
  .rating-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 9px;
    border-radius: 8px;
    background: rgba(8, 14, 22, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .rating-pair {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .cur-ovr {
    font-size: 16px;
    font-weight: 900;
    color: #ffffff;
  }
  .arrow-symbol {
    font-size: 11px;
    color: #00ff8c;
    font-weight: 900;
  }
  .max-pot {
    font-size: 16px;
    font-weight: 900;
    color: #00ff8c;
    text-shadow: 0 0 10px rgba(0, 255, 140, 0.4);
  }
  .role-chip {
    padding: 2px 7px;
    border-radius: 5px;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.35);
    color: #7dd3fc;
    font-size: 9.5px;
    font-weight: 800;
  }
  .value-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1px;
  }
  .euro-val {
    font-size: 14.5px;
    font-weight: 900;
    color: #38bdf8;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
  }
  .wage-val {
    font-size: 9.5px;
    color: #94a3b8;
    font-weight: 600;
    margin-right: 4px;
  }
  .btn-report {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
  }
  .advisor-strip {
    margin-top: auto;
    padding: 10px 13px;
    border-radius: 12px;
    background: rgba(14, 24, 38, 0.8);
    border: 1px solid rgba(0, 255, 140, 0.35);
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .advisor-icon {
    font-size: 18px;
  }
  .advisor-content {
    font-size: 10.5px;
    color: #e2e8f0;
    line-height: 1.35;
    font-weight: 600;
  }
  .advisor-content strong {
    color: #00ff8c;
    font-weight: 800;
  }
`;

// HTML FOR 15 PLAYERS LIST (FOCUSED ON ISRAELI DUO + ENDRICK)
const scoutListHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>כישרונות על ושחקנים ישראלים בקריירה - EA FC 27</title>
  <style>${baseCss}</style>
</head>
<body>
  <div class="screen-wrap">
    <div class="bg-photo"></div>
    <div class="bg-glass-wash"></div>
    <div class="ui-layer">

      <!-- TOP BAR -->
      <div class="top-row">
        <div class="btn-back-link">‹ חזרה לאתגרים</div>
        <div class="fc-career-badge">
          <span class="dot"></span>
          <span>15 שחקנים מומלצים</span>
        </div>
      </div>

      <!-- TITLE -->
      <div class="title-block">
        <div class="title-text">סקאוטינג כישרונות FC 27</div>
        <div class="subtitle-text">שחקני 70+ עם פוטנציאל אדיר + נציגות ישראלית כחול-לבן</div>
      </div>

      <!-- FILTER PILLS -->
      <div class="category-tabs">
        <div class="cat-tab active">הכל (15)</div>
        <div class="cat-tab israel-pill">🇮🇱 כחול-לבן (3)</div>
        <div class="cat-tab">התקפה (ST/W)</div>
        <div class="cat-tab">קישור (CAM/CM)</div>
      </div>

      <!-- CARDS STACK -->
      <div class="cards-list">

        <!-- CARD 1: OSCAR GLOUKH (ISRAEL) -->
        <div class="card-item israel-card">
          <div class="player-cutout-box">
            <img class="portrait" src="${gloukhPhoto}" alt="אוסקר גלוך" />
            <div class="pos-badge" style="background:#0284c7;">CAM</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">אוסקר גלוך 🇮🇱</div>
              <div class="growth-pill">+9 צמיחה</div>
            </div>
            <div class="meta-sub-row">
              <img class="crest" src="${salzburgCrest}" alt="רד בול זלצבורג" />
              <span>רד בול זלצבורג</span>
              <span>•</span>
              <img class="flag" src="${israelFlag}" alt="ישראל" />
              <span>ישראל</span>
              <span>•</span>
              <span>בן 20</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">77</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">86</span>
              </div>
              <div class="role-chip">עושה משחק חופשי ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€24.5M</span>
                <span class="wage-val">• שכר: €28K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

        <!-- CARD 2: ANAN KHALAILI (ISRAEL) -->
        <div class="card-item israel-card">
          <div class="player-cutout-box">
            <img class="portrait" src="${khalailiPhoto}" alt="ענאן חלאילי" />
            <div class="pos-badge" style="background:#0284c7;">RM</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">ענאן חלאילי 🇮🇱</div>
              <div class="growth-pill">+7 צמיחה</div>
            </div>
            <div class="meta-sub-row">
              <span>רויאל אוניון ס.ז'.</span>
              <span>•</span>
              <img class="flag" src="${israelFlag}" alt="ישראל" />
              <span>ישראל</span>
              <span>•</span>
              <span>בן 20</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">78</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">85</span>
              </div>
              <div class="role-chip">חלוץ כנף ישיר ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€18.0M</span>
                <span class="wage-val">• שכר: €22K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

        <!-- CARD 3: ENDRICK (BRAZIL) -->
        <div class="card-item">
          <div class="player-cutout-box">
            <img class="portrait" src="${endrickPhoto}" alt="אנדריק" />
            <div class="pos-badge">ST</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">אנדריק</div>
              <div class="growth-pill">+12 צמיחה</div>
            </div>
            <div class="meta-sub-row">
              <img class="crest" src="${realCrest}" alt="ריאל מדריד" />
              <span>ריאל מדריד</span>
              <span>•</span>
              <img class="flag" src="${brazilFlag}" alt="ברזיל" />
              <span>ברזיל</span>
              <span>•</span>
              <span>בן 18</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">79</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">91</span>
              </div>
              <div class="role-chip">חלוץ רחבה מטרה ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€35.0M</span>
                <span class="wage-val">• שכר: €45K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

      </div>

      <!-- ADVISOR BANNER -->
      <div class="advisor-strip">
        <div class="advisor-icon">🇮🇱</div>
        <div class="advisor-content">
          <strong>גאווה ישראלית ב-FC 27:</strong> אוסקר גלוך (86 פוטנציאל), ענאן חלאילי (85 פוטנציאל) ודניאל פרץ (83 פוטנציאל) מוגדרים כישרונות מובחרים לרכישה בקריירה!
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;

// FULL GLOUKH SCOUT DOSSIER
const gloukhDossierHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>דוח סקאוטינג מלא - אוסקר גלוך</title>
  <style>
    ${baseCss}

    .profile-hero-card {
      position: relative;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(14, 24, 38, 0.78) 0%, rgba(9, 16, 26, 0.72) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-top: 1px solid rgba(56, 189, 248, 0.6);
      backdrop-filter: blur(18px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      padding: 13px;
      display: flex;
      gap: 13px;
      align-items: center;
      margin-bottom: 9px;
    }

    .hero-avatar-box {
      width: 90px;
      height: 114px;
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      border-radius: 13px;
      background: radial-gradient(circle at 50% 35%, rgba(40, 60, 85, 0.8) 0%, rgba(10, 18, 28, 0.85) 90%);
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 8px 18px rgba(0,0,0,0.35);
      overflow: hidden;
    }

    .hero-avatar-box img {
      width: 98px;
      height: auto;
      object-fit: cover;
      transform: translateY(3px);
    }

    .hero-meta-col {
      flex: 1;
      min-width: 0;
    }

    .hero-player-title {
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.15;
    }

    .hero-en-title {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 3px;
    }

    .chips-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 7px;
    }

    .info-chip {
      padding: 3px 7px;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 9.5px;
      font-weight: 700;
      color: #e2e8f0;
    }

    .prog-panel {
      border-radius: 15px;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.72) 0%, rgba(10, 22, 34, 0.78) 100%);
      border: 1px solid rgba(0, 255, 140, 0.45);
      border-top: 1px solid rgba(0, 255, 140, 0.7);
      backdrop-filter: blur(18px);
      box-shadow: 0 10px 22px rgba(0,0,0,0.35);
      padding: 11px 13px;
      margin-bottom: 9px;
    }

    .prog-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 7px;
    }

    .prog-head-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #a7f3d0;
      text-transform: uppercase;
    }

    .prog-numbers {
      display: flex;
      align-items: baseline;
      gap: 7px;
    }

    .num-cur {
      font-size: 25px;
      font-weight: 900;
      color: #ffffff;
    }

    .num-arrow {
      font-size: 14px;
      color: #00ff8c;
      font-weight: 900;
    }

    .num-pot {
      font-size: 25px;
      font-weight: 900;
      color: #00ff8c;
      text-shadow: 0 0 14px rgba(0, 255, 140, 0.6);
    }

    .prog-track {
      width: 100%;
      height: 7px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .prog-bar-glow {
      height: 100%;
      background: linear-gradient(90deg, #00b862 0%, #00ff8c 100%);
      border-radius: 999px;
      box-shadow: 0 0 12px rgba(0, 255, 140, 0.5);
    }

    .prog-foot-row {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #cbd5e1;
      font-weight: 700;
    }

    .fin-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
      margin-bottom: 9px;
    }

    .fin-tile {
      border-radius: 11px;
      background: rgba(14, 24, 38, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);
      padding: 8px 11px;
    }

    .fin-label-h4 {
      font-size: 9px;
      font-weight: 700;
      color: #94a3b8;
    }

    .fin-val-h4 {
      font-size: 14px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 2px;
    }

    .section-card {
      border-radius: 13px;
      background: rgba(14, 24, 38, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);
      padding: 9px 12px;
      margin-bottom: 9px;
    }

    .sec-top-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 7px;
    }

    .sec-main-label {
      font-size: 11px;
      font-weight: 900;
      color: #e2e8f0;
    }

    .roles-container {
      display: flex;
      gap: 7px;
    }

    .role-block {
      flex: 1;
      padding: 6px 9px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      font-weight: 700;
      color: #ffffff;
    }

    .role-block.star-role {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.45);
      color: #7dd3fc;
    }

    .plus-tag {
      font-size: 8.5px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.3);
      color: #ffffff;
    }

    .ps-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .playstyle-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
    }

    .playstyle-tag.gold-plus {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(180, 83, 9, 0.18) 100%);
      border-color: #f59e0b;
      color: #fef3c7;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.25);
    }

    .stat-matrix {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .stat-box {
      border-radius: 8px;
      background: rgba(8, 14, 22, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 5px 7px;
      text-align: center;
    }

    .stat-title {
      font-size: 8.5px;
      color: #94a3b8;
      font-weight: 700;
    }

    .stat-number {
      font-size: 15px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 1px;
    }

    .stat-number.green-accent {
      color: #00ff8c;
      text-shadow: 0 0 8px rgba(0, 255, 140, 0.4);
    }
  </style>
</head>
<body>
  <div class="screen-wrap">
    <div class="bg-photo"></div>
    <div class="bg-glass-wash"></div>
    <div class="ui-layer">

      <!-- TOP BAR -->
      <div class="top-row">
        <div class="btn-back-link">‹ חזרה לשחקנים</div>
        <div class="fc-career-badge">
          <span class="dot"></span>
          <span>דוח סקאוטינג FC 27</span>
        </div>
      </div>

      <!-- HERO PROFILE -->
      <div class="profile-hero-card">
        <div class="hero-avatar-box">
          <img src="${gloukhPhoto}" alt="אוסקר גלוך" />
        </div>
        <div class="hero-meta-col">
          <div class="hero-player-title">אוסקר גלוך 🇮🇱</div>
          <div class="hero-en-title">Oscar Gloukh • Red Bull Salzburg</div>
          <div class="meta-sub-row">
            <img class="crest" src="${salzburgCrest}" alt="רד בול זלצבורג" />
            <span>רד בול זלצבורג</span>
            <span>•</span>
            <img class="flag" src="${israelFlag}" alt="ישראל" />
            <span>ישראל</span>
          </div>
          <div class="chips-flex">
            <div class="info-chip">בן 20</div>
            <div class="info-chip">CAM / CM</div>
            <div class="info-chip">172 ס״מ</div>
            <div class="info-chip">רגל ימין</div>
            <div class="info-chip">★4 מיומנות</div>
            <div class="info-chip">★4 חלשה</div>
          </div>
        </div>
      </div>

      <!-- CAREER PROGRESSION -->
      <div class="prog-panel">
        <div class="prog-head">
          <div>
            <div class="prog-head-title">התפתחות בקריירה</div>
            <div class="prog-numbers">
              <span class="num-cur">77</span>
              <span class="num-arrow">➔</span>
              <span class="num-pot">86</span>
            </div>
          </div>
          <div style="text-align:left;">
            <div class="growth-pill" style="font-size:11.5px; padding:3px 9px;">+9 צמיחה בקריירה</div>
            <div style="font-size:9.5px; color:#cbd5e1; margin-top:3px; font-weight:700;">מעמד: כישרון על (Wonderkid)</div>
          </div>
        </div>
        <div class="prog-track">
          <div class="prog-bar-glow" style="width: 79%;"></div>
        </div>
        <div class="prog-foot-row">
          <span>רייטינג נוכחי: 77</span>
          <span>פוטנציאל שיא: 86</span>
        </div>
      </div>

      <!-- FINANCES -->
      <div class="fin-grid-2x2">
        <div class="fin-tile">
          <div class="fin-label-h4">שווי שוק מוערך</div>
          <div class="fin-val-h4" style="color:#38bdf8;">€24,500,000</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">שכר שבועי מבוקש</div>
          <div class="fin-val-h4">€28,000 / שבוע</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">סעיף שחרור בחוזה</div>
          <div class="fin-val-h4" style="color:#f59e0b;">€44,000,000</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">אורך חוזה קיים</div>
          <div class="fin-val-h4">3 שנים (עד 2027)</div>
        </div>
      </div>

      <!-- TACTICAL ROLES FC 27 -->
      <div class="section-card">
        <div class="sec-top-line">
          <span class="sec-main-label">תפקידים טקטיים (FC 27 Player Roles)</span>
          <span style="font-size:9.5px; color:#38bdf8; font-weight:800;">התקפי / מעבר</span>
        </div>
        <div class="roles-container">
          <div class="role-block star-role">
            <span>עושה משחק חופשי (Playmaker)</span>
            <span class="plus-tag">++</span>
          </div>
          <div class="role-block">
            <span>קשר צללים (Shadow Striker)</span>
            <span class="plus-tag" style="background:rgba(255,255,255,0.2);">+</span>
          </div>
        </div>
      </div>

      <!-- PLAYSTYLES -->
      <div class="section-card">
        <div class="sec-top-line">
          <span class="sec-main-label">סגנונות משחק (PlayStyles)</span>
          <span style="font-size:9.5px; color:#f59e0b; font-weight:800;">סגנון מוזהב +</span>
        </div>
        <div class="ps-wrap">
          <div class="playstyle-tag gold-plus">★ שליטה טכנית (Technical+)</div>
          <div class="playstyle-tag">מסירה חותכת (Incisive Pass)</div>
          <div class="playstyle-tag">בעיטה מסובבת (Finesse Shot)</div>
          <div class="playstyle-tag">קסם אישי (Flair)</div>
          <div class="playstyle-tag">נגיעה ראשונה (First Touch)</div>
        </div>
      </div>

      <!-- SCOUTING STATS -->
      <div class="section-card" style="margin-bottom:0;">
        <div class="sec-top-line">
          <span class="sec-main-label">נתוני יכולת סקאוטינג</span>
          <span style="font-size:9.5px; color:#94a3b8; font-weight:700;">ממוצעי מגרש</span>
        </div>
        <div class="stat-matrix">
          <div class="stat-box"><div class="stat-title">מהירות</div><div class="stat-number green-accent">80</div></div>
          <div class="stat-box"><div class="stat-title">סיומת</div><div class="stat-number">74</div></div>
          <div class="stat-box"><div class="stat-title">מסירה</div><div class="stat-number green-accent">82</div></div>
          <div class="stat-box"><div class="stat-title">כדרור</div><div class="stat-number green-accent">84</div></div>
          <div class="stat-box"><div class="stat-title">הגנה</div><div class="stat-number">48</div></div>
          <div class="stat-box"><div class="stat-title">פיזיות</div><div class="stat-number">62</div></div>
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;

// RENDER BOTH
const jobs = [
  {
    html: path.join(tempDir, 'career-scout-list.html'),
    png: path.join(desktopDir, 'career-preview-israeli-wonderkids.png'),
    content: scoutListHtml,
    desc: 'רשימת 15 השחקנים עם הישראלים'
  },
  {
    html: path.join(tempDir, 'career-gloukh-dossier.html'),
    png: path.join(desktopDir, 'career-preview-gloukh-scout.png'),
    content: gloukhDossierHtml,
    desc: 'דוח סקאוטינג מלא עבור אוסקר גלוך'
  }
];

for (const job of jobs) {
  fs.writeFileSync(job.html, job.content, 'utf8');
  const cmd = `"${edgePath}" --headless --disable-gpu --hide-scrollbars --window-size=430,932 --screenshot="${job.png}" "file:///${job.html.replace(/\\\\/g, '/')}"`;
  execSync(cmd, { stdio: 'ignore' });
  console.log(`RENDERED: ${job.desc} -> ${job.png}`);
}

console.log('SUCCESS!');
