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
const yamalPhoto = toB64(tempDir + '/yamal.png');
const ardaPhoto = toB64(tempDir + '/arda.png');
const bellinghamPhoto = toB64(tempDir + '/bellingham.png');
const barcaCrest = toB64(tempDir + '/barca.png');
const realCrest = toB64(tempDir + '/real.png');
const spainFlag = toB64(tempDir + '/spain.png');
const turkeyFlag = toB64(tempDir + '/turkey.png');
const englandFlag = toB64(tempDir + '/england.png');

const css = `
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
    direction: ltr; /* keep root LTR so browser screenshot coordinates are not shifted */
  }

  .screen-wrap {
    width: 430px;
    height: 932px;
    position: relative;
    overflow: hidden;
    direction: rtl; /* apply RTL inside the phone screen frame */
    display: flex;
    flex-direction: column;
  }

  /* BACKGROUND IMAGE: 100% VISIBLE ACROSS FULL SCREEN, NO SOLID BLACK OVERLAY */
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

  /* SUBTLE TRANSLUCENT MINT/NAVY WASH - DOES NOT HIDE THE BACKGROUND */
  .bg-glass-wash {
    position: absolute;
    inset: 0;
    width: 430px;
    height: 932px;
    background: linear-gradient(180deg, 
      rgba(8, 14, 22, 0.40) 0%, 
      rgba(8, 14, 22, 0.35) 40%, 
      rgba(8, 14, 22, 0.50) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  .ui-layer {
    position: relative;
    z-index: 2;
    width: 430px;
    height: 932px;
    padding: 38px 16px 20px 16px;
    display: flex;
    flex-direction: column;
  }

  /* HEADER */
  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .btn-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    color: #f1f5f9;
    font-size: 12px;
    font-weight: 700;
  }

  .fc-career-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(0, 255, 140, 0.15);
    border: 1px solid rgba(0, 255, 140, 0.4);
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
    margin-bottom: 12px;
  }

  .title-text {
    font-size: 25px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.7);
  }

  .subtitle-text {
    font-size: 12px;
    color: #cbd5e1;
    font-weight: 600;
    margin-top: 2px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }

  /* FILTER TABS */
  .category-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .cat-tab {
    padding: 7px 13px;
    border-radius: 10px;
    font-size: 11.5px;
    font-weight: 800;
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    color: #94a3b8;
  }

  .cat-tab.active {
    background: linear-gradient(135deg, #00ff8c 0%, #00b862 100%);
    color: #022010;
    border-color: #55ffb0;
    box-shadow: 0 0 14px rgba(0, 255, 140, 0.35);
  }

  /* PLAYER CARDS LIST */
  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .card-item {
    position: relative;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(14, 24, 38, 0.72) 0%, rgba(9, 16, 26, 0.68) 100%);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-top: 1px solid rgba(255, 255, 255, 0.35);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.18);
    padding: 12px 14px;
    display: flex;
    gap: 13px;
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

  /* PLAYER PHOTO CUTOUT FRAME */
  .player-cutout-box {
    position: relative;
    width: 82px;
    height: 104px;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-radius: 14px;
    background: radial-gradient(circle at 50% 30%, rgba(35, 52, 75, 0.75) 0%, rgba(12, 20, 32, 0.8) 90%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  .player-cutout-box img.portrait {
    width: 90px;
    height: auto;
    object-fit: cover;
    transform: translateY(4px);
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
  }

  .pos-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 2px 6px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    font-size: 9px;
    font-weight: 900;
  }

  /* CARD DETAILS */
  .card-details {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .player-name-h3 {
    font-size: 17.5px;
    font-weight: 900;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .growth-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 8px;
    background: rgba(0, 255, 140, 0.16);
    border: 1px solid rgba(0, 255, 140, 0.45);
    color: #00ff8c;
    font-size: 10.5px;
    font-weight: 900;
    white-space: nowrap;
  }

  .meta-sub-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
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
    height: 11px;
    object-fit: cover;
    border-radius: 2px;
  }

  /* RATING ROW */
  .rating-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 10px;
    border-radius: 10px;
    background: rgba(8, 14, 22, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .rating-pair {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }

  .cur-ovr {
    font-size: 17px;
    font-weight: 900;
    color: #ffffff;
  }

  .arrow-symbol {
    font-size: 12px;
    color: #00ff8c;
    font-weight: 900;
  }

  .max-pot {
    font-size: 17px;
    font-weight: 900;
    color: #00ff8c;
    text-shadow: 0 0 10px rgba(0, 255, 140, 0.4);
  }

  .role-chip {
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.35);
    color: #7dd3fc;
    font-size: 10px;
    font-weight: 800;
  }

  /* VALUE ROW */
  .value-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 2px;
  }

  .euro-val {
    font-size: 15.5px;
    font-weight: 900;
    color: #38bdf8;
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
  }

  .wage-val {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 600;
    margin-right: 5px;
  }

  .btn-report {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 10.5px;
    font-weight: 800;
  }

  /* ADVISOR BANNER AT BOTTOM */
  .advisor-strip {
    margin-top: auto;
    padding: 11px 14px;
    border-radius: 14px;
    background: rgba(14, 24, 38, 0.75);
    border: 1px solid rgba(0, 255, 140, 0.35);
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .advisor-icon {
    font-size: 19px;
  }

  .advisor-content {
    font-size: 11px;
    color: #e2e8f0;
    line-height: 1.35;
    font-weight: 600;
  }

  .advisor-content strong {
    color: #00ff8c;
    font-weight: 800;
  }
`;

