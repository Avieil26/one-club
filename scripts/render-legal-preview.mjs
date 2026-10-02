import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const tempDir = (process.env.TEMP || 'C:/Users/aviel/AppData/Local/Temp') + '/fc-legal-preview';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const desktopDir = 'C:/Users/aviel/Desktop';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #050A08;
    color: #F4F7F2;
    font-family: 'Assistant', -apple-system, BlinkMacSystemFont, sans-serif;
    padding: 24px;
    direction: rtl;
    width: 600px;
    margin: 0 auto;
  }
  .page-title {
    font-size: 30px;
    font-weight: 900;
    color: #F4F7F2;
    margin-bottom: 4px;
    text-align: right;
  }
  .updated {
    font-size: 13px;
    font-weight: 700;
    color: #C5D5C8;
    margin-bottom: 20px;
    text-align: right;
  }
  .primary-notice {
    background: rgba(22, 30, 24, 0.95);
    border: 1px solid rgba(227, 179, 65, 0.45);
    border-top: 2px solid rgba(227, 179, 65, 0.9);
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(227, 179, 65, 0.16);
    border: 1px solid rgba(227, 179, 65, 0.5);
    border-radius: 8px;
    padding: 4px 10px;
    margin-bottom: 12px;
    color: #E3B341;
    font-size: 11.5px;
    font-weight: 900;
  }
  .hebrew-main {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.6;
    color: #FFFFFF;
    text-align: right;
    margin-bottom: 12px;
  }
  .divider {
    height: 1px;
    background: rgba(227, 179, 65, 0.25);
    margin: 12px 0;
  }
  .eng-title {
    color: #E3B341;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-align: left;
    direction: ltr;
    margin-bottom: 4px;
  }
  .eng-body {
    color: #D1D5DB;
    font-size: 13px;
    line-height: 1.5;
    text-align: left;
    direction: ltr;
  }
  .section {
    margin-bottom: 20px;
  }
  .section-title {
    color: #E3B341;
    font-size: 18px;
    font-weight: 900;
    margin-bottom: 8px;
    text-align: right;
  }
  .section-body {
    font-size: 15px;
    line-height: 1.6;
    color: #F4F7F2;
    text-align: right;
  }
  .bullet {
    display: flex;
    flex-direction: row-reverse;
    align-items: flex-start;
    gap: 8px;
    margin-top: 6px;
    padding-right: 6px;
    font-size: 14.5px;
    line-height: 1.5;
  }
  .bullet-dot {
    color: #E3B341;
    font-weight: 900;
  }