// 1. CARDS LIST PREVIEW HTML
const cardsListHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>שחקנים מומלצים בקריירה - EA FC 27</title>
  <style>${css}</style>
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
          <span>מועדון קריירה FC 27</span>
        </div>
      </div>

      <!-- TITLE -->
      <div class="title-block">
        <div class="title-text">שחקנים מומלצים לרכש</div>
        <div class="subtitle-text">פוטנציאל שיא, שווי שוק אמיתי (€) ותפקידי שדה</div>
      </div>

      <!-- TABS -->
      <div class="category-tabs">
        <div class="cat-tab active">כישרונות על (Wonderkids)</div>
        <div class="cat-tab">כוכבים מוכחים</div>
        <div class="cat-tab">מציאות סקאוטינג</div>
      </div>

      <!-- CARDS STACK -->
      <div class="cards-list">

        <!-- CARD 1: LAMINE YAMAL -->
        <div class="card-item">
          <div class="player-cutout-box">
            <img class="portrait" src="${yamalPhoto}" alt="לאמין ימאל" />
            <div class="pos-badge">RW</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">לאמין ימאל</div>
              <div class="growth-pill">+13 צמיחה</div>
            </div>
            <div class="meta-sub-row">
              <img class="crest" src="${barcaCrest}" alt="ברצלונה" />
              <span>ברצלונה</span>
              <span>•</span>
              <img class="flag" src="${spainFlag}" alt="ספרד" />
              <span>ספרד</span>
              <span>•</span>
              <span>בן 17</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">81</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">94</span>
              </div>
              <div class="role-chip">חלוץ כנף חותך ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€115.0M</span>
                <span class="wage-val">• שכר: €65K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

        <!-- CARD 2: ARDA GULER -->
        <div class="card-item">
          <div class="player-cutout-box">
            <img class="portrait" src="${ardaPhoto}" alt="ארדה גולר" />
            <div class="pos-badge">CAM</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">ארדה גולר</div>
              <div class="growth-pill">+11 צמיחה</div>
            </div>
            <div class="meta-sub-row">
              <img class="crest" src="${realCrest}" alt="ריאל מדריד" />
              <span>ריאל מדריד</span>
              <span>•</span>
              <img class="flag" src="${turkeyFlag}" alt="טורקיה" />
              <span>טורקיה</span>
              <span>•</span>
              <span>בן 19</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">78</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">89</span>
              </div>
              <div class="role-chip">עושה משחק חופשי ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€31.5M</span>
                <span class="wage-val">• שכר: €52K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

        <!-- CARD 3: JUDE BELLINGHAM -->
        <div class="card-item">
          <div class="player-cutout-box">
            <img class="portrait" src="${bellinghamPhoto}" alt="ג׳וד בלינגהאם" />
            <div class="pos-badge">CM</div>
          </div>
          <div class="card-details">
            <div class="card-header-row">
              <div class="player-name-h3">ג׳וד בלינגהאם</div>
              <div class="growth-pill" style="background:rgba(56,189,248,0.18); border-color:#38bdf8; color:#38bdf8;">כוכב על</div>
            </div>
            <div class="meta-sub-row">
              <img class="crest" src="${realCrest}" alt="ריאל מדריד" />
              <span>ריאל מדריד</span>
              <span>•</span>
              <img class="flag" src="${englandFlag}" alt="אנגליה" />
              <span>אנגליה</span>
              <span>•</span>
              <span>בן 21</span>
            </div>
            <div class="rating-strip">
              <div class="rating-pair">
                <span class="cur-ovr">90</span>
                <span class="arrow-symbol">➔</span>
                <span class="max-pot">95</span>
              </div>
              <div class="role-chip">קשר רחבה לרחבה ++</div>
            </div>
            <div class="value-row">
              <div>
                <span class="euro-val">€185.0M</span>
                <span class="wage-val">• שכר: €320K/שבוע</span>
              </div>
              <div class="btn-report">דוח מלא ◄</div>
            </div>
          </div>
        </div>

      </div>

      <!-- ADVISOR BANNER -->
      <div class="advisor-strip">
        <div class="advisor-icon">🎯</div>
        <div class="advisor-content">
          <strong>מחלקת סקאוטינג:</strong> הערכת שווי השחקנים מבוססת על שוק ההעברות הרשמי ביורו (€). צעירים עם פוטנציאל גבוה צומחים משמעותית בכל עונה!
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;

// 2. PLAYER PROFILE PAGE GENERATOR
function buildPlayerPageHTML(p) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>פרופיל קריירה - ${p.name}</title>
  <style>
    ${css}
    
    .profile-hero-card {
      position: relative;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(14, 24, 38, 0.78) 0%, rgba(9, 16, 26, 0.72) 100%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.38);
      backdrop-filter: blur(18px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      padding: 14px;
      display: flex;
      gap: 14px;
      align-items: center;
      margin-bottom: 10px;
    }

    .hero-avatar-box {
      width: 96px;
      height: 120px;
      flex-shrink: 0;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      border-radius: 14px;
      background: radial-gradient(circle at 50% 35%, rgba(40, 60, 85, 0.8) 0%, rgba(10, 18, 28, 0.85) 90%);
      border: 1px solid rgba(255, 255, 255, 0.22);
      box-shadow: 0 8px 20px rgba(0,0,0,0.35);
      overflow: hidden;
    }

    .hero-avatar-box img {
      width: 104px;
      height: auto;
      object-fit: cover;
      transform: translateY(4px);
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
      font-size: 11.5px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .chips-flex {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;
    }

    .info-chip {
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 10px;
      font-weight: 700;
      color: #e2e8f0;
    }

    /* PROGRESSION PANEL */
    .prog-panel {
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.72) 0%, rgba(10, 22, 34, 0.78) 100%);
      border: 1px solid rgba(0, 255, 140, 0.45);
      border-top: 1px solid rgba(0, 255, 140, 0.7);
      backdrop-filter: blur(18px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.35);
      padding: 12px 14px;
      margin-bottom: 10px;
    }

    .prog-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .prog-head-title {
      font-size: 11px;
      font-weight: 800;
      color: #a7f3d0;
      text-transform: uppercase;
    }

    .prog-numbers {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .num-cur {
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
    }

    .num-arrow {
      font-size: 15px;
      color: #00ff8c;
      font-weight: 900;
    }

    .num-pot {
      font-size: 26px;
      font-weight: 900;
      color: #00ff8c;
      text-shadow: 0 0 14px rgba(0, 255, 140, 0.6);
    }

    .prog-track {
      width: 100%;
      height: 8px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 6px;
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
      font-size: 9.5px;
      color: #cbd5e1;
      font-weight: 700;
    }

    /* FINANCES 2x2 */
    .fin-grid-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }

    .fin-tile {
      border-radius: 12px;
      background: rgba(14, 24, 38, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);
      padding: 9px 12px;
    }

    .fin-label-h4 {
      font-size: 9.5px;
      font-weight: 700;
      color: #94a3b8;
    }

    .fin-val-h4 {
      font-size: 14.5px;
      font-weight: 900;
      color: #ffffff;
      margin-top: 2px;
    }

    /* SECTION CARDS */
    .section-card {
      border-radius: 14px;
      background: rgba(14, 24, 38, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);
      padding: 10px 13px;
      margin-bottom: 10px;
    }

    .sec-top-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .sec-main-label {
      font-size: 11.5px;
      font-weight: 900;
      color: #e2e8f0;
    }

    .roles-container {
      display: flex;
      gap: 8px;
    }

    .role-block {
      flex: 1;
      padding: 7px 10px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: #ffffff;
    }

    .role-block.star-role {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.45);
      color: #7dd3fc;
    }

    .plus-tag {
      font-size: 9px;
      font-weight: 900;
      padding: 1px 5px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.3);
      color: #ffffff;
    }

    /* PLAYSTYLES */
    .ps-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .playstyle-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 9px;
      border-radius: 7px;
      font-size: 10.5px;
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

    /* STATS 6-GRID */
    .stat-matrix {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
    }

    .stat-box {
      border-radius: 9px;
      background: rgba(8, 14, 22, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 6px 8px;
      text-align: center;
    }

    .stat-title {
      font-size: 9px;
      color: #94a3b8;
      font-weight: 700;
    }

    .stat-number {
      font-size: 16px;
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
        <div class="btn-back-link">‹ שחקנים מומלצים</div>
        <div class="fc-career-badge">
          <span class="dot"></span>
          <span>דוח סקאוטינג FC 27</span>
        </div>
      </div>

      <!-- HERO PLAYER PROFILE -->
      <div class="profile-hero-card">
        <div class="hero-avatar-box">
          <img src="${p.photo}" alt="${p.name}" />
        </div>
        <div class="hero-meta-col">
          <div class="hero-player-title">${p.name}</div>
          <div class="hero-en-title">${p.enName}</div>
          <div class="meta-sub-row">
            <img class="crest" src="${p.crest}" alt="${p.club}" />
            <span>${p.club}</span>
            <span>•</span>
            <img class="flag" src="${p.flag}" alt="${p.nation}" />
            <span>${p.nation}</span>
          </div>
          <div class="chips-flex">
            <div class="info-chip">בן ${p.age}</div>
            <div class="info-chip">${p.position}</div>
            <div class="info-chip">${p.height} ס״מ</div>
            <div class="info-chip">רגל ${p.foot}</div>
            <div class="info-chip">★${p.skills} מיומנות</div>
            <div class="info-chip">★${p.weakFoot} חלשה</div>
          </div>
        </div>
      </div>

      <!-- CAREER PROGRESSION -->
      <div class="prog-panel">
        <div class="prog-head">
          <div>
            <div class="prog-head-title">התפתחות בקריירה</div>
            <div class="prog-numbers">
              <span class="num-cur">${p.ovr}</span>
              <span class="num-arrow">➔</span>
              <span class="num-pot">${p.pot}</span>
            </div>
          </div>
          <div style="text-align:left;">
            <div class="growth-pill" style="font-size:12px; padding:4px 10px;">${p.growthText}</div>
            <div style="font-size:10px; color:#cbd5e1; margin-top:4px; font-weight:700;">מעמד: ${p.squadStatus}</div>
          </div>
        </div>
        <div class="prog-track">
          <div class="prog-bar-glow" style="width: ${p.progressWidth};"></div>
        </div>
        <div class="prog-foot-row">
          <span>רייטינג נוכחי: ${p.ovr}</span>
          <span>פוטנציאל שיא: ${p.pot}</span>
        </div>
      </div>

      <!-- FINANCES & CONTRACT -->
      <div class="fin-grid-2x2">
        <div class="fin-tile">
          <div class="fin-label-h4">שווי שוק מוערך</div>
          <div class="fin-val-h4" style="color:#38bdf8;">${p.marketValue}</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">שכר שבועי מבוקש</div>
          <div class="fin-val-h4">${p.weeklyWage}</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">סעיף שחרור בחוזה</div>
          <div class="fin-val-h4" style="color:#f59e0b;">${p.releaseClause}</div>
        </div>
        <div class="fin-tile">
          <div class="fin-label-h4">אורך חוזה קיים</div>
          <div class="fin-val-h4">${p.contractYears}</div>
        </div>
      </div>

      <!-- TACTICAL ROLES FC 27 -->
      <div class="section-card">
        <div class="sec-top-line">
          <span class="sec-main-label">תפקידים טקטיים (FC 27 Player Roles)</span>
          <span style="font-size:10px; color:#38bdf8; font-weight:800;">${p.roleSystem}</span>
        </div>
        <div class="roles-container">
          <div class="role-block star-role">
            <span>${p.primaryRole}</span>
            <span class="plus-tag">++</span>
          </div>
          <div class="role-block">
            <span>${p.secondaryRole}</span>
            <span class="plus-tag" style="background:rgba(255,255,255,0.2);">+</span>
          </div>
        </div>
      </div>

      <!-- PLAYSTYLES -->
      <div class="section-card">
        <div class="sec-top-line">
          <span class="sec-main-label">סגנונות משחק (PlayStyles)</span>
          <span style="font-size:10px; color:#f59e0b; font-weight:800;">סגנון מוזהב +</span>
        </div>
        <div class="ps-wrap">
          ${p.playstylesHtml}
        </div>
      </div>

      <!-- SCOUTING ATTRIBUTES -->
      <div class="section-card" style="margin-bottom:0;">
        <div class="sec-top-line">
          <span class="sec-main-label">נתוני יכולת סקאוטינג</span>
          <span style="font-size:10px; color:#94a3b8; font-weight:700;">ממוצעי מגרש</span>
        </div>
        <div class="stat-matrix">
          ${p.attrsHtml}
        </div>
      </div>

    </div>
  </div>
</body>
</html>
`;
}

// DATA OBJECTS
const yamalData = {
  name: 'לאמין ימאל',
  enName: 'Lamine Yamal',
  club: 'ברצלונה',
  nation: 'ספרד',
  position: 'RW • קיצוני ימני',
  age: 17,
  height: 181,
  foot: 'שמאל',
  skills: 5,
  weakFoot: 3,
  ovr: 81,
  pot: 94,
  growthText: '+13 צמיחה בקריירה',
  squadStatus: 'שחקן מפתח (Crucial)',
  progressWidth: '86%',
  marketValue: '€115,000,000',
  weeklyWage: '€65,000 / שבוע',
  releaseClause: '€230,000,000',
  contractYears: '5 שנים (עד 2030)',
  roleSystem: 'טיקי-טאקה / לחץ גבוה',
  primaryRole: 'חלוץ כנף חותך (Inside Forward)',
  secondaryRole: 'עושה משחק באגף (Playmaker)',
  photo: yamalPhoto,
  crest: barcaCrest,
  flag: spainFlag,
  playstylesHtml: `
    <div class="playstyle-tag gold-plus">★ זינוק מהיר (Quick Step+)</div>
    <div class="playstyle-tag">בעיטה מסובבת (Finesse)</div>
    <div class="playstyle-tag">שליטה טכנית (Technical)</div>
    <div class="playstyle-tag">להטוטן (Trickster)</div>
    <div class="playstyle-tag">נגיעה ראשונה (First Touch)</div>
  `,
  attrsHtml: `
    <div class="stat-box"><div class="stat-title">מהירות</div><div class="stat-number green-accent">86</div></div>
    <div class="stat-box"><div class="stat-title">סיומת</div><div class="stat-number green-accent">84</div></div>
    <div class="stat-box"><div class="stat-title">מסירה</div><div class="stat-number green-accent">87</div></div>
    <div class="stat-box"><div class="stat-title">כדרור</div><div class="stat-number green-accent">93</div></div>
    <div class="stat-box"><div class="stat-title">הגנה</div><div class="stat-number">38</div></div>
    <div class="stat-box"><div class="stat-title">פיזיות</div><div class="stat-number">61</div></div>
  `
};

const ardaData = {
  name: 'ארדה גולר',
  enName: 'Arda Güler',
  club: 'ריאל מדריד',
  nation: 'טורקיה',
  position: 'CAM • קשר התקפי',
  age: 19,
  height: 175,
  foot: 'שמאל',
  skills: 4,
  weakFoot: 3,
  ovr: 78,
  pot: 89,
  growthText: '+11 צמיחה בקריירה',
  squadStatus: 'רוטציה / פוטנציאל עתידי',
  progressWidth: '81%',
  marketValue: '€31,500,000',
  weeklyWage: '€52,000 / שבוע',
  releaseClause: '€72,000,000',
  contractYears: '5 שנים (עד 2029)',
  roleSystem: 'שליטה במרכז / התקפות מעבר',
  primaryRole: 'עושה משחק חופשי (Playmaker)',
  secondaryRole: 'קשר חודר (Shadow Striker)',
  photo: ardaPhoto,
  crest: realCrest,
  flag: turkeyFlag,
  playstylesHtml: `
    <div class="playstyle-tag gold-plus">★ מסירה חותכת (Incisive Pass+)</div>
    <div class="playstyle-tag">מצבים נייחים (Dead Ball)</div>
    <div class="playstyle-tag">שליטה טכנית (Technical)</div>
    <div class="playstyle-tag">ראיית משחק (Vision)</div>
  `,
  attrsHtml: `
    <div class="stat-box"><div class="stat-title">מהירות</div><div class="stat-number">77</div></div>
    <div class="stat-box"><div class="stat-title">סיומת</div><div class="stat-number">79</div></div>
    <div class="stat-box"><div class="stat-title">מסירה</div><div class="stat-number green-accent">85</div></div>
    <div class="stat-box"><div class="stat-title">כדרור</div><div class="stat-number green-accent">84</div></div>
    <div class="stat-box"><div class="stat-title">הגנה</div><div class="stat-number">55</div></div>
    <div class="stat-box"><div class="stat-title">פיזיות</div><div class="stat-number">57</div></div>
  `
};

const bellinghamData = {
  name: 'ג׳וד בלינגהאם',
  enName: 'Jude Bellingham',
  club: 'ריאל מדריד',
  nation: 'אנגליה',
  position: 'CM • קשר מרכזי',
  age: 21,
  height: 186,
  foot: 'ימין',
  skills: 4,
  weakFoot: 4,
  ovr: 90,
  pot: 95,
  growthText: '+5 לפסגת העולם',
  squadStatus: 'שחקן מפתח (Crucial)',
  progressWidth: '95%',
  marketValue: '€185,000,000',
  weeklyWage: '€320,000 / שבוע',
  releaseClause: '€380,000,000',
  contractYears: '5 שנים (עד 2029)',
  roleSystem: 'לחץ גבוה / התקפות עומק',
  primaryRole: 'קשר רחבה לרחבה (Box-to-Box)',
  secondaryRole: 'חלוץ צללים (Shadow Striker)',
  photo: bellinghamPhoto,
  crest: realCrest,
  flag: englandFlag,
  playstylesHtml: `
    <div class="playstyle-tag gold-plus">★ סיבולת ברזל (Relentless+)</div>
    <div class="playstyle-tag">חטיפות כדור (Intercept)</div>
    <div class="playstyle-tag">מסירות ארוכות (Long Ball)</div>
    <div class="playstyle-tag">נוכחות פיזית (Bruiser)</div>
    <div class="playstyle-tag">קסם אישי (Flair)</div>
  `,
  attrsHtml: `
    <div class="stat-box"><div class="stat-title">מהירות</div><div class="stat-number">79</div></div>
    <div class="stat-box"><div class="stat-title">סיומת</div><div class="stat-number green-accent">86</div></div>
    <div class="stat-box"><div class="stat-title">מסירה</div><div class="stat-number green-accent">83</div></div>
    <div class="stat-box"><div class="stat-title">כדרור</div><div class="stat-number green-accent">88</div></div>
    <div class="stat-box"><div class="stat-title">הגנה</div><div class="stat-number">79</div></div>
    <div class="stat-box"><div class="stat-title">פיזיות</div><div class="stat-number green-accent">85</div></div>
  `
};

// WRITE AND RENDER
const tasks = [
  {
    htmlPath: path.join(tempDir, 'career-cards-v3.html'),
    pngPath: path.join(desktopDir, 'career-preview-cards.png'),
    content: cardsListHTML,
    desc: 'רשימת שחקנים מומלצים'
  },
  {
    htmlPath: path.join(tempDir, 'career-yamal-v3.html'),
    pngPath: path.join(desktopDir, 'career-preview-player-yamal.png'),
    content: buildPlayerPageHTML(yamalData),
    desc: 'פרופיל לאמין ימאל'
  },
  {
    htmlPath: path.join(tempDir, 'career-arda-v3.html'),
    pngPath: path.join(desktopDir, 'career-preview-player-arda.png'),
    content: buildPlayerPageHTML(ardaData),
    desc: 'פרופיל ארדה גולר'
  },
  {
    htmlPath: path.join(tempDir, 'career-bellingham-v3.html'),
    pngPath: path.join(desktopDir, 'career-preview-player-bellingham.png'),
    content: buildPlayerPageHTML(bellinghamData),
    desc: 'פרופיל ג׳וד בלינגהאם'
  }
];

for (const task of tasks) {
  fs.writeFileSync(task.htmlPath, task.content, 'utf8');
  console.log(`Wrote ${task.htmlPath}`);
  const cmd = `"${edgePath}" --headless --disable-gpu --hide-scrollbars --window-size=430,932 --screenshot="${task.pngPath}" "file:///${task.htmlPath.replace(/\\\\/g, '/')}"`;
  try {
    execSync(cmd, { stdio: 'ignore' });
    console.log(`RENDERED: ${task.desc} -> ${task.pngPath}`);
  } catch (err) {
    console.error(`Failed ${task.pngPath}:`, err.message);
  }
}

console.log('ALL V3 PREVIEWS RENDERED PERFECTLY!');