`;

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>תנאי שימוש - Futz BETA</title>
  <style>${css}</style>
</head>
<body>
  <div class="page-title">תנאי שימוש</div>
  <div class="updated">עודכן: 28 בספטמבר 2026</div>

  <div class="primary-notice">
    <div class="badge">⚖️ הבהרה משפטית רשמית • LEGAL DISCLAIMER</div>
    <div class="hebrew-main">
      אתר זה הינו אתר מעריצים עצמאי ואינו קשור, ממומן, מאושר או נתמך על ידי Electronic Arts Inc. או שותפיה. כל שמות המשחקים, הלוגואים, המותגים ותמונות השחקנים המוצגים באתר הם קניינם הרוחני של בעליהם החוקיים ומשמשים כאן תחת הגדרת "שימוש הוגן" למטרות מידע וקהילה בלבד.
    </div>
    <div class="divider"></div>
    <div class="eng-title">NON-AFFILIATION & FAIR USE NOTICE (ENGLISH)</div>
    <div class="eng-body">
      This website and application is an independent fan site and is not affiliated with, endorsed, sponsored, or specifically approved by Electronic Arts Inc. or its affiliates. All game titles, logos, brands, and player images displayed on this site are the intellectual property of their respective owners and are used here under 'fair use' for informational, educational, and community purposes only.
    </div>
  </div>

  <div class="section">
    <div class="section-title">הצהרת אי-שיוך (Non-Affiliation Disclaimer)</div>
    <div class="section-body">
      Futz BETA הוא מיזם קהילתי עצמאי שפותח על ידי שחקנים ועבור קהילת הגיימינג בישראל. האתר והאפליקציה אינם קשורים, ממומנים, מאושרים, מנוהלים או נתמכים בכל דרך שהיא על ידי חברת Electronic Arts Inc. (EA), מותג EA SPORTS, פדרציית FIFA, ארגון FIFPRO, ליגות כדורגל רשמיות, או מועדוני כדורגל כלשהם בעולם.
    </div>
    <div class="bullet"><span class="bullet-dot">•</span> כל סימני המסחר, שמות המשחקים (לרבות EA SPORTS FC, FC 24, FC 25, FC 26, FC 27, Ultimate Team, Career Mode), סמלי המועדונים, סמלי הליגות, לוגואים ותמונות שחקנים המוצגים באתר הם קניינם הבלעדי של בעלי הזכויות והסימנים הרשומים שלהם.</div>
    <div class="bullet"><span class="bullet-dot">•</span> כל שימוש בשמות, דירוגים, תכונות או סמלים הקשורים למשחקי EA נעשה באופן נומינטיבי (Nominative Fair Use) בלבד לצורך זיהוי ענייני, סקירה אינפורמטיבית, חישובים טקטיים ודיון קהילתי בין שחקנים.</div>
  </div>

  <div class="section">
    <div class="section-title">מהות האתר וקהילת המעריצים (Community Nature)</div>
    <div class="section-body">
      Futz BETA מופעל כאתר מעריצים (Fan Site) קהילתי, אינפורמטיבי וחינמי לחלוטין. מטרת האתר היא להעניק לשחקנים בישראל כלי עזר חישוביים, מאגרי נתונים, סקאוטינג לפיתוח כישרונות במוד קריירה, פתרונות לאתגרי בניית הרכבים (SBC) ולוח קהילתי (Grounds) למציאת שותפים למשחק.
    </div>
    <div class="bullet"><span class="bullet-dot">•</span> האתר אינו מוכר ואינו מתווך במכירת מטבעות משחק וירטואליים (Coins), אינו מבצע מסחר בנכסים דיגיטליים, ואינו גובה תשלומים עבור פריטים בתוך המשחק.</div>
    <div class="bullet"><span class="bullet-dot">•</span> האתר אינו מקדם, מפיץ או מציע תוכנות עזר אסורות, בוטים, צ'יטים או פריצות, ומקפיד לכבד את תנאי השירות וכללי המשחק ההוגן הרשמיים.</div>
  </div>

  <div class="section">
    <div class="section-title">מדיניות הסרת תוכן וזכויות יוצרים (DMCA / Takedown Policy)</div>
    <div class="section-body">
      אנו מכבדים את זכויות הקניין הרוחני של בעלי הזכויות ופועלים בהתאם לחוקי זכויות היוצרים, לרבות הוראות ה-Digital Millennium Copyright Act (DMCA) ודיני זכויות יוצרים בישראל. אם הנכם בעלי זכויות יוצרים או נציגיהם המורשים, וסבורים כי תוכן, תמונה, גרפיקה או קישור באתר מפרים את זכויותיכם או חורגים משימוש הוגן, אנא פנו אלינו מיד.
    </div>
    <div class="bullet"><span class="bullet-dot">•</span> פניות DMCA והסרת תוכן יש לשלוח לכתובת: avielindapurkar717@gmail.com. עם קבלת פנייה תקינה, אנו נפעל לבדיקת הנושא ולהסרת התוכן המדובר בתוך 24 עד 48 שעות.</div>
  </div>
</body>
</html>
`;

const htmlPath = path.join(tempDir, 'legal-preview.html');
const pngPath = path.join(desktopDir, 'legal-preview.png');
fs.writeFileSync(htmlPath, html, 'utf8');

const cmd = `"${edgePath}" --headless --disable-gpu --hide-scrollbars --window-size=620,950 --screenshot="${pngPath}" "file:///${htmlPath.replace(/\\\\/g, '/')}"`;
execSync(cmd, { stdio: 'ignore' });
console.log('RENDERED LEGAL PREVIEW!');
