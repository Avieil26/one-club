export interface CareerScoutPlayer {
  id: string;
  eaId: number;
  name: string;
  enName: string;
  age: number;
  position: string;
  club: string;
  nation: string;
  rating: number;       // Current starting Career OVR
  potential: number;    // Maximum Career potential OVR
  growth: number;       // potential - rating
  marketValueEur: number; // In Euros (€)
  weeklyWageEur: number;  // In Euros (€ / week)
  releaseClauseEur: number; // In Euros (€)
  contractYears: string;
  height: number;
  foot: 'ימין' | 'שמאל';
  skills: number;
  weakFoot: number;
  squadRole: string;
  roleSystem: string;
  primaryRole: string;
  secondaryRole: string;
  playstyles: Array<{ name: string; plus?: boolean }>;
  attributes: {
    pac: number;
    sho: number;
    pas: number;
    dri: number;
    def: number;
    phy: number;
  };
  photo: string;
  category: 'israel' | 'wonderkids' | 'bargains';
}

export const CAREER_SCOUT_PLAYERS: CareerScoutPlayer[] = [
  {
    "id": "ea-274288-oscar-gloukh",
    "eaId": 274288,
    "name": "אוסקר גלוך",
    "enName": "Oscar Gloukh",
    "age": 22,
    "position": "CAM",
    "club": "אייאקס",
    "nation": "ישראל",
    "rating": 77,
    "potential": 86,
    "growth": 9,
    "marketValueEur": 23500000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 42000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 172,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "עושה משחק מרכזי",
    "roleSystem": "שליטה במרכז / מסירות עומק",
    "primaryRole": "עושה משחק חופשי (Playmaker) ++",
    "secondaryRole": "קשר חודר (Shadow Striker) +",
    "playstyles": [
      {
        "name": "נגיעה ראשונה (First Touch+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive Pass)"
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 72,
      "sho": 74,
      "pas": 73,
      "dri": 82,
      "def": 34,
      "phy": 49
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274288.png",
    "category": "israel"
  },
  {
    "id": "ea-70888-anan-khalaili",
    "eaId": 70888,
    "name": "ענאן חלאילי",
    "enName": "Anan Khalaili",
    "age": 22,
    "position": "RM",
    "club": "קריסטל פאלאס",
    "nation": "ישראל",
    "rating": 78,
    "potential": 85,
    "growth": 7,
    "marketValueEur": 20000000,
    "weeklyWageEur": 38000,
    "releaseClauseEur": 39000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 183,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "כנף פותח בפרמייר ליג",
    "roleSystem": "התקפות מעבר / כוח ואצה",
    "primaryRole": "חלוץ כנף חותך (Inside Forward) ++",
    "secondaryRole": "קיצוני רחבה (Winger) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "בעיטה עוצמתית (Power Shot)"
      },
      {
        "name": "ריצה מתפרצת (Rapid)"
      }
    ],
    "attributes": {
      "pac": 84,
      "sho": 72,
      "pas": 71,
      "dri": 80,
      "def": 66,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p70888.png",
    "category": "israel"
  },
  {
    "id": "ea-277823-daniel-peretz",
    "eaId": 277823,
    "name": "דניאל פרץ",
    "enName": "Daniel Peretz",
    "age": 26,
    "position": "GK",
    "club": "סאות׳המפטון",
    "nation": "ישראל",
    "rating": 75,
    "potential": 83,
    "growth": 8,
    "marketValueEur": 9500000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 19000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער הרכב ראשון",
    "roleSystem": "שליטה ברחבה ומשחק רגל",
    "primaryRole": "שוער מטאטא (Sweeper Keeper) ++",
    "secondaryRole": "שוער קו קלאסי (Goalkeeper) +",
    "playstyles": [
      {
        "name": "הדיפות אקרובטיות (Far Reach+)",
        "plus": true
      },
      {
        "name": "יציאה לכדורי גובה (Cross Claimer)"
      },
      {
        "name": "שליטה ברחבה (Rush Out)"
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 75,
      "pas": 73,
      "dri": 77,
      "def": 35,
      "phy": 71
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277823.png",
    "category": "israel"
  },
  {
    "id": "ea-272505-endrick",
    "eaId": 272505,
    "name": "אנדריק",
    "enName": "Endrick",
    "age": 20,
    "position": "ST",
    "club": "ריאל מדריד",
    "nation": "ברזיל",
    "rating": 79,
    "potential": 91,
    "growth": 12,
    "marketValueEur": 42000000,
    "weeklyWageEur": 75000,
    "releaseClauseEur": 110000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 173,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "חלוץ עתיד / רוטציה",
    "roleSystem": "לחץ גבוה וסיומת קטלנית",
    "primaryRole": "חלוץ רחבה שלם (Advanced Forward) ++",
    "secondaryRole": "חלוץ מטרה נייד (Poacher) +",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot+)",
        "plus": true
      },
      {
        "name": "צעד ראשון מהיר (Quick Step)"
      },
      {
        "name": "שליטה אקרובטית (Acrobatic)"
      }
    ],
    "attributes": {
      "pac": 87,
      "sho": 81,
      "pas": 66,
      "dri": 80,
      "def": 30,
      "phy": 73
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272505.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-264309-arda-g-ler",
    "eaId": 264309,
    "name": "ארדה גולר",
    "enName": "Arda Güler",
    "age": 21,
    "position": "CAM",
    "club": "ריאל מדריד",
    "nation": "טורקיה",
    "rating": 83,
    "potential": 90,
    "growth": 7,
    "marketValueEur": 55000000,
    "weeklyWageEur": 85000,
    "releaseClauseEur": 125000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "כוכב עולה בקישור",
    "roleSystem": "ראיית משחק ומסירות גאוניות",
    "primaryRole": "עושה משחק חופשי (Playmaker) ++",
    "secondaryRole": "קשר חודר (Shadow Striker) +",
    "playstyles": [
      {
        "name": "מסירה חותכת (Incisive Pass+)",
        "plus": true
      },
      {
        "name": "מצבים נייחים (Dead Ball)"
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 77,
      "sho": 79,
      "pas": 85,
      "dri": 84,
      "def": 55,
      "phy": 57
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p264309.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269136-kobbie-mainoo",
    "eaId": 269136,
    "name": "קובי מאינו",
    "enName": "Kobbie Mainoo",
    "age": 21,
    "position": "CDM",
    "club": "מנצ׳סטר יונייטד",
    "nation": "אנגליה",
    "rating": 81,
    "potential": 90,
    "growth": 9,
    "marketValueEur": 46000000,
    "weeklyWageEur": 65000,
    "releaseClauseEur": 95000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "עוגן מרכז השדה",
    "roleSystem": "ניהול קצב ולחץ במרכז",
    "primaryRole": "קשר אחורי שלם (Holding Midfielder) ++",
    "secondaryRole": "קשר רחבה לרחבה (Box-to-Box) +",
    "playstyles": [
      {
        "name": "חטיפות נקיות (Intercept+)",
        "plus": true
      },
      {
        "name": "קור רוח בלחץ (Press Proven)"
      },
      {
        "name": "מסירות קצרות (Tiki Taka)"
      }
    ],
    "attributes": {
      "pac": 66,
      "sho": 70,
      "pas": 77,
      "dri": 83,
      "def": 78,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269136.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269087-leny-yoro",
    "eaId": 269087,
    "name": "לני יורו",
    "enName": "Leny Yoro",
    "age": 20,
    "position": "CB",
    "club": "מנצ׳סטר יונייטד",
    "nation": "צרפת",
    "rating": 78,
    "potential": 89,
    "growth": 11,
    "marketValueEur": 31000000,
    "weeklyWageEur": 55000,
    "releaseClauseEur": 75000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 190,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם העתיד",
    "roleSystem": "הגנה גבוהה ובניית התקפה",
    "primaryRole": "בלם יוזם (Ball-Playing Defender) ++",
    "secondaryRole": "עוצר התקפות (Stopper) +",
    "playstyles": [
      {
        "name": "חסימת מעבר (Block+)",
        "plus": true
      },
      {
        "name": "ניתור אווירי (Aerial)"
      },
      {
        "name": "תיקול נקי (Jockey)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 41,
      "pas": 60,
      "dri": 65,
      "def": 79,
      "phy": 73
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269087.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-272978-jorrel-hato",
    "eaId": 272978,
    "name": "ז׳ורל האטו",
    "enName": "Jorrel Hato",
    "age": 20,
    "position": "LB",
    "club": "צ׳לסי",
    "nation": "הולנד",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 29000000,
    "weeklyWageEur": 45000,
    "releaseClauseEur": 68000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 182,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאל ורסטילי",
    "roleSystem": "מגן מודרני מרווח קו",
    "primaryRole": "מגן תוקף (Attacking Fullback) ++",
    "secondaryRole": "בלם מהיר (Cover Defender) +",
    "playstyles": [
      {
        "name": "תיקול גלישה (Slide Tackle+)",
        "plus": true
      },
      {
        "name": "מהירות מתפרצת (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 85,
      "sho": 42,
      "pas": 70,
      "dri": 74,
      "def": 76,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272978.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-262863-antonio-nusa",
    "eaId": 262863,
    "name": "אנטוניו נוסה",
    "enName": "Antonio Nusa",
    "age": 21,
    "position": "LW",
    "club": "ר.ב. לייפציג",
    "nation": "נורווגיה",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 30000000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 68000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 180,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "להטוטן באגף",
    "roleSystem": "כנף פתוחה והטעיות",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "להטוטן קו (Winger) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "צעד ראשון מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 85,
      "sho": 73,
      "pas": 70,
      "dri": 85,
      "def": 42,
      "phy": 64
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262863.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-268421-mathys-tel",
    "eaId": 268421,
    "name": "מת׳יס טל",
    "enName": "Mathys Tel",
    "age": 21,
    "position": "ST",
    "club": "טוטנהאם",
    "nation": "צרפת",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 29000000,
    "weeklyWageEur": 50000,
    "releaseClauseEur": 66000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 183,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "חלוץ רחבה מסוכן",
    "roleSystem": "סיומת חדה והתקפות מהירות",
    "primaryRole": "חלוץ שפיץ שלם (Advanced Forward) ++",
    "secondaryRole": "כנף שמאל חודר (Inside Forward) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      },
      {
        "name": "מהירות מתפרצת (Rapid)"
      }
    ],
    "attributes": {
      "pac": 86,
      "sho": 80,
      "pas": 70,
      "dri": 79,
      "def": 29,
      "phy": 64
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p268421.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-265526-guillaume-restes",
    "eaId": 265526,
    "name": "גיום רסט",
    "enName": "Guillaume Restes",
    "age": 21,
    "position": "GK",
    "club": "טולוז",
    "nation": "צרפת",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 27000000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 58000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 186,
    "foot": "שמאל",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער ראשון צעיר",
    "roleSystem": "רפלקסים מהירים ואחד על אחד",
    "primaryRole": "שוער תגובה מהיר (Goalkeeper) ++",
    "secondaryRole": "שוער מטאטא (Sweeper Keeper) +",
    "playstyles": [
      {
        "name": "תגובת חתול (Cat-Like Reflexes+)",
        "plus": true
      },
      {
        "name": "אחד על אחד (1v1 Rush)"
      }
    ],
    "attributes": {
      "pac": 79,
      "sho": 75,
      "pas": 80,
      "dri": 80,
      "def": 40,
      "phy": 78
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p265526.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-270208-archie-gray",
    "eaId": 270208,
    "name": "ארצ׳י גריי",
    "enName": "Archie Gray",
    "age": 20,
    "position": "CDM",
    "club": "טוטנהאם",
    "nation": "אנגליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 24000000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 55000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 187,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר רב-גוני ומגן ימני",
    "roleSystem": "משמעת טקטית ולחץ מתמיד",
    "primaryRole": "קשר מרכז שולט (Deep Lying Playmaker) ++",
    "secondaryRole": "מגן ימני הפוך (Inverted Fullback) +",
    "playstyles": [
      {
        "name": "סיבולת ברזל (Relentless+)",
        "plus": true
      },
      {
        "name": "חטיפת מסירות (Intercept)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 61,
      "pas": 73,
      "dri": 75,
      "def": 75,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p270208.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-276528-claudio-echeverri",
    "eaId": 276528,
    "name": "קלאודיו אצ׳ברי",
    "enName": "Claudio Echeverri",
    "age": 20,
    "position": "CAM",
    "club": "מנצ׳סטר סיטי",
    "nation": "ארגנטינה",
    "rating": 73,
    "potential": 87,
    "growth": 14,
    "marketValueEur": 11500000,
    "weeklyWageEur": 25000,
    "releaseClauseEur": 32000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 171,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "יהלום דרום אמריקאי",
    "roleSystem": "כדרור זריז ומסירות מפתח",
    "primaryRole": "עושה משחק מתקדם (Advanced Playmaker) ++",
    "secondaryRole": "חלוץ צללים (Shadow Striker) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "זינוק מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 86,
      "sho": 67,
      "pas": 70,
      "dri": 79,
      "def": 38,
      "phy": 49
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p276528.png",
    "category": "bargains"
  },
  {
    "id": "ea-274246-lewis-miley",
    "eaId": 274246,
    "name": "לואיס מיילי",
    "enName": "Lewis Miley",
    "age": 20,
    "position": "CM",
    "club": "ניוקאסל",
    "nation": "אנגליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 23000000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 52000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 188,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר מרכזי מודרני",
    "roleSystem": "ראיית משחק ותנועה ללא כדור",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "עושה משחק אחורי (Deep Playmaker) +",
    "playstyles": [
      {
        "name": "מסירה חותכת (Incisive Pass+)",
        "plus": true
      },
      {
        "name": "קור רוח בלחץ (Press Proven)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 66,
      "pas": 76,
      "dri": 75,
      "def": 76,
      "phy": 69
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274246.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-274616-semih-k-l-soy",
    "eaId": 274616,
    "name": "סמיה קיליצ׳סוי",
    "enName": "Semih Kılıçsoy",
    "age": 21,
    "position": "ST",
    "club": "בשיקטאש",
    "nation": "טורקיה",
    "rating": 73,
    "potential": 86,
    "growth": 13,
    "marketValueEur": 12000000,
    "weeklyWageEur": 20000,
    "releaseClauseEur": 28000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 178,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "חלוץ כוח עם סיומת",
    "roleSystem": "כוח פיזי וסיומת בשתי רגליים",
    "primaryRole": "חלוץ מטרה נייד (Poacher) ++",
    "secondaryRole": "חלוץ כוח (Target Forward) +",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot+)",
        "plus": true
      },
      {
        "name": "נוכחות פיזית (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 74,
      "pas": 67,
      "dri": 77,
      "def": 32,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274616.png",
    "category": "bargains"
  },
  {
    "id": "ea-262659-noah-atubolu",
    "eaId": 262659,
    "name": "נואה אטובולו",
    "enName": "Noah Atubolu",
    "age": 24,
    "position": "GK",
    "club": "פרייבורג",
    "nation": "גרמניה",
    "rating": 79,
    "potential": 86,
    "growth": 7,
    "marketValueEur": 24000000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 45000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער הרכב גרמני עוצמתי",
    "roleSystem": "נוכחות פיזית והדיפות",
    "primaryRole": "שוער מטאטא (Sweeper Keeper) ++",
    "secondaryRole": "שוער קו קלאסי (Goalkeeper) +",
    "playstyles": [
      {
        "name": "הדיפות אקרובטיות (Far Reach+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 79,
      "sho": 74,
      "pas": 79,
      "dri": 80,
      "def": 55,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262659.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-259065-arnau-tenas",
    "eaId": 259065,
    "name": "ארנאו טנאס",
    "enName": "Arnau Tenas",
    "age": 25,
    "position": "GK",
    "club": "מיורקה",
    "nation": "ספרד",
    "rating": 75,
    "potential": 83,
    "growth": 8,
    "marketValueEur": 9000000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 20000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 185,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 4,
    "squadRole": "שוער משחק רגל מעולה",
    "roleSystem": "בניית התקפה מאחור",
    "primaryRole": "שוער מטאטא (Sweeper Keeper) ++",
    "secondaryRole": "שוער קו (Goalkeeper) +",
    "playstyles": [
      {
        "name": "משחק רגל (Footwork+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 70,
      "pas": 81,
      "dri": 77,
      "def": 52,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p259065.png",
    "category": "bargains"
  },
  {
    "id": "ea-273621-james-beadle",
    "eaId": 273621,
    "name": "ג׳יימס בידל",
    "enName": "James Beadle",
    "age": 22,
    "position": "GK",
    "club": "ברמינגהאם סיטי",
    "nation": "אנגליה",
    "rating": 70,
    "potential": 84,
    "growth": 14,
    "marketValueEur": 3800000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 9500000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 196,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער אנגלי ענק ומבטיח",
    "roleSystem": "שליטה אווירית ורפלקסים",
    "primaryRole": "שוער תגובה (Goalkeeper) ++",
    "secondaryRole": "שליטה ברחבה (Cross Claimer) +",
    "playstyles": [
      {
        "name": "יציאה לכדורי גובה (Cross Claimer+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 70,
      "sho": 69,
      "pas": 68,
      "dri": 71,
      "def": 46,
      "phy": 70
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p273621.png",
    "category": "bargains"
  },
  {
    "id": "ea-264846-cristhian-mosquera",
    "eaId": 264846,
    "name": "כריסטיאן מוסקרה",
    "enName": "Cristhian Mosquera",
    "age": 22,
    "position": "CB",
    "club": "ארסנל",
    "nation": "ספרד",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 28000000,
    "weeklyWageEur": 48000,
    "releaseClauseEur": 62000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 191,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "עמוד תווך בהגנה",
    "roleSystem": "תיקולים אתלטיים ומהירות",
    "primaryRole": "בלם מהיר ומונע חדירה (Stopper) ++",
    "secondaryRole": "בלם יוזם (Ball-Playing Defender) +",
    "playstyles": [
      {
        "name": "חסימת מעבר (Block+)",
        "plus": true
      },
      {
        "name": "מהירות (Rapid)"
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 48,
      "pas": 65,
      "dri": 66,
      "def": 79,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p264846.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-254262-zeno-debast",
    "eaId": 254262,
    "name": "זנו דבאסט",
    "enName": "Zeno Debast",
    "age": 22,
    "position": "CB",
    "club": "ספורטינג",
    "nation": "בלגיה",
    "rating": 78,
    "potential": 87,
    "growth": 9,
    "marketValueEur": 27000000,
    "weeklyWageEur": 38000,
    "releaseClauseEur": 60000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 191,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "בלם פותח טכני",
    "roleSystem": "מסירות עומק מדויקות מההגנה",
    "primaryRole": "בלם יוזם (Ball-Playing Defender) ++",
    "secondaryRole": "עוצר התקפות (Cover Defender) +",
    "playstyles": [
      {
        "name": "מסירות ארוכות (Long Ball+)",
        "plus": true
      },
      {
        "name": "תיקול נקי (Jockey)"
      }
    ],
    "attributes": {
      "pac": 70,
      "sho": 56,
      "pas": 76,
      "dri": 74,
      "def": 78,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p254262.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-270997-samson-baidoo",
    "eaId": 270997,
    "name": "סמסון באידו",
    "enName": "Samson Baidoo",
    "age": 22,
    "position": "CB",
    "club": "לאנס",
    "nation": "אוסטריה",
    "rating": 78,
    "potential": 87,
    "growth": 9,
    "marketValueEur": 26000000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 55000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם עוצמתי ומהיר",
    "roleSystem": "פיזיות וניקוי רחבה",
    "primaryRole": "בלם עוצר (Stopper) ++",
    "secondaryRole": "בלם נייד (Cover) +",
    "playstyles": [
      {
        "name": "נוכחות פיזית (Bruiser+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 26,
      "pas": 54,
      "dri": 65,
      "def": 77,
      "phy": 79
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p270997.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-278903-j-r-my-jacquet",
    "eaId": 278903,
    "name": "ז׳רמי ז׳אקה",
    "enName": "Jérémy Jacquet",
    "age": 21,
    "position": "CB",
    "club": "ליברפול",
    "nation": "צרפת",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 22500000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 52000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 188,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם אתלטי מבטיח",
    "roleSystem": "סגירת שטחים ויציאה קדימה",
    "primaryRole": "בלם יוזם (Ball-Playing Defender) ++",
    "secondaryRole": "עוצר (Stopper) +",
    "playstyles": [
      {
        "name": "חטיפת מסירות (Intercept+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 64,
      "sho": 38,
      "pas": 61,
      "dri": 62,
      "def": 77,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278903.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-278340-pietro-comuzzo",
    "eaId": 278340,
    "name": "פייטרו קומוצו",
    "enName": "Pietro Comuzzo",
    "age": 21,
    "position": "CB",
    "club": "טורינו",
    "nation": "איטליה",
    "rating": 75,
    "potential": 86,
    "growth": 11,
    "marketValueEur": 13000000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 30000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם איטלקי טקטי",
    "roleSystem": "משמעת הגנתית ותיקולי עמידה",
    "primaryRole": "עוצר התקפות (Stopper) ++",
    "secondaryRole": "בלם כיסוי (Cover) +",
    "playstyles": [
      {
        "name": "תיקול נקי (Jockey+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 52,
      "sho": 31,
      "pas": 52,
      "dri": 60,
      "def": 77,
      "phy": 69
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278340.png",
    "category": "bargains"
  },
  {
    "id": "ea-256666-yerson-mosquera",
    "eaId": 256666,
    "name": "ירסון מוסקרה",
    "enName": "Yerson Mosquera",
    "age": 25,
    "position": "CB",
    "club": "וולבס",
    "nation": "קולומביה",
    "rating": 73,
    "potential": 82,
    "growth": 9,
    "marketValueEur": 6500000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 15000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 188,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם כוח קולומביאני",
    "roleSystem": "אגרסיביות ומאבקי אוויר",
    "primaryRole": "עוצר פיזי (Stopper) ++",
    "secondaryRole": "בלם קו ראשון (Defender) +",
    "playstyles": [
      {
        "name": "ניתור אווירי (Aerial+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 81,
      "sho": 30,
      "pas": 50,
      "dri": 53,
      "def": 72,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256666.png",
    "category": "bargains"
  },
  {
    "id": "ea-74140-dies-janse",
    "eaId": 74140,
    "name": "דיס יאנסה",
    "enName": "Dies Janse",
    "age": 20,
    "position": "CB",
    "club": "אייאקס",
    "nation": "הולנד",
    "rating": 70,
    "potential": 85,
    "growth": 15,
    "marketValueEur": 4200000,
    "weeklyWageEur": 10000,
    "releaseClauseEur": 11000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 196,
    "foot": "שמאל",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם שמאלי ענק ואיכותי",
    "roleSystem": "בניית משחק ברגל שמאל",
    "primaryRole": "בלם יוזם (Ball-Playing Defender) ++",
    "secondaryRole": "מגדלור ברחבה (Aerial Stopper) +",
    "playstyles": [
      {
        "name": "ניתור אווירי (Aerial+)",
        "plus": true
      },
      {
        "name": "מסירות עומק (Long Ball)"
      }
    ],
    "attributes": {
      "pac": 63,
      "sho": 36,
      "pas": 61,
      "dri": 63,
      "def": 68,
      "phy": 79
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p74140.png",
    "category": "bargains"
  },
  {
    "id": "ea-277447-stav-lemkin",
    "eaId": 277447,
    "name": "סתיו למקין",
    "enName": "Stav Lemkin",
    "age": 23,
    "position": "CB",
    "club": "טוונטה",
    "nation": "ישראל",
    "rating": 70,
    "potential": 81,
    "growth": 11,
    "marketValueEur": 3600000,
    "weeklyWageEur": 14000,
    "releaseClauseEur": 8500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם ישראלי מהיר באירופה",
    "roleSystem": "מהירות הדבקה ותיקולי גלישה",
    "primaryRole": "בלם כיסוי מהיר (Cover Defender) ++",
    "secondaryRole": "עוצר התקפות (Stopper) +",
    "playstyles": [
      {
        "name": "תיקול גלישה (Slide Tackle+)",
        "plus": true
      },
      {
        "name": "צעד מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 37,
      "pas": 53,
      "dri": 50,
      "def": 69,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277447.png",
    "category": "israel"
  },
  {
    "id": "ea-266253-fresneda",
    "eaId": 266253,
    "name": "איוואן פרסנדה",
    "enName": "Fresneda",
    "age": 22,
    "position": "RB",
    "club": "ספורטינג",
    "nation": "ספרד",
    "rating": 76,
    "potential": 86,
    "growth": 10,
    "marketValueEur": 17500000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 42000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 183,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן ימני שלם ומודרני",
    "roleSystem": "הגנה קשוחה ותמיכה באגף",
    "primaryRole": "מגן שלם (Fullback) ++",
    "secondaryRole": "מגן תוקף (Attacking Fullback) +",
    "playstyles": [
      {
        "name": "תיקול נקי (Jockey+)",
        "plus": true
      },
      {
        "name": "סיבולת (Relentless)"
      }
    ],
    "attributes": {
      "pac": 81,
      "sho": 51,
      "pas": 61,
      "dri": 75,
      "def": 72,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p266253.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-74310-nicol-savona",
    "eaId": 74310,
    "name": "ניקולו סאבונה",
    "enName": "Nicolò Savona",
    "age": 23,
    "position": "RB",
    "club": "נוטינגהאם פורסט",
    "nation": "איטליה",
    "rating": 75,
    "potential": 85,
    "growth": 10,
    "marketValueEur": 13500000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 32000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 192,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן ימני גבוה ופיזי",
    "roleSystem": "סגירה אלכסונית וחוסן אווירי",
    "primaryRole": "מגן הגנתי (Defensive Fullback) ++",
    "secondaryRole": "מגן הפוך (Inverted Fullback) +",
    "playstyles": [
      {
        "name": "חסימת מעבר (Block+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 53,
      "pas": 69,
      "dri": 69,
      "def": 74,
      "phy": 71
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p74310.png",
    "category": "bargains"
  },
  {
    "id": "ea-268312-sa-l-kumbedi",
    "eaId": 268312,
    "name": "סאל קומבדי",
    "enName": "Saël Kumbedi",
    "age": 21,
    "position": "RB",
    "club": "וולפסבורג",
    "nation": "צרפת",
    "rating": 75,
    "potential": 85,
    "growth": 10,
    "marketValueEur": 13000000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 30000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 177,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן סילון מהיר באגף",
    "roleSystem": "ריצות עקיפה ולחץ גבוה",
    "primaryRole": "מגן כנף תוקף (Wingback) ++",
    "secondaryRole": "מגן תוקף (Attacking Fullback) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "ריצה (Rapid)"
      }
    ],
    "attributes": {
      "pac": 77,
      "sho": 45,
      "pas": 68,
      "dri": 76,
      "def": 70,
      "phy": 62
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p268312.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-278923-h-ctor-fort",
    "eaId": 278923,
    "name": "הקטור פורט",
    "enName": "Héctor Fort",
    "age": 20,
    "position": "RB",
    "club": "ברצלונה",
    "nation": "ספרד",
    "rating": 72,
    "potential": 86,
    "growth": 14,
    "marketValueEur": 6500000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 22000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "בוגר לה מאסיה רב גוני",
    "roleSystem": "שליטה טכנית ויכולת בשני האגפים",
    "primaryRole": "מגן הפוך (Inverted Fullback) ++",
    "secondaryRole": "מגן תוקף (Attacking Fullback) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "מסירות קצרות (Tiki Taka)"
      }
    ],
    "attributes": {
      "pac": 84,
      "sho": 60,
      "pas": 66,
      "dri": 70,
      "def": 67,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278923.png",
    "category": "bargains"
  },
  {
    "id": "ea-77559-ilay-feingold",
    "eaId": 77559,
    "name": "עיליי פיינגולד",
    "enName": "Ilay Feingold",
    "age": 22,
    "position": "RB",
    "club": "ניו אינגלנד",
    "nation": "ישראל",
    "rating": 67,
    "potential": 79,
    "growth": 12,
    "marketValueEur": 2200000,
    "weeklyWageEur": 8000,
    "releaseClauseEur": 5500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 180,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן ישראלי לוחמני ב-MLS",
    "roleSystem": "אגרסיביות ומאבקים לאורך הקו",
    "primaryRole": "מגן שלם (Fullback) ++",
    "secondaryRole": "מגן תוקף (Attacking Fullback) +",
    "playstyles": [
      {
        "name": "סיבולת ברזל (Relentless+)",
        "plus": true
      },
      {
        "name": "תיקול נקי (Jockey)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 54,
      "pas": 63,
      "dri": 65,
      "def": 61,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p77559.png",
    "category": "israel"
  },
  {
    "id": "ea-278773-myles-lewis-skelly",
    "eaId": 278773,
    "name": "מיילס לואיס-סקלי",
    "enName": "Myles Lewis-Skelly",
    "age": 20,
    "position": "LB",
    "club": "ארסנל",
    "nation": "אנגליה",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 28000000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 65000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 178,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאלי מודרני מבריק",
    "roleSystem": "כניסה למרכז כקשר (Inverted)",
    "primaryRole": "מגן שמאלי הפוך (Inverted Fullback) ++",
    "secondaryRole": "קשר מרכז (Playmaker) +",
    "playstyles": [
      {
        "name": "קור רוח בלחץ (Press Proven+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 60,
      "pas": 75,
      "dri": 77,
      "def": 76,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278773.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-71305-joaquin-seys",
    "eaId": 71305,
    "name": "ז׳ואקים סייס",
    "enName": "Joaquin Seys",
    "age": 21,
    "position": "LB",
    "club": "קלאב ברוז׳",
    "nation": "בלגיה",
    "rating": 74,
    "potential": 85,
    "growth": 11,
    "marketValueEur": 10500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 25000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 184,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן בלגי אתלטי בעלייה",
    "roleSystem": "עליות קו והגבהות חדות",
    "primaryRole": "מגן תוקף (Attacking Fullback) ++",
    "secondaryRole": "מגן כנף (Wingback) +",
    "playstyles": [
      {
        "name": "הגבהה מדויקת (Whipped Pass+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 81,
      "sho": 54,
      "pas": 70,
      "dri": 72,
      "def": 68,
      "phy": 68
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p71305.png",
    "category": "bargains"
  },
  {
    "id": "ea-262968-archie-brown",
    "eaId": 262968,
    "name": "ארצ׳י בראון",
    "enName": "Archie Brown",
    "age": 24,
    "position": "LB",
    "club": "פנרבחצ׳ה",
    "nation": "אנגליה",
    "rating": 73,
    "potential": 82,
    "growth": 9,
    "marketValueEur": 6500000,
    "weeklyWageEur": 25000,
    "releaseClauseEur": 15000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאלי ענק ומהיר",
    "roleSystem": "כוח מתפרץ וכיסוי פיזי",
    "primaryRole": "מגן שלם (Fullback) ++",
    "secondaryRole": "מגן כנף עוצמתי (Wingback) +",
    "playstyles": [
      {
        "name": "נוכחות פיזית (Bruiser+)",
        "plus": true
      },
      {
        "name": "מהירות (Rapid)"
      }
    ],
    "attributes": {
      "pac": 87,
      "sho": 54,
      "pas": 68,
      "dri": 73,
      "def": 65,
      "phy": 80
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262968.png",
    "category": "bargains"
  },
  {
    "id": "ea-72100-ars-ne-kouassi",
    "eaId": 72100,
    "name": "ארסן קואסי",
    "enName": "Arsène Kouassi",
    "age": 21,
    "position": "LB",
    "club": "לוריאן",
    "nation": "בורקינה פאסו",
    "rating": 77,
    "potential": 85,
    "growth": 8,
    "marketValueEur": 18000000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 38000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 181,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן מהיר וערני",
    "roleSystem": "לחץ באגף ויירוט מסירות",
    "primaryRole": "מגן תוקף (Attacking Fullback) ++",
    "secondaryRole": "מגן שלם (Fullback) +",
    "playstyles": [
      {
        "name": "חטיפת מסירות (Intercept+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 88,
      "sho": 56,
      "pas": 73,
      "dri": 74,
      "def": 70,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p72100.png",
    "category": "bargains"
  },
  {
    "id": "ea-273599-harry-amass",
    "eaId": 273599,
    "name": "הארי אמאס",
    "enName": "Harry Amass",
    "age": 19,
    "position": "LB",
    "club": "מנצ׳סטר יונייטד",
    "nation": "אנגליה",
    "rating": 69,
    "potential": 86,
    "growth": 17,
    "marketValueEur": 3200000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 9000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "יהלום שמאלי בעלייה",
    "roleSystem": "טכניקה יוצאת דופן והגבהות",
    "primaryRole": "מגן תוקף (Attacking Fullback) ++",
    "secondaryRole": "מגן הפוך (Inverted) +",
    "playstyles": [
      {
        "name": "הגבהה מדויקת (Whipped Pass+)",
        "plus": true
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 77,
      "sho": 42,
      "pas": 62,
      "dri": 70,
      "def": 65,
      "phy": 59
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p273599.png",
    "category": "bargains"
  },
  {
    "id": "ea-74463-marc-bernal",
    "eaId": 74463,
    "name": "מארק ברנאל",
    "enName": "Marc Bernal",
    "age": 19,
    "position": "CDM",
    "club": "ברצלונה",
    "nation": "ספרד",
    "rating": 78,
    "potential": 89,
    "growth": 11,
    "marketValueEur": 30000000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 75000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 191,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "היורש של בוסקטס",
    "roleSystem": "שליטה בקצב ומסירות עומק",
    "primaryRole": "עושה משחק עמוק (Deep Playmaker) ++",
    "secondaryRole": "קשר אחורי שומר (Holding) +",
    "playstyles": [
      {
        "name": "מסירות קצרות (Tiki Taka+)",
        "plus": true
      },
      {
        "name": "חטיפות (Intercept)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 62,
      "pas": 73,
      "dri": 77,
      "def": 73,
      "phy": 79
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p74463.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-257084-lesley-ugochukwu",
    "eaId": 257084,
    "name": "לזלי אוגוצ׳וקוו",
    "enName": "Lesley Ugochukwu",
    "age": 22,
    "position": "CDM",
    "club": "גלאטסראיי",
    "nation": "צרפת",
    "rating": 76,
    "potential": 86,
    "growth": 10,
    "marketValueEur": 18000000,
    "weeklyWageEur": 36000,
    "releaseClauseEur": 42000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 191,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "עוגן פיזי בלתי עביר",
    "roleSystem": "שבירת התקפות יריב ומאבקים",
    "primaryRole": "קשר הורס (Ball Winning Midfielder) ++",
    "secondaryRole": "עוגן אחורי (Holding) +",
    "playstyles": [
      {
        "name": "נוכחות פיזית (Bruiser+)",
        "plus": true
      },
      {
        "name": "חסימת מעבר (Block)"
      }
    ],
    "attributes": {
      "pac": 65,
      "sho": 62,
      "pas": 70,
      "dri": 72,
      "def": 74,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p257084.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-271975-stefan-bajcetic",
    "eaId": 271975,
    "name": "סטפן בייצ׳טיץ׳",
    "enName": "Stefan Bajcetic",
    "age": 21,
    "position": "CDM",
    "club": "ליברפול",
    "nation": "ספרד",
    "rating": 72,
    "potential": 86,
    "growth": 14,
    "marketValueEur": 6500000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 22000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר אחורי ספרדי טקטי",
    "roleSystem": "קריאת מהלכים וחילוצי כדור",
    "primaryRole": "קשר אחורי שלם (Holding Midfielder) ++",
    "secondaryRole": "עושה משחק עמוק (Deep Playmaker) +",
    "playstyles": [
      {
        "name": "חטיפת מסירות (Intercept+)",
        "plus": true
      },
      {
        "name": "מסירות קצרות (Tiki Taka)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 52,
      "pas": 67,
      "dri": 73,
      "def": 71,
      "phy": 62
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p271975.png",
    "category": "bargains"
  },
  {
    "id": "ea-71351-jorthy-mokio",
    "eaId": 71351,
    "name": "ז׳ורטי מוקיו",
    "enName": "Jorthy Mokio",
    "age": 18,
    "position": "CDM",
    "club": "אייאקס",
    "nation": "קונגו",
    "rating": 71,
    "potential": 87,
    "growth": 16,
    "marketValueEur": 4800000,
    "weeklyWageEur": 10000,
    "releaseClauseEur": 16000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 183,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "היהלום הצעיר של אייאקס",
    "roleSystem": "יכולת כדרור תחת לחץ ומסירות",
    "primaryRole": "עושה משחק עמוק (Deep Playmaker) ++",
    "secondaryRole": "קשר אחורי שלם (Holding) +",
    "playstyles": [
      {
        "name": "קור רוח בלחץ (Press Proven+)",
        "plus": true
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 67,
      "sho": 50,
      "pas": 64,
      "dri": 72,
      "def": 69,
      "phy": 70
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p71351.png",
    "category": "bargains"
  },
  {
    "id": "ea-279731-gabriel-moscardo",
    "eaId": 279731,
    "name": "גבריאל מוסקרדו",
    "enName": "Gabriel Moscardo",
    "age": 21,
    "position": "CDM",
    "club": "אספניול",
    "nation": "ברזיל",
    "rating": 72,
    "potential": 85,
    "growth": 13,
    "marketValueEur": 6000000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 18000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר אחורי ברזילאי לוחם",
    "roleSystem": "סגירת מרחבים ותיקולי עמידה",
    "primaryRole": "קשר הורס (Ball Winner) ++",
    "secondaryRole": "קשר אחורי שלם (Holding) +",
    "playstyles": [
      {
        "name": "תיקול נקי (Jockey+)",
        "plus": true
      },
      {
        "name": "נוכחות (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 64,
      "sho": 52,
      "pas": 62,
      "dri": 71,
      "def": 70,
      "phy": 78
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p279731.png",
    "category": "bargains"
  },
  {
    "id": "ea-274024-eden-karzev",
    "eaId": 274024,
    "name": "עדן קארצב",
    "enName": "Eden Karzev",
    "age": 26,
    "position": "CDM",
    "club": "שנג׳ן פנג סיטי",
    "nation": "ישראל",
    "rating": 70,
    "potential": 78,
    "growth": 8,
    "marketValueEur": 2500000,
    "weeklyWageEur": 16000,
    "releaseClauseEur": 6000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "קשר אחורי ישראלי עוצמתי",
    "roleSystem": "בעיטות מרחוק ופיזיות",
    "primaryRole": "קשר אחורי הורס (Ball Winner) ++",
    "secondaryRole": "בועט מרחוק (Power Shooter) +",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot+)",
        "plus": true
      },
      {
        "name": "נוכחות פיזית (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 65,
      "pas": 67,
      "dri": 68,
      "def": 66,
      "phy": 81
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274024.png",
    "category": "israel"
  },
  {
    "id": "ea-272926-lucas-bergvall",
    "eaId": 272926,
    "name": "לוקאס ברגוואל",
    "enName": "Lucas Bergvall",
    "age": 20,
    "position": "CM",
    "club": "טוטנהאם",
    "nation": "שוודיה",
    "rating": 78,
    "potential": 89,
    "growth": 11,
    "marketValueEur": 30000000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 75000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 187,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "מאסטרו שוודי לעתיד",
    "roleSystem": "ריצה מרחבה לרחבה ויצירתיות",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "עושה משחק מתקדם (Playmaker) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive)"
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 68,
      "pas": 77,
      "dri": 78,
      "def": 72,
      "phy": 71
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272926.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269859-arthur-vermeeren",
    "eaId": 269859,
    "name": "ארתור ורמירן",
    "enName": "Arthur Vermeeren",
    "age": 21,
    "position": "CM",
    "club": "ר.ב. לייפציג",
    "nation": "בלגיה",
    "rating": 76,
    "potential": 87,
    "growth": 11,
    "marketValueEur": 18500000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 45000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 176,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "מנוע הקישור הבלגי",
    "roleSystem": "אינטליגנציית משחק ומסירות חכמות",
    "primaryRole": "קשר מרכז שולט (Deep Playmaker) ++",
    "secondaryRole": "קשר רחבה לרחבה (Box-to-Box) +",
    "playstyles": [
      {
        "name": "מסירות קצרות (Tiki Taka+)",
        "plus": true
      },
      {
        "name": "ראיית משחק (Vision)"
      }
    ],
    "attributes": {
      "pac": 66,
      "sho": 55,
      "pas": 78,
      "dri": 77,
      "def": 66,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269859.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-276602-assan-ou-draogo",
    "eaId": 276602,
    "name": "אסאן אואדראוגו",
    "enName": "Assan Ouédraogo",
    "age": 20,
    "position": "CM",
    "club": "ר.ב. לייפציג",
    "nation": "גרמניה",
    "rating": 76,
    "potential": 88,
    "growth": 12,
    "marketValueEur": 19000000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 48000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 192,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "קשר עוצמתי עם צעדי ענק",
    "roleSystem": "פריצות במרכז השדה וכוח",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "חודר עומק (Shadow Midfielder) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "כוח (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 82,
      "sho": 72,
      "pas": 76,
      "dri": 82,
      "def": 59,
      "phy": 71
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p276602.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-71532-kees-smit",
    "eaId": 71532,
    "name": "קיס סמיט",
    "enName": "Kees Smit",
    "age": 20,
    "position": "CM",
    "club": "אלקמאר",
    "nation": "הולנד",
    "rating": 75,
    "potential": 86,
    "growth": 11,
    "marketValueEur": 13500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 32000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 182,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "כישרון הולנדי קלאסי",
    "roleSystem": "שליטה טכנית ותנועה חכמה",
    "primaryRole": "עושה משחק מרכזי (Playmaker) ++",
    "secondaryRole": "קשר רחבה לרחבה (Box-to-Box) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 59,
      "sho": 63,
      "pas": 74,
      "dri": 79,
      "def": 65,
      "phy": 69
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p71532.png",
    "category": "bargains"
  },
  {
    "id": "ea-275291-niccol-pisilli",
    "eaId": 275291,
    "name": "ניקולו פיסילי",
    "enName": "Niccolò Pisilli",
    "age": 22,
    "position": "CM",
    "club": "רומא",
    "nation": "איטליה",
    "rating": 74,
    "potential": 85,
    "growth": 11,
    "marketValueEur": 10500000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 28000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר נשמה רומאי",
    "roleSystem": "כניסות לרחבה ללא כדור",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "קשר חודר (Shadow Striker) +",
    "playstyles": [
      {
        "name": "סיבולת ברזל (Relentless+)",
        "plus": true
      },
      {
        "name": "סיומת (First Touch)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 67,
      "pas": 70,
      "dri": 75,
      "def": 72,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p275291.png",
    "category": "bargains"
  },
  {
    "id": "ea-70887-gavriel-kanichowsky",
    "eaId": 70887,
    "name": "גבי קניקובסקי",
    "enName": "Gavriel Kanichowsky",
    "age": 28,
    "position": "CM",
    "club": "פרנצווארוש",
    "nation": "ישראל",
    "rating": 70,
    "potential": 76,
    "growth": 6,
    "marketValueEur": 2400000,
    "weeklyWageEur": 15000,
    "releaseClauseEur": 5500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 165,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "קשר ישראלי זריז ונמרץ",
    "roleSystem": "לחץ בלתי פוסק ותנועה במגרש",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "עושה משחק נייד (Playmaker) +",
    "playstyles": [
      {
        "name": "סיבולת ברזל (Relentless+)",
        "plus": true
      },
      {
        "name": "מסירות קצרות (Tiki Taka)"
      }
    ],
    "attributes": {
      "pac": 67,
      "sho": 64,
      "pas": 69,
      "dri": 69,
      "def": 62,
      "phy": 69
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p70887.png",
    "category": "israel"
  },
  {
    "id": "ea-279173-franco-mastantuono",
    "eaId": 279173,
    "name": "פרנקו מסטנטואונו",
    "enName": "Franco Mastantuono",
    "age": 19,
    "position": "CAM",
    "club": "פיורנטינה",
    "nation": "ארגנטינה",
    "rating": 77,
    "potential": 89,
    "growth": 12,
    "marketValueEur": 24000000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 60000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 177,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "הקוסם הארגנטינאי הצעיר",
    "roleSystem": "בעיטות חופשיות ודריבל מבריק",
    "primaryRole": "עושה משחק מתקדם (Advanced Playmaker) ++",
    "secondaryRole": "חלוץ צללים (Shadow Striker) +",
    "playstyles": [
      {
        "name": "מצבים נייחים (Dead Ball+)",
        "plus": true
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 71,
      "pas": 75,
      "dri": 79,
      "def": 50,
      "phy": 65
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p279173.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-272612-brajan-gruda",
    "eaId": 272612,
    "name": "בראיאן גרודה",
    "enName": "Brajan Gruda",
    "age": 22,
    "position": "CAM",
    "club": "ר.ב. לייפציג",
    "nation": "גרמניה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 22000000,
    "weeklyWageEur": 34000,
    "releaseClauseEur": 52000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "קשר התקפי גרמני דינמי",
    "roleSystem": "כדרור חודר וסיומת",
    "primaryRole": "עושה משחק חופשי (Playmaker) ++",
    "secondaryRole": "כנף ימין חודר (Inside Forward) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "צעד מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 83,
      "sho": 72,
      "pas": 74,
      "dri": 82,
      "def": 32,
      "phy": 64
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272612.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-266237-paul-wanner",
    "eaId": 266237,
    "name": "פאול ואנר",
    "enName": "Paul Wanner",
    "age": 20,
    "position": "CAM",
    "club": "פ.ס.וו",
    "nation": "אוסטריה",
    "rating": 76,
    "potential": 88,
    "growth": 12,
    "marketValueEur": 19500000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 48000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "גאון מסירה וסיומת",
    "roleSystem": "ראיית משחק ובעיטות מתוחכמות",
    "primaryRole": "עושה משחק מתקדם (Advanced Playmaker) ++",
    "secondaryRole": "חלוץ צללים (Shadow Striker) +",
    "playstyles": [
      {
        "name": "מסירה חותכת (Incisive Pass+)",
        "plus": true
      },
      {
        "name": "סיומת (Finesse Shot)"
      }
    ],
    "attributes": {
      "pac": 72,
      "sho": 66,
      "pas": 74,
      "dri": 77,
      "def": 57,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p266237.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269312-tommaso-baldanzi",
    "eaId": 269312,
    "name": "תומאסו בלדנצי",
    "enName": "Tommaso Baldanzi",
    "age": 23,
    "position": "CAM",
    "club": "גנואה",
    "nation": "איטליה",
    "rating": 75,
    "potential": 85,
    "growth": 10,
    "marketValueEur": 14000000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 32000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 170,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "עושה משחק איטלקי זריז",
    "roleSystem": "שטחים צפופים וכדורי רוחב",
    "primaryRole": "עושה משחק חופשי (Playmaker) ++",
    "secondaryRole": "חלוץ שני (Second Striker) +",
    "playstyles": [
      {
        "name": "זריזות ונגיעה (First Touch+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 72,
      "pas": 72,
      "dri": 76,
      "def": 45,
      "phy": 42
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269312.png",
    "category": "bargains"
  },
  {
    "id": "ea-273459-chris-rigg",
    "eaId": 273459,
    "name": "כריס ריג",
    "enName": "Chris Rigg",
    "age": 19,
    "position": "CAM",
    "club": "סנדרלנד",
    "nation": "אנגליה",
    "rating": 74,
    "potential": 88,
    "growth": 14,
    "marketValueEur": 11000000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 30000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "פלא אנגלי בעלייה מטאורית",
    "roleSystem": "נחישות, לחץ וסיומת מרשימה",
    "primaryRole": "חלוץ צללים (Shadow Striker) ++",
    "secondaryRole": "עושה משחק מתקדם (Playmaker) +",
    "playstyles": [
      {
        "name": "סיבולת ברזל (Relentless+)",
        "plus": true
      },
      {
        "name": "סיומת חדה (Finesse)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 68,
      "pas": 74,
      "dri": 76,
      "def": 60,
      "phy": 56
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p273459.png",
    "category": "bargains"
  },
  {
    "id": "ea-279044-geovany-quenda",
    "eaId": 279044,
    "name": "ז׳אובאני קוואנדה",
    "enName": "Geovany Quenda",
    "age": 19,
    "position": "RW",
    "club": "צ׳לסי",
    "nation": "פורטוגל",
    "rating": 76,
    "potential": 88,
    "growth": 12,
    "marketValueEur": 19000000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 50000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 172,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "טורפדו באגף ימין",
    "roleSystem": "מהירות על ודריבל אחד על אחד",
    "primaryRole": "חלוץ כנף חותך (Inside Forward) ++",
    "secondaryRole": "קיצוני רחבה (Winger) +",
    "playstyles": [
      {
        "name": "ריצה מתפרצת (Rapid+)",
        "plus": true
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 86,
      "sho": 64,
      "pas": 72,
      "dri": 79,
      "def": 41,
      "phy": 68
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p279044.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-271807-ethan-nwaneri",
    "eaId": 271807,
    "name": "אית׳ן נוואנרי",
    "enName": "Ethan Nwaneri",
    "age": 19,
    "position": "RW",
    "club": "ארסנל",
    "nation": "אנגליה",
    "rating": 75,
    "potential": 89,
    "growth": 14,
    "marketValueEur": 15000000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 45000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 176,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "הכישרון הגדול של ארסנל",
    "roleSystem": "חיתוך למרכז ובעיטה מסובבת",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "עושה משחק מתקדם (Playmaker) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      },
      {
        "name": "שליטה טכנית (Technical)"
      }
    ],
    "attributes": {
      "pac": 81,
      "sho": 69,
      "pas": 74,
      "dri": 77,
      "def": 50,
      "phy": 54
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p271807.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269292-gianluca-prestianni",
    "eaId": 269292,
    "name": "ג׳אנלוקה פרסטיאני",
    "enName": "Gianluca Prestianni",
    "age": 20,
    "position": "RW",
    "club": "בנפיקה",
    "nation": "ארגנטינה",
    "rating": 75,
    "potential": 87,
    "growth": 12,
    "marketValueEur": 14500000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 40000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 166,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "שד משחת ארגנטינאי",
    "roleSystem": "מרכז כובד נמוך ושינויי כיוון",
    "primaryRole": "להטוטן כנף (Winger) ++",
    "secondaryRole": "חלוץ כנף חודר (Inside Forward) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "להטוטן (Trickster)"
      }
    ],
    "attributes": {
      "pac": 87,
      "sho": 64,
      "pas": 65,
      "dri": 81,
      "def": 44,
      "phy": 53
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269292.png",
    "category": "bargains"
  },
  {
    "id": "ea-265600-roony-bardghji",
    "eaId": 265600,
    "name": "רוני ברדג׳י",
    "enName": "Roony Bardghji",
    "age": 20,
    "position": "RW",
    "club": "ברצלונה",
    "nation": "שוודיה",
    "rating": 74,
    "potential": 86,
    "growth": 12,
    "marketValueEur": 11000000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 35000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 173,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "סקורר מאגף ימין",
    "roleSystem": "הטעיה שמאלה ובעיטה לחיבורים",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "סקורר כנף (Poacher) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 71,
      "pas": 70,
      "dri": 78,
      "def": 27,
      "phy": 58
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p265600.png",
    "category": "bargains"
  },
  {
    "id": "ea-279497-tyler-dibling",
    "eaId": 279497,
    "name": "טיילר דיבלינג",
    "enName": "Tyler Dibling",
    "age": 20,
    "position": "RM",
    "club": "אברטון",
    "nation": "אנגליה",
    "rating": 74,
    "potential": 86,
    "growth": 12,
    "marketValueEur": 11500000,
    "weeklyWageEur": 25000,
    "releaseClauseEur": 32000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 180,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "קיצוני אנגלי חסר פחד",
    "roleSystem": "דריבל ישיר ומשיכת עבירות",
    "primaryRole": "קיצוני קלאסי (Winger) ++",
    "secondaryRole": "חלוץ כנף חודר (Inside Forward) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 67,
      "pas": 71,
      "dri": 77,
      "def": 38,
      "phy": 64
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p279497.png",
    "category": "bargains"
  },
  {
    "id": "ea-263377-liel-abada",
    "eaId": 263377,
    "name": "ליאל עבדה",
    "enName": "Liel Abada",
    "age": 25,
    "position": "RW",
    "club": "שארלוט",
    "nation": "ישראל",
    "rating": 70,
    "potential": 78,
    "growth": 8,
    "marketValueEur": 3000000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 8000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 168,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "סקורר ישראלי מהיר באגף",
    "roleSystem": "תנועה לעומק וסיומת בנגיעה",
    "primaryRole": "חלוץ כנף חותך (Inside Forward) ++",
    "secondaryRole": "קיצוני רחבה (Winger) +",
    "playstyles": [
      {
        "name": "צעד מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "סיומת (First Touch)"
      }
    ],
    "attributes": {
      "pac": 87,
      "sho": 67,
      "pas": 63,
      "dri": 70,
      "def": 41,
      "phy": 59
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p263377.png",
    "category": "israel"
  },
  {
    "id": "ea-258378-mika-godts",
    "eaId": 258378,
    "name": "מיקה גודטס",
    "enName": "Mika Godts",
    "age": 21,
    "position": "LW",
    "club": "פריז סן ז׳רמן",
    "nation": "בלגיה",
    "rating": 78,
    "potential": 88,
    "growth": 10,
    "marketValueEur": 29000000,
    "weeklyWageEur": 45000,
    "releaseClauseEur": 68000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 176,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "אמן הדריבל הבלגי",
    "roleSystem": "חדירות אלכסוניות וסיומת מסובבת",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "להטוטן קו (Winger) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "סיומת (Finesse)"
      }
    ],
    "attributes": {
      "pac": 83,
      "sho": 72,
      "pas": 71,
      "dri": 84,
      "def": 42,
      "phy": 65
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p258378.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-256420-malick-fofana",
    "eaId": 256420,
    "name": "מאליק פופאנה",
    "enName": "Malick Fofana",
    "age": 21,
    "position": "LW",
    "club": "ליון",
    "nation": "בלגיה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 23000000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 50000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 169,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "מהירות מסחררת באגף",
    "roleSystem": "התקפות מעבר קטלניות",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "קיצוני מהיר (Winger) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "ריצה (Rapid)"
      }
    ],
    "attributes": {
      "pac": 85,
      "sho": 69,
      "pas": 70,
      "dri": 83,
      "def": 40,
      "phy": 46
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256420.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-275324-assane-diao",
    "eaId": 275324,
    "name": "אסאן דיאו",
    "enName": "Assane Diao",
    "age": 21,
    "position": "LW",
    "club": "קומו",
    "nation": "סנגל",
    "rating": 76,
    "potential": 86,
    "growth": 10,
    "marketValueEur": 17000000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 38000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "כנף פיזי ועוצמתי",
    "roleSystem": "שילוב של מהירות, גובה וכוח",
    "primaryRole": "חלוץ כנף כוחני (Power Winger) ++",
    "secondaryRole": "חלוץ מטרה (Target) +",
    "playstyles": [
      {
        "name": "ריצה מתפרצת (Rapid+)",
        "plus": true
      },
      {
        "name": "נוכחות (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 90,
      "sho": 74,
      "pas": 67,
      "dri": 77,
      "def": 38,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p275324.png",
    "category": "bargains"
  },
  {
    "id": "ea-72159-mikey-moore",
    "eaId": 72159,
    "name": "מייקי מור",
    "enName": "Mikey Moore",
    "age": 19,
    "position": "LW",
    "club": "טוטנהאם",
    "nation": "אנגליה",
    "rating": 74,
    "potential": 89,
    "growth": 15,
    "marketValueEur": 12000000,
    "weeklyWageEur": 20000,
    "releaseClauseEur": 35000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 180,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "העתיד של נבחרת אנגליה",
    "roleSystem": "אלגנטיות בכדרור וראיית משחק",
    "primaryRole": "חלוץ כנף חודר (Inside Forward) ++",
    "secondaryRole": "עושה משחק כנף (Wide Playmaker) +",
    "playstyles": [
      {
        "name": "שליטה טכנית (Technical+)",
        "plus": true
      },
      {
        "name": "סיומת (Finesse)"
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 68,
      "pas": 72,
      "dri": 77,
      "def": 35,
      "phy": 54
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p72159.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-74566-samuel-mbangula",
    "eaId": 74566,
    "name": "סמואל מבאנגולה",
    "enName": "Samuel Mbangula",
    "age": 22,
    "position": "LW",
    "club": "ורדר ברמן",
    "nation": "בלגיה",
    "rating": 74,
    "potential": 85,
    "growth": 11,
    "marketValueEur": 10500000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 26000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 178,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "כנף בלגי חצוף ויעיל",
    "roleSystem": "תנועה לשטחים מתים וסיומת",
    "primaryRole": "חלוץ כנף חותך (Inside Forward) ++",
    "secondaryRole": "קיצוני (Winger) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 83,
      "sho": 71,
      "pas": 66,
      "dri": 77,
      "def": 35,
      "phy": 55
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p74566.png",
    "category": "bargains"
  },
  {
    "id": "ea-262105-julien-duranville",
    "eaId": 262105,
    "name": "ז׳וליאן דוראנוויל",
    "enName": "Julien Duranville",
    "age": 20,
    "position": "LW",
    "club": "ליון",
    "nation": "בלגיה",
    "rating": 72,
    "potential": 87,
    "growth": 15,
    "marketValueEur": 6800000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 22000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 170,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "מהירות קיצונית באגף",
    "roleSystem": "אחד על אחד סוחף",
    "primaryRole": "להטוטן קו (Winger) ++",
    "secondaryRole": "חלוץ כנף חודר (Inside Forward) +",
    "playstyles": [
      {
        "name": "צעד ראשון מהיר (Quick Step+)",
        "plus": true
      },
      {
        "name": "להטוטן (Trickster)"
      }
    ],
    "attributes": {
      "pac": 88,
      "sho": 61,
      "pas": 63,
      "dri": 82,
      "def": 26,
      "phy": 49
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262105.png",
    "category": "bargains"
  },
  {
    "id": "ea-276048-matias-fernandez-pardo",
    "eaId": 276048,
    "name": "מתיאס פרננדס-פארדו",
    "enName": "Matias Fernandez-Pardo",
    "age": 21,
    "position": "ST",
    "club": "לאנס",
    "nation": "בלגיה",
    "rating": 78,
    "potential": 87,
    "growth": 9,
    "marketValueEur": 28000000,
    "weeklyWageEur": 38000,
    "releaseClauseEur": 55000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 184,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "חלוץ מודרני מגוון",
    "roleSystem": "סיומת בכל מצב ומשחק שילוב",
    "primaryRole": "חלוץ רחבה שלם (Advanced Forward) ++",
    "secondaryRole": "חלוץ שני (Second Striker) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      },
      {
        "name": "מהירות (Rapid)"
      }
    ],
    "attributes": {
      "pac": 91,
      "sho": 77,
      "pas": 70,
      "dri": 82,
      "def": 43,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p276048.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-277327-francesco-pio-esposito",
    "eaId": 277327,
    "name": "פרנצ׳סקו פיו אספוסיטו",
    "enName": "Francesco Pio Esposito",
    "age": 21,
    "position": "ST",
    "club": "אינטר",
    "nation": "איטליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 23500000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 50000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 189,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "חלוץ מטרה איטלקי קלאסי",
    "roleSystem": "משחק גב לשער ומשחק ראש",
    "primaryRole": "חלוץ מטרה עוצמתי (Target Forward) ++",
    "secondaryRole": "חלוץ שפיץ (Poacher) +",
    "playstyles": [
      {
        "name": "נגיחה עוצמתית (Power Header+)",
        "plus": true
      },
      {
        "name": "כוח (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 59,
      "sho": 78,
      "pas": 71,
      "dri": 73,
      "def": 38,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277327.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-277689-conrad-harder",
    "eaId": 277689,
    "name": "קונראד הרדר",
    "enName": "Conrad Harder",
    "age": 21,
    "position": "ST",
    "club": "ר.ב. לייפציג",
    "nation": "דנמרק",
    "rating": 75,
    "potential": 86,
    "growth": 11,
    "marketValueEur": 14000000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 35000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 186,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "חלוץ כוח סקנדינבי",
    "roleSystem": "תנועה אגרסיבית ברחבה",
    "primaryRole": "חלוץ רחבה שלם (Advanced Forward) ++",
    "secondaryRole": "חלוץ כוח (Target Forward) +",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 79,
      "sho": 76,
      "pas": 66,
      "dri": 72,
      "def": 30,
      "phy": 81
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277689.png",
    "category": "bargains"
  },
  {
    "id": "ea-278813-marc-guiu",
    "eaId": 278813,
    "name": "מארק גיו",
    "enName": "Marc Guiu",
    "age": 20,
    "position": "ST",
    "club": "צ׳לסי",
    "nation": "ספרד",
    "rating": 71,
    "potential": 86,
    "growth": 15,
    "marketValueEur": 5000000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 18000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 187,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "סקורר רחבה טבעי",
    "roleSystem": "מיקום ברחבה וסיומת בנגיעה",
    "primaryRole": "חלוץ מטרה נייד (Poacher) ++",
    "secondaryRole": "חלוץ רחבה (Advanced Forward) +",
    "playstyles": [
      {
        "name": "נגיחה עוצמתית (Power Header+)",
        "plus": true
      },
      {
        "name": "סיומת (First Touch)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 70,
      "pas": 55,
      "dri": 69,
      "def": 36,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278813.png",
    "category": "bargains"
  },
  {
    "id": "ea-240833-youssoufa-moukoko",
    "eaId": 240833,
    "name": "יוסופה מוקוקו",
    "enName": "Youssoufa Moukoko",
    "age": 21,
    "position": "ST",
    "club": "פ.צ. קופנהגן",
    "nation": "גרמניה",
    "rating": 71,
    "potential": 84,
    "growth": 13,
    "marketValueEur": 4800000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 15000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 179,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "סקורר מהיר ומציאה",
    "roleSystem": "זריזות רגליים וסיומת ברגל שמאל",
    "primaryRole": "חלוץ מטרה נייד (Poacher) ++",
    "secondaryRole": "חלוץ רחבה שלם (Advanced Forward) +",
    "playstyles": [
      {
        "name": "סיומת קטלנית (Finesse Shot+)",
        "plus": true
      },
      {
        "name": "צעד מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 75,
      "sho": 70,
      "pas": 61,
      "dri": 76,
      "def": 33,
      "phy": 71
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p240833.png",
    "category": "bargains"
  },
  {
    "id": "ea-70892-dor-turgeman",
    "eaId": 70892,
    "name": "דור תורג׳מן",
    "enName": "Dor Turgeman",
    "age": 22,
    "position": "ST",
    "club": "ניו אינגלנד",
    "nation": "ישראל",
    "rating": 69,
    "potential": 80,
    "growth": 11,
    "marketValueEur": 2800000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 6500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "חלוץ מטרה ישראלי ב-MLS",
    "roleSystem": "כוח פריצה וסיומת רחבה",
    "primaryRole": "חלוץ רחבה שלם (Advanced Forward) ++",
    "secondaryRole": "חלוץ מטרה (Target Forward) +",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot+)",
        "plus": true
      },
      {
        "name": "צעד מהיר (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 67,
      "pas": 50,
      "dri": 67,
      "def": 28,
      "phy": 78
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p70892.png",
    "category": "israel"
  },
  {
    "id": "ea-246791-manor-solomon",
    "eaId": 246791,
    "name": "מנור סולומון",
    "enName": "Manor Solomon",
    "age": 26,
    "position": "LM",
    "club": "לידס יונייטד",
    "nation": "ישראל",
    "rating": 76,
    "potential": 83,
    "growth": 7,
    "marketValueEur": 14500000,
    "weeklyWageEur": 38000,
    "releaseClauseEur": 26000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 170,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "שחקן הרכב מוביל",
    "roleSystem": "חיתוך פנימה / דריבל על הקו",
    "primaryRole": "שחקן אגף חודר (Inside Forward) ++",
    "secondaryRole": "יוצר מרווחים (Wide Playmaker) +",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Quick Step+)",
        "plus": true
      },
      {
        "name": "דריבל טכני (Technical)"
      },
      {
        "name": "בעיטה מסובבת (Finesse Shot)"
      }
    ],
    "attributes": {
      "pac": 84,
      "sho": 72,
      "pas": 72,
      "dri": 79,
      "def": 43,
      "phy": 41
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p246791.png",
    "category": "israel"
  },
  {
    "id": "ea-263180-tai-baribo",
    "eaId": 263180,
    "name": "תאי בריבו",
    "enName": "Tai Baribo",
    "age": 27,
    "position": "ST",
    "club": "פילדלפיה יוניון",
    "nation": "ישראל",
    "rating": 73,
    "potential": 80,
    "growth": 7,
    "marketValueEur": 4800000,
    "weeklyWageEur": 16000,
    "releaseClauseEur": 9200000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 181,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "חלוץ חוד פותח",
    "roleSystem": "סיומת ברחבה / לחץ גבוה",
    "primaryRole": "חלוץ רחבה (Poacher) +",
    "secondaryRole": "חלוץ מטרה (Target Forward)",
    "playstyles": [
      {
        "name": "סיומת חדה (Acrobatic)"
      },
      {
        "name": "משחק ראש (Aerial)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 74,
      "pas": 55,
      "dri": 70,
      "def": 28,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p263180.png",
    "category": "israel"
  },
  {
    "id": "ea-277840-omri-gandelman",
    "eaId": 277840,
    "name": "עומרי גנדלמן",
    "enName": "Omri Gandelman",
    "age": 25,
    "position": "CAM",
    "club": "גנט",
    "nation": "ישראל",
    "rating": 71,
    "potential": 82,
    "growth": 11,
    "marketValueEur": 4200000,
    "weeklyWageEur": 14000,
    "releaseClauseEur": 8500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 188,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר התקפי / גולר",
    "roleSystem": "הצטרפות מקו שני / בעיטות מרחוק",
    "primaryRole": "קשר חודר (Shadow Striker) +",
    "secondaryRole": "קשר רחבה לרחבה (Box-to-Box)",
    "playstyles": [
      {
        "name": "משחק ראש (Power Header+)",
        "plus": true
      },
      {
        "name": "בעיטת יעף (Volley)"
      }
    ],
    "attributes": {
      "pac": 56,
      "sho": 72,
      "pas": 65,
      "dri": 69,
      "def": 70,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277840.png",
    "category": "israel"
  },
  {
    "id": "ea-247375-dia-saba",
    "eaId": 247375,
    "name": "דיא סבע",
    "enName": "Dia Saba",
    "age": 33,
    "position": "CAM",
    "club": "מכבי חיפה",
    "nation": "ישראל",
    "rating": 70,
    "potential": 78,
    "growth": 8,
    "marketValueEur": 1800000,
    "weeklyWageEur": 15000,
    "releaseClauseEur": 3500000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 168,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "עושה משחק חופשי",
    "roleSystem": "יצירתיות / בעיטות חופשיות",
    "primaryRole": "עושה משחק (Playmaker) +",
    "secondaryRole": "שחקן אגף חופשי",
    "playstyles": [
      {
        "name": "בעיטות חופשיות (Dead Ball+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive Pass)"
      }
    ],
    "attributes": {
      "pac": 78,
      "sho": 69,
      "pas": 70,
      "dri": 71,
      "def": 29,
      "phy": 63
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p247375.png",
    "category": "israel"
  },
  {
    "id": "ea-75295-idan-toklomati",
    "eaId": 75295,
    "name": "עידן טוקלומטי",
    "enName": "Idan Toklomati",
    "age": 21,
    "position": "ST",
    "club": "שארלוט FC",
    "nation": "ישראל",
    "rating": 70,
    "potential": 83,
    "growth": 13,
    "marketValueEur": 3600000,
    "weeklyWageEur": 9000,
    "releaseClauseEur": 7500000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "יהלום צעיר / פריצה",
    "roleSystem": "ריצות עומק פיזיות ומהירות",
    "primaryRole": "חלוץ מתפרצות (Advanced Forward) +",
    "secondaryRole": "שחקן כנף פיזי",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Rapid)"
      },
      {
        "name": "כוח פיזי (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 84,
      "sho": 64,
      "pas": 51,
      "dri": 65,
      "def": 26,
      "phy": 73
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p75295.png",
    "category": "israel"
  },
  {
    "id": "ea-70885-mahmoud-jaber",
    "eaId": 70885,
    "name": "מחמוד ג׳אבר",
    "enName": "Mahmoud Jaber",
    "age": 26,
    "position": "CM",
    "club": "מכבי חיפה",
    "nation": "ישראל",
    "rating": 70,
    "potential": 80,
    "growth": 10,
    "marketValueEur": 2600000,
    "weeklyWageEur": 11000,
    "releaseClauseEur": 5200000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 178,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מנוע מרכז השדה",
    "roleSystem": "לחץ בלתי פוסק וחילוצי כדור",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) +",
    "secondaryRole": "קשר אחורי מחלץ",
    "playstyles": [
      {
        "name": "סיבולת בלתי נגמרת (Relentless)"
      },
      {
        "name": "תיקול עמידה (Interception)"
      }
    ],
    "attributes": {
      "pac": 67,
      "sho": 40,
      "pas": 61,
      "dri": 72,
      "def": 58,
      "phy": 65
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p70885.png",
    "category": "israel"
  },
  {
    "id": "ea-258485-filip-j-rgensen",
    "eaId": 258485,
    "name": "פיליפ יורגנסן",
    "enName": "Filip Jörgensen",
    "age": 24,
    "position": "GK",
    "club": "צ׳לסי",
    "nation": "דנמרק",
    "rating": 77,
    "potential": 86,
    "growth": 9,
    "marketValueEur": 17500000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 33000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 190,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער העתיד",
    "roleSystem": "שוער קו מודרני ומשחק רגל",
    "primaryRole": "שוער משוחרר (Sweeper Keeper) +",
    "secondaryRole": "עוצר בעיטות מסורתי",
    "playstyles": [
      {
        "name": "רפלקס חתולי (Footwork+)",
        "plus": true
      },
      {
        "name": "מסירה ארוכה (Long Ball)"
      }
    ],
    "attributes": {
      "pac": 77,
      "sho": 76,
      "pas": 72,
      "dri": 78,
      "def": 47,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p258485.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-271114-dennis-seimen",
    "eaId": 271114,
    "name": "דניס זיימן",
    "enName": "Dennis Seimen",
    "age": 20,
    "position": "GK",
    "club": "שטוטגרט",
    "nation": "גרמניה",
    "rating": 72,
    "potential": 86,
    "growth": 14,
    "marketValueEur": 5200000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 12500000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 193,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער מבטיח",
    "roleSystem": "עוצמת זינוק וגובה",
    "primaryRole": "עוצר בעיטות (Shot Stopper) +",
    "secondaryRole": "שוער משוחרר",
    "playstyles": [
      {
        "name": "שליטה ברחבה (Cross Claimer)"
      }
    ],
    "attributes": {
      "pac": 72,
      "sho": 68,
      "pas": 75,
      "dri": 76,
      "def": 40,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p271114.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-263339-carl-rushworth",
    "eaId": 263339,
    "name": "קארל ראשוורת׳",
    "enName": "Carl Rushworth",
    "age": 25,
    "position": "GK",
    "club": "ברייטון",
    "nation": "אנגליה",
    "rating": 76,
    "potential": 84,
    "growth": 8,
    "marketValueEur": 11000000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 21000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 191,
    "foot": "שמאל",
    "skills": 1,
    "weakFoot": 3,
    "squadRole": "שוער ראשון",
    "roleSystem": "תגובות קו מהירות",
    "primaryRole": "עוצר בעיטות (Shot Stopper)",
    "secondaryRole": "שוער משוחרר",
    "playstyles": [
      {
        "name": "זינוק מהיר (Far Reach)"
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 75,
      "pas": 75,
      "dri": 77,
      "def": 55,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p263339.png",
    "category": "bargains"
  },
  {
    "id": "ea-219244-david-von-ballmoos",
    "eaId": 219244,
    "name": "דוד פון באלמוס",
    "enName": "David von Ballmoos",
    "age": 31,
    "position": "GK",
    "club": "יאנג בויז",
    "nation": "שווייץ",
    "rating": 70,
    "potential": 76,
    "growth": 6,
    "marketValueEur": 1400000,
    "weeklyWageEur": 9000,
    "releaseClauseEur": 2800000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 192,
    "foot": "ימין",
    "skills": 1,
    "weakFoot": 2,
    "squadRole": "שוער ותיק ויציב",
    "roleSystem": "ניסיון ויציבות בשער",
    "primaryRole": "שוער קלאסי",
    "secondaryRole": "שליטה ברחבה",
    "playstyles": [
      {
        "name": "תפיסה בטוחה (Rush Out)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 71,
      "pas": 72,
      "dri": 69,
      "def": 50,
      "phy": 70
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p219244.png",
    "category": "bargains"
  },
  {
    "id": "ea-261264-david-affengruber",
    "eaId": 261264,
    "name": "דוד אפנגרובר",
    "enName": "David Affengruber",
    "age": 25,
    "position": "CB",
    "club": "אלצ׳ה",
    "nation": "אוסטריה",
    "rating": 76,
    "potential": 84,
    "growth": 8,
    "marketValueEur": 12500000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 24000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 185,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "מנהיג מרכז ההגנה",
    "roleSystem": "בלימה מודרנית ומשחק ראש",
    "primaryRole": "בלם בונה (Ball-Playing Defender) +",
    "secondaryRole": "בלם פיזי",
    "playstyles": [
      {
        "name": "תיקול מדויק (Anticipate+)",
        "plus": true
      },
      {
        "name": "משחק ראש (Aerial)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 43,
      "pas": 57,
      "dri": 69,
      "def": 76,
      "phy": 83
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p261264.png",
    "category": "bargains"
  },
  {
    "id": "ea-255687-david-zima",
    "eaId": 255687,
    "name": "דוד זימה",
    "enName": "David Zima",
    "age": 25,
    "position": "CB",
    "club": "סלביה פראג",
    "nation": "צ׳כיה",
    "rating": 76,
    "potential": 83,
    "growth": 7,
    "marketValueEur": 12000000,
    "weeklyWageEur": 20000,
    "releaseClauseEur": 22000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 190,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם יציב",
    "roleSystem": "חסימות והרחקות ברחבה",
    "primaryRole": "בלם סטאופר (Stopper) +",
    "secondaryRole": "בלם בונה",
    "playstyles": [
      {
        "name": "חסימות (Block)"
      },
      {
        "name": "תיקול עמידה (Interception)"
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 39,
      "pas": 56,
      "dri": 67,
      "def": 77,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p255687.png",
    "category": "bargains"
  },
  {
    "id": "ea-256008-morato",
    "eaId": 256008,
    "name": "מוראטו",
    "enName": "Morato",
    "age": 25,
    "position": "CB",
    "club": "נוטינגהאם פורסט",
    "nation": "ברזיל",
    "rating": 75,
    "potential": 84,
    "growth": 9,
    "marketValueEur": 10500000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 21000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 190,
    "foot": "שמאל",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם שמאל פיזי",
    "roleSystem": "עוצמה פיזית ומאבקי אוויר",
    "primaryRole": "בלם סטאופר (Stopper) +",
    "secondaryRole": "בלם בונה",
    "playstyles": [
      {
        "name": "עוצמה פיזית (Bruiser+)",
        "plus": true
      },
      {
        "name": "מאבק אווירי (Aerial)"
      }
    ],
    "attributes": {
      "pac": 53,
      "sho": 37,
      "pas": 57,
      "dri": 60,
      "def": 75,
      "phy": 80
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256008.png",
    "category": "bargains"
  },
  {
    "id": "ea-272785-christian-mawissa",
    "eaId": 272785,
    "name": "כריסטיאן מוויסה",
    "enName": "Christian Mawissa",
    "age": 21,
    "position": "CB",
    "club": "מונקו",
    "nation": "צרפת",
    "rating": 75,
    "potential": 86,
    "growth": 11,
    "marketValueEur": 11500000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 25000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 182,
    "foot": "שמאל",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "כישרון הגנתי על",
    "roleSystem": "מהירות חילוץ ויכולת סגירה",
    "primaryRole": "בלם מהיר ומכסה (Cover) +",
    "secondaryRole": "מגן שמאלי הגנתי",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Quick Step)"
      },
      {
        "name": "תיקול גלישה (Slide Tackle)"
      }
    ],
    "attributes": {
      "pac": 79,
      "sho": 31,
      "pas": 57,
      "dri": 64,
      "def": 75,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272785.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-257253-bobby-thomas",
    "eaId": 257253,
    "name": "בובי תומאס",
    "enName": "Bobby Thomas",
    "age": 25,
    "position": "CB",
    "club": "קובנטרי סיטי",
    "nation": "אנגליה",
    "rating": 74,
    "potential": 82,
    "growth": 8,
    "marketValueEur": 7500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 15000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 193,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "עמוד התווך בהגנה",
    "roleSystem": "שליטה מוחלטת באוויר",
    "primaryRole": "בלם מטרה (Stopper)",
    "secondaryRole": "בלם מסורתי",
    "playstyles": [
      {
        "name": "משחק ראש עוצמתי (Power Header)"
      }
    ],
    "attributes": {
      "pac": 64,
      "sho": 51,
      "pas": 51,
      "dri": 57,
      "def": 73,
      "phy": 83
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p257253.png",
    "category": "bargains"
  },
  {
    "id": "ea-278013-saba-sazonov",
    "eaId": 278013,
    "name": "סבא סזונוב",
    "enName": "Saba Sazonov",
    "age": 24,
    "position": "CB",
    "club": "חטאפה",
    "nation": "גאורגיה",
    "rating": 73,
    "potential": 84,
    "growth": 11,
    "marketValueEur": 6500000,
    "weeklyWageEur": 16000,
    "releaseClauseEur": 14000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 194,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם סלע",
    "roleSystem": "מאבקים אישיים ללא פשרות",
    "primaryRole": "בלם אגרסיבי (Stopper)",
    "secondaryRole": "בלם כיסוי",
    "playstyles": [
      {
        "name": "כוח פיזי (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 51,
      "sho": 40,
      "pas": 58,
      "dri": 60,
      "def": 73,
      "phy": 68
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278013.png",
    "category": "bargains"
  },
  {
    "id": "ea-257000-andrea-carboni",
    "eaId": 257000,
    "name": "אנדריאה קרבוני",
    "enName": "Andrea Carboni",
    "age": 25,
    "position": "CB",
    "club": "מונצה",
    "nation": "איטליה",
    "rating": 71,
    "potential": 83,
    "growth": 12,
    "marketValueEur": 4000000,
    "weeklyWageEur": 15000,
    "releaseClauseEur": 9000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 185,
    "foot": "שמאל",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "בלם שמאל טקטי",
    "roleSystem": "הגנה אזורית איטלקית מסורתית",
    "primaryRole": "בלם כיסוי (Cover) +",
    "secondaryRole": "בלם בונה",
    "playstyles": [
      {
        "name": "חכמת מיקום (Anticipate)"
      }
    ],
    "attributes": {
      "pac": 49,
      "sho": 38,
      "pas": 57,
      "dri": 62,
      "def": 74,
      "phy": 68
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p257000.png",
    "category": "bargains"
  },
  {
    "id": "ea-260815-arnau-mart-nez",
    "eaId": 260815,
    "name": "ארנאו מרטינס",
    "enName": "Arnau Martínez",
    "age": 23,
    "position": "RB",
    "club": "ג׳ירונה",
    "nation": "ספרד",
    "rating": 77,
    "potential": 86,
    "growth": 9,
    "marketValueEur": 19000000,
    "weeklyWageEur": 32000,
    "releaseClauseEur": 38000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 182,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן ימני שלם",
    "roleSystem": "תמיכה בהנעת כדור וכניסות לאמצע",
    "primaryRole": "מגן מוכנס (Inverted Fullback) ++",
    "secondaryRole": "בלם ימני",
    "playstyles": [
      {
        "name": "תיקול מדויק (Anticipate+)",
        "plus": true
      },
      {
        "name": "מסירה מחושבת (Whipped Cross)"
      }
    ],
    "attributes": {
      "pac": 78,
      "sho": 55,
      "pas": 72,
      "dri": 72,
      "def": 75,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p260815.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-271574-rico-lewis",
    "eaId": 271574,
    "name": "ריקו לואיס",
    "enName": "Rico Lewis",
    "age": 21,
    "position": "RB",
    "club": "מנצ׳סטר סיטי",
    "nation": "אנגליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 22000000,
    "weeklyWageEur": 45000,
    "releaseClauseEur": 46000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 169,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "גאון טקטי צעיר",
    "roleSystem": "מעבר חלק מעמדת מגן לקשר מרכזי",
    "primaryRole": "מגן קשר (Inverted Wingback) ++",
    "secondaryRole": "קשר אחורי",
    "playstyles": [
      {
        "name": "שליטה בלחץ (Press Proven+)",
        "plus": true
      },
      {
        "name": "טיקי טאקה (Tiki Taka)"
      }
    ],
    "attributes": {
      "pac": 75,
      "sho": 55,
      "pas": 74,
      "dri": 79,
      "def": 74,
      "phy": 58
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p271574.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-228881-davide-calabria",
    "eaId": 228881,
    "name": "דוידה קלאבריה",
    "enName": "Davide Calabria",
    "age": 29,
    "position": "RB",
    "club": "פנאתינייקוס",
    "nation": "איטליה",
    "rating": 77,
    "potential": 81,
    "growth": 4,
    "marketValueEur": 11000000,
    "weeklyWageEur": 34000,
    "releaseClauseEur": 18000000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 177,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן מנוסה",
    "roleSystem": "סדר הגנתי ומשמעת טקטית",
    "primaryRole": "מגן הגנתי (Fullback)",
    "secondaryRole": "מגן תוקף",
    "playstyles": [
      {
        "name": "תיקול גלישה (Slide Tackle)"
      }
    ],
    "attributes": {
      "pac": 77,
      "sho": 57,
      "pas": 70,
      "dri": 73,
      "def": 75,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p228881.png",
    "category": "bargains"
  },
  {
    "id": "ea-270559-tiago-santos",
    "eaId": 270559,
    "name": "טיאגו סנטוס",
    "enName": "Tiago Santos",
    "age": 24,
    "position": "RB",
    "club": "ליל",
    "nation": "פורטוגל",
    "rating": 75,
    "potential": 86,
    "growth": 11,
    "marketValueEur": 12000000,
    "weeklyWageEur": 25000,
    "releaseClauseEur": 26000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "שחקן אגף מחשמל",
    "roleSystem": "דריבל מסחרר ומהירות על הקו",
    "primaryRole": "מגן תוקף (Attacking Wingback) +",
    "secondaryRole": "קשר כנף ימין",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Rapid+)",
        "plus": true
      },
      {
        "name": "דריבל טכני (Technical)"
      }
    ],
    "attributes": {
      "pac": 82,
      "sho": 56,
      "pas": 71,
      "dri": 75,
      "def": 70,
      "phy": 62
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p270559.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-263908-bradley-locko",
    "eaId": 263908,
    "name": "בראדלי לוקו",
    "enName": "Bradley Locko",
    "age": 24,
    "position": "LB",
    "club": "ברסט",
    "nation": "צרפת",
    "rating": 75,
    "potential": 85,
    "growth": 10,
    "marketValueEur": 11500000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 24000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 180,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאלי מודרני",
    "roleSystem": "עבודה ללא הפסקה לאורך כל האגף",
    "primaryRole": "מגן רחבה לרחבה (Wingback) +",
    "secondaryRole": "מגן הגנתי",
    "playstyles": [
      {
        "name": "סיבולת בלתי נגמרת (Relentless)"
      },
      {
        "name": "חסימת קווי מסירה (Intercept)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 50,
      "pas": 63,
      "dri": 71,
      "def": 74,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p263908.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-278237-davide-bartesaghi",
    "eaId": 278237,
    "name": "דוידה ברטסאגי",
    "enName": "Davide Bartesaghi",
    "age": 20,
    "position": "LB",
    "club": "מילאן",
    "nation": "איטליה",
    "rating": 74,
    "potential": 86,
    "growth": 12,
    "marketValueEur": 8500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 19000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 193,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן/בלם עוצמתי",
    "roleSystem": "גובה נדיר באגף השמאלי ועוצמה",
    "primaryRole": "מגן הגנתי פיזי (Inverted Fullback) +",
    "secondaryRole": "בלם שמאל",
    "playstyles": [
      {
        "name": "מאבקי גובה (Aerial)"
      },
      {
        "name": "תיקול עמידה (Stand Tackle)"
      }
    ],
    "attributes": {
      "pac": 78,
      "sho": 58,
      "pas": 67,
      "dri": 66,
      "def": 70,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p278237.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-262135-david-m-ller-wolfe",
    "eaId": 262135,
    "name": "דוד מולר וולף",
    "enName": "David Møller Wolfe",
    "age": 24,
    "position": "LB",
    "club": "וולבס",
    "nation": "נורווגיה",
    "rating": 73,
    "potential": 83,
    "growth": 10,
    "marketValueEur": 6200000,
    "weeklyWageEur": 22000,
    "releaseClauseEur": 13500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 181,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאלי סקנדינבי",
    "roleSystem": "הגבהות חדות ומהירות תגובה",
    "primaryRole": "מגן אגף (Wingback)",
    "secondaryRole": "מגן הגנתי",
    "playstyles": [
      {
        "name": "הגבהה מדויקת (Whipped Pass)"
      }
    ],
    "attributes": {
      "pac": 75,
      "sho": 53,
      "pas": 66,
      "dri": 69,
      "def": 67,
      "phy": 73
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p262135.png",
    "category": "bargains"
  },
  {
    "id": "ea-274093-david-herold",
    "eaId": 274093,
    "name": "דוד הרולד",
    "enName": "David Herold",
    "age": 23,
    "position": "LB",
    "club": "בורוסיה מנשנגלדבאך",
    "nation": "גרמניה",
    "rating": 71,
    "potential": 84,
    "growth": 13,
    "marketValueEur": 4200000,
    "weeklyWageEur": 14000,
    "releaseClauseEur": 9500000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 184,
    "foot": "שמאל",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מגן שמאלי מבטיח",
    "roleSystem": "יציבות בהגנה ותמיכה בהתקפה",
    "primaryRole": "מגן שלם (Fullback) +",
    "secondaryRole": "מגן תוקף",
    "playstyles": [
      {
        "name": "תיקול מדויק (Jockey)"
      }
    ],
    "attributes": {
      "pac": 69,
      "sho": 37,
      "pas": 62,
      "dri": 68,
      "def": 67,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274093.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-242280-lewis-ferguson",
    "eaId": 242280,
    "name": "לואיס פרגוסון",
    "enName": "Lewis Ferguson",
    "age": 27,
    "position": "CDM",
    "club": "בולוניה",
    "nation": "סקוטלנד",
    "rating": 77,
    "potential": 85,
    "growth": 8,
    "marketValueEur": 18000000,
    "weeklyWageEur": 38000,
    "releaseClauseEur": 32000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 181,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קפטן ומנהל משחק",
    "roleSystem": "שילוב בין הגנה קשוחה להצטרפות להתקפה",
    "primaryRole": "קשר אחורי יוצר (Deep-Lying Playmaker) +",
    "secondaryRole": "קשר רחבה לרחבה",
    "playstyles": [
      {
        "name": "ראיית משחק (Long Ball Pass+)",
        "plus": true
      },
      {
        "name": "בעיטות מרחוק (Power Shot)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 79,
      "pas": 74,
      "dri": 77,
      "def": 73,
      "phy": 76
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p242280.png",
    "category": "bargains"
  },
  {
    "id": "ea-256942-eric-martel",
    "eaId": 256942,
    "name": "אריק מרטל",
    "enName": "Eric Martel",
    "age": 24,
    "position": "CDM",
    "club": "מיינץ 05",
    "nation": "גרמניה",
    "rating": 76,
    "potential": 84,
    "growth": 8,
    "marketValueEur": 13000000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 25000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 188,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "גרזן בקישור האחורי",
    "roleSystem": "חסימת שטחים ותיקולים אגרסיביים",
    "primaryRole": "קשר הורס (Holding Midfielder) +",
    "secondaryRole": "בלם שלישי",
    "playstyles": [
      {
        "name": "תיקול עמידה (Interception+)",
        "plus": true
      },
      {
        "name": "אגרסיביות (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 58,
      "sho": 51,
      "pas": 64,
      "dri": 70,
      "def": 76,
      "phy": 82
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256942.png",
    "category": "bargains"
  },
  {
    "id": "ea-234319-lewis-travis",
    "eaId": 234319,
    "name": "לואיס טרוויס",
    "enName": "Lewis Travis",
    "age": 28,
    "position": "CDM",
    "club": "דרבי קאונטי",
    "nation": "אנגליה",
    "rating": 72,
    "potential": 78,
    "growth": 6,
    "marketValueEur": 3200000,
    "weeklyWageEur": 16000,
    "releaseClauseEur": 6000000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 183,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "קשר אחורי לוחם",
    "roleSystem": "לחץ פיזי ללא פשרות",
    "primaryRole": "קשר אחורי הורס",
    "secondaryRole": "מגן ימני גיבוי",
    "playstyles": [
      {
        "name": "תיקול גלישה (Slide Tackle)"
      }
    ],
    "attributes": {
      "pac": 63,
      "sho": 59,
      "pas": 65,
      "dri": 68,
      "def": 69,
      "phy": 78
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p234319.png",
    "category": "bargains"
  },
  {
    "id": "ea-273693-david-ozoh",
    "eaId": 273693,
    "name": "דוד אוזוה",
    "enName": "David Ozoh",
    "age": 21,
    "position": "CDM",
    "club": "קריסטל פאלאס",
    "nation": "אנגליה",
    "rating": 70,
    "potential": 84,
    "growth": 14,
    "marketValueEur": 3800000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 8500000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 184,
    "foot": "ימין",
    "skills": 2,
    "weakFoot": 3,
    "squadRole": "טנק צעיר בקישור",
    "roleSystem": "חילוצי כדור בעוצמה פיזית אדירה",
    "primaryRole": "קשר מחלץ (Anchor) +",
    "secondaryRole": "קשר רחבה לרחבה",
    "playstyles": [
      {
        "name": "עוצמה פיזית (Bruiser)"
      }
    ],
    "attributes": {
      "pac": 65,
      "sho": 55,
      "pas": 61,
      "dri": 68,
      "def": 67,
      "phy": 77
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p273693.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-256118-yannik-keitel",
    "eaId": 256118,
    "name": "יאניק קייטל",
    "enName": "Yannik Keitel",
    "age": 26,
    "position": "CDM",
    "club": "אאוגסבורג",
    "nation": "גרמניה",
    "rating": 70,
    "potential": 81,
    "growth": 11,
    "marketValueEur": 2900000,
    "weeklyWageEur": 14000,
    "releaseClauseEur": 6200000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 186,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר אחורי ממושמע",
    "roleSystem": "שמירה על מבנה וסגירת קווי מסירה",
    "primaryRole": "קשר עוגן (Anchor)",
    "secondaryRole": "קשר מרכזי",
    "playstyles": [
      {
        "name": "שמירה על מבנה (Anticipate)"
      }
    ],
    "attributes": {
      "pac": 62,
      "sho": 48,
      "pas": 63,
      "dri": 65,
      "def": 69,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p256118.png",
    "category": "bargains"
  },
  {
    "id": "ea-270964-jobe-bellingham",
    "eaId": 270964,
    "name": "ג׳וב בלינגהאם",
    "enName": "Jobe Bellingham",
    "age": 21,
    "position": "CM",
    "club": "בורוסיה דורטמונד",
    "nation": "אנגליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 22000000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 45000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 191,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "כוכב על בהתהוות",
    "roleSystem": "עוצמה אתלטית, חדירות מקו שני וראיית משחק",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box) ++",
    "secondaryRole": "קשר התקפי",
    "playstyles": [
      {
        "name": "שליטה בכדור (First Touch+)",
        "plus": true
      },
      {
        "name": "עוצמה פיזית (Bruiser)"
      },
      {
        "name": "מסירה חותכת (Incisive Pass)"
      }
    ],
    "attributes": {
      "pac": 70,
      "sho": 69,
      "pas": 73,
      "dri": 76,
      "def": 80,
      "phy": 83
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p270964.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-264095-hugo-sotelo",
    "eaId": 264095,
    "name": "הוגו סוטלו",
    "enName": "Hugo Sotelo",
    "age": 22,
    "position": "CM",
    "club": "לבנטה",
    "nation": "ספרד",
    "rating": 74,
    "potential": 85,
    "growth": 11,
    "marketValueEur": 8500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 18000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 173,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "אדריכל הקישור",
    "roleSystem": "שליטה בקצב המשחק ומסירות מפתח",
    "primaryRole": "עושה משחק עמוק (Deep-Lying Playmaker) +",
    "secondaryRole": "קשר מרכזי",
    "playstyles": [
      {
        "name": "טיקי טאקה (Tiki Taka)"
      },
      {
        "name": "מסירה מדויקת (Pinged Pass)"
      }
    ],
    "attributes": {
      "pac": 67,
      "sho": 66,
      "pas": 76,
      "dri": 73,
      "def": 68,
      "phy": 66
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p264095.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-221331-luca-mazzitelli",
    "eaId": 221331,
    "name": "לוקה מציטלי",
    "enName": "Luca Mazzitelli",
    "age": 30,
    "position": "CM",
    "club": "קומו",
    "nation": "איטליה",
    "rating": 72,
    "potential": 78,
    "growth": 6,
    "marketValueEur": 2800000,
    "weeklyWageEur": 19000,
    "releaseClauseEur": 5500000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 184,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מנהיג מרכז השדה",
    "roleSystem": "בעיטות חזקות מרחוק ושליטה",
    "primaryRole": "קשר מרכזי (Central Midfielder)",
    "secondaryRole": "קשר אחורי",
    "playstyles": [
      {
        "name": "בעיטה עוצמתית (Power Shot)"
      }
    ],
    "attributes": {
      "pac": 42,
      "sho": 70,
      "pas": 73,
      "dri": 72,
      "def": 67,
      "phy": 63
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p221331.png",
    "category": "bargains"
  },
  {
    "id": "ea-271974-bobby-clark",
    "eaId": 271974,
    "name": "בובי קלארק",
    "enName": "Bobby Clark",
    "age": 21,
    "position": "CAM",
    "club": "דרבי קאונטי",
    "nation": "אנגליה",
    "rating": 71,
    "potential": 85,
    "growth": 14,
    "marketValueEur": 4500000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 11000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "כישרון ליברפול צעיר",
    "roleSystem": "תנועה מהירה בין הקווים ודריבל",
    "primaryRole": "קשר חופשי (Playmaker) +",
    "secondaryRole": "קשר רחבה לרחבה",
    "playstyles": [
      {
        "name": "דריבל טכני (Technical)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 61,
      "pas": 69,
      "dri": 73,
      "def": 51,
      "phy": 59
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p271974.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-260056-telasco-segovia",
    "eaId": 260056,
    "name": "טלאסקו סגוביה",
    "enName": "Telasco Segovia",
    "age": 23,
    "position": "CM",
    "club": "אינטר מיאמי",
    "nation": "ונצואלה",
    "rating": 71,
    "potential": 84,
    "growth": 13,
    "marketValueEur": 4200000,
    "weeklyWageEur": 10000,
    "releaseClauseEur": 9500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 177,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מנוע דינמי",
    "roleSystem": "אנרגיה ללא הפסקה וראיית משחק",
    "primaryRole": "קשר רחבה לרחבה (Box-to-Box)",
    "secondaryRole": "קשר התקפי",
    "playstyles": [
      {
        "name": "סיבולת (Relentless)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 67,
      "pas": 67,
      "dri": 72,
      "def": 59,
      "phy": 67
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p260056.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-85829-guilherme-castilho",
    "eaId": 85829,
    "name": "גילרמה קסטיליו",
    "enName": "Guilherme Castilho",
    "age": 26,
    "position": "CM",
    "club": "חוארס",
    "nation": "ברזיל",
    "rating": 71,
    "potential": 80,
    "growth": 9,
    "marketValueEur": 3100000,
    "weeklyWageEur": 12000,
    "releaseClauseEur": 6500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 180,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "קשר ברזילאי טכני",
    "roleSystem": "מסירות עומק וניווט התקפי",
    "primaryRole": "עושה משחק מרכזי",
    "secondaryRole": "קשר חודר",
    "playstyles": [
      {
        "name": "מסירה ארוכה (Long Ball Pass)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 64,
      "pas": 74,
      "dri": 70,
      "def": 58,
      "phy": 68
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p85829.png",
    "category": "bargains"
  },
  {
    "id": "ea-72997-rodrigo-mora",
    "eaId": 72997,
    "name": "רודריגו מורה",
    "enName": "Rodrigo Mora",
    "age": 19,
    "position": "CAM",
    "club": "רומא",
    "nation": "פורטוגל",
    "rating": 77,
    "potential": 88,
    "growth": 11,
    "marketValueEur": 23000000,
    "weeklyWageEur": 35000,
    "releaseClauseEur": 50000000,
    "contractYears": "5 שנים (עד 2031)",
    "height": 170,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "יהלום פורטוגלי נדיר",
    "roleSystem": "דריבל צפוף, זריזות מדהימה ובישולים",
    "primaryRole": "עושה משחק חופשי (Playmaker) ++",
    "secondaryRole": "שחקן אגף ימין",
    "playstyles": [
      {
        "name": "דריבל טכני (Technical+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive Pass)"
      },
      {
        "name": "בעיטה מסובבת (Finesse Shot)"
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 66,
      "pas": 75,
      "dri": 80,
      "def": 40,
      "phy": 41
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p72997.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-233125-marcel-hartel",
    "eaId": 233125,
    "name": "מרסל הארטל",
    "enName": "Marcel Hartel",
    "age": 30,
    "position": "CAM",
    "club": "הנובר 96",
    "nation": "גרמניה",
    "rating": 76,
    "potential": 80,
    "growth": 4,
    "marketValueEur": 8500000,
    "weeklyWageEur": 25000,
    "releaseClauseEur": 15000000,
    "contractYears": "2 שנים (עד 2028)",
    "height": 177,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "מבשל בחסד",
    "roleSystem": "כדורים נייחים וראיית משחק עילאית",
    "primaryRole": "עושה משחק חופשי (Playmaker) +",
    "secondaryRole": "קשר מרכזי",
    "playstyles": [
      {
        "name": "כדורים חופשיים (Dead Ball+)",
        "plus": true
      },
      {
        "name": "ראיית משחק (Vision)"
      }
    ],
    "attributes": {
      "pac": 72,
      "sho": 73,
      "pas": 74,
      "dri": 76,
      "def": 59,
      "phy": 65
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p233125.png",
    "category": "bargains"
  },
  {
    "id": "ea-272781-eliesse-ben-seghir",
    "eaId": 272781,
    "name": "אליס בן סגיר",
    "enName": "Eliesse Ben Seghir",
    "age": 21,
    "position": "CAM",
    "club": "באייר לברקוזן",
    "nation": "מרוקו",
    "rating": 74,
    "potential": 87,
    "growth": 13,
    "marketValueEur": 9500000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 22000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 178,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "אשף כדרור צעיר",
    "roleSystem": "שבירת קווי הגנה עם שליטה צמודה",
    "primaryRole": "עושה משחק חודר (Shadow Striker) +",
    "secondaryRole": "שחקן כנף שמאל",
    "playstyles": [
      {
        "name": "דריבל טכני (Technical+)",
        "plus": true
      },
      {
        "name": "מהירות מתפרצת (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 73,
      "sho": 72,
      "pas": 71,
      "dri": 78,
      "def": 28,
      "phy": 61
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272781.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269495-facundo-buonanotte",
    "eaId": 269495,
    "name": "פקונדו בואננוטה",
    "enName": "Facundo Buonanotte",
    "age": 22,
    "position": "CAM",
    "club": "אלצ׳ה",
    "nation": "ארגנטינה",
    "rating": 74,
    "potential": 87,
    "growth": 13,
    "marketValueEur": 9800000,
    "weeklyWageEur": 26000,
    "releaseClauseEur": 23000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 174,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "כישרון ארגנטינאי נוצץ",
    "roleSystem": "בעיטות מחוץ לרחבה ומסירות עומק",
    "primaryRole": "עושה משחק יוצר (Playmaker) +",
    "secondaryRole": "שחקן כנף ימין",
    "playstyles": [
      {
        "name": "בעיטה מסובבת (Finesse Shot)"
      },
      {
        "name": "דריבל צפוף (Technical)"
      }
    ],
    "attributes": {
      "pac": 74,
      "sho": 70,
      "pas": 73,
      "dri": 75,
      "def": 30,
      "phy": 45
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269495.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-272602-valent-n-carboni",
    "eaId": 272602,
    "name": "ולנטין קרבוני",
    "enName": "Valentín Carboni",
    "age": 21,
    "position": "CAM",
    "club": "ראסינג קלוב",
    "nation": "ארגנטינה",
    "rating": 71,
    "potential": 86,
    "growth": 15,
    "marketValueEur": 4600000,
    "weeklyWageEur": 14000,
    "releaseClauseEur": 11000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 185,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "פרוספקט נבחרת ארגנטינה",
    "roleSystem": "עוצמה לצד טכניקה נדירה ברגל שמאל",
    "primaryRole": "עושה משחק חופשי (Playmaker) +",
    "secondaryRole": "חלוץ שני",
    "playstyles": [
      {
        "name": "שליטה בכדור (First Touch)"
      },
      {
        "name": "בעיטה מרחוק (Long Shots)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 69,
      "pas": 71,
      "dri": 72,
      "def": 46,
      "phy": 62
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p272602.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-266032-jamie-gittens",
    "eaId": 266032,
    "name": "ג׳יימי גיטנס",
    "enName": "Jamie Gittens",
    "age": 22,
    "position": "LM",
    "club": "צ׳לסי",
    "nation": "אנגליה",
    "rating": 77,
    "potential": 87,
    "growth": 10,
    "marketValueEur": 21500000,
    "weeklyWageEur": 42000,
    "releaseClauseEur": 44000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "סילון בלתי ניתן לעצירה",
    "roleSystem": "1 על 1 קטלני באגף שמאל וחיתוך פנימה",
    "primaryRole": "שחקן כנף חודר (Inside Forward) ++",
    "secondaryRole": "שחקן אגף טהור",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Quick Step+)",
        "plus": true
      },
      {
        "name": "דריבל טכני (Technical)"
      }
    ],
    "attributes": {
      "pac": 92,
      "sho": 72,
      "pas": 66,
      "dri": 82,
      "def": 27,
      "phy": 55
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p266032.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-277295-oscar-bobb",
    "eaId": 277295,
    "name": "אוסקר בוב",
    "enName": "Oscar Bobb",
    "age": 23,
    "position": "RM",
    "club": "פולהאם",
    "nation": "נורווגיה",
    "rating": 76,
    "potential": 87,
    "growth": 11,
    "marketValueEur": 16500000,
    "weeklyWageEur": 36000,
    "releaseClauseEur": 35000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 4,
    "squadRole": "קוסם באגף ימין",
    "roleSystem": "דריבל אלגנטי, בישולים וסיומת רכה",
    "primaryRole": "שחקן כנף יוצר (Wide Playmaker) ++",
    "secondaryRole": "חלוץ חופשי",
    "playstyles": [
      {
        "name": "שליטה הדוקה (Trickster+)",
        "plus": true
      },
      {
        "name": "מסירה חותכת (Incisive Pass)"
      }
    ],
    "attributes": {
      "pac": 81,
      "sho": 66,
      "pas": 73,
      "dri": 81,
      "def": 35,
      "phy": 43
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p277295.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-274516-ibrahim-osman",
    "eaId": 274516,
    "name": "איברהים עוסמאן",
    "enName": "Ibrahim Osman",
    "age": 22,
    "position": "LM",
    "club": "ברייטון",
    "nation": "גאנה",
    "rating": 72,
    "potential": 86,
    "growth": 14,
    "marketValueEur": 5500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 13000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "ימין",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "טיל אגף גנאי",
    "roleSystem": "מהירות מסחררת בעקיפת המגן",
    "primaryRole": "שחקן אגף מהיר (Winger) +",
    "secondaryRole": "שחקן כנף חודר",
    "playstyles": [
      {
        "name": "ספרינט מהיר (Rapid+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 91,
      "sho": 64,
      "pas": 63,
      "dri": 76,
      "def": 28,
      "phy": 57
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p274516.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-72754-luis-guilherme",
    "eaId": 72754,
    "name": "לואיס גילרמה",
    "enName": "Luis Guilherme",
    "age": 20,
    "position": "LM",
    "club": "ספורטינג",
    "nation": "ברזיל",
    "rating": 72,
    "potential": 87,
    "growth": 15,
    "marketValueEur": 5800000,
    "weeklyWageEur": 15000,
    "releaseClauseEur": 15000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "שמאל",
    "skills": 4,
    "weakFoot": 3,
    "squadRole": "פנומן ברזילאי צעיר",
    "roleSystem": "דריבל מהפנט ברגל שמאל",
    "primaryRole": "שחקן כנף חודר (Inside Forward) +",
    "secondaryRole": "קשר התקפי",
    "playstyles": [
      {
        "name": "דריבל טכני (Technical)"
      },
      {
        "name": "זריזות (Quick Step)"
      }
    ],
    "attributes": {
      "pac": 76,
      "sho": 63,
      "pas": 66,
      "dri": 76,
      "def": 33,
      "phy": 57
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p72754.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-266245-nestory-irankunda",
    "eaId": 266245,
    "name": "נסטורי אירנקונדה",
    "enName": "Nestory Irankunda",
    "age": 20,
    "position": "RM",
    "club": "ספורטינג",
    "nation": "אוסטרליה",
    "rating": 70,
    "potential": 86,
    "growth": 16,
    "marketValueEur": 3900000,
    "weeklyWageEur": 11000,
    "releaseClauseEur": 9800000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 175,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "תותח בעיטות צעיר",
    "roleSystem": "פצצות לרשת מ-30 מטר ומהירות אדירה",
    "primaryRole": "שחקן כנף עוצמתי (Winger) +",
    "secondaryRole": "חלוץ חודר",
    "playstyles": [
      {
        "name": "עוצמת בעיטה פראית (Power Shot+)",
        "plus": true
      },
      {
        "name": "ספרינט מהיר (Rapid)"
      }
    ],
    "attributes": {
      "pac": 92,
      "sho": 71,
      "pas": 63,
      "dri": 73,
      "def": 43,
      "phy": 74
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p266245.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-73070-promise-david",
    "eaId": 73070,
    "name": "פרומיס דוד",
    "enName": "Promise David",
    "age": 25,
    "position": "ST",
    "club": "ברייטון",
    "nation": "קנדה",
    "rating": 76,
    "potential": 84,
    "growth": 8,
    "marketValueEur": 13500000,
    "weeklyWageEur": 30000,
    "releaseClauseEur": 26000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 195,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "מפלצת ברחבה",
    "roleSystem": "גובה ענק, עוצמת דריסה ומשחק גב לשער",
    "primaryRole": "חלוץ מטרה (Target Forward) ++",
    "secondaryRole": "חלוץ רחבה",
    "playstyles": [
      {
        "name": "עוצמה פיזית (Bruiser+)",
        "plus": true
      },
      {
        "name": "משחק ראש (Aerial)"
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 79,
      "pas": 60,
      "dri": 67,
      "def": 29,
      "phy": 85
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p73070.png",
    "category": "bargains"
  },
  {
    "id": "ea-246186-arthur-cabral",
    "eaId": 246186,
    "name": "ארתור קברל",
    "enName": "Arthur Cabral",
    "age": 28,
    "position": "ST",
    "club": "בוטאפוגו",
    "nation": "ברזיל",
    "rating": 75,
    "potential": 82,
    "growth": 7,
    "marketValueEur": 9500000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 18000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 186,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "חלוץ מטרה קלאסי",
    "roleSystem": "סיומת חדה בשתי הרגליים",
    "primaryRole": "חלוץ רחבה (Poacher) +",
    "secondaryRole": "חלוץ מטרה",
    "playstyles": [
      {
        "name": "סיומת מדויקת (Finesse Shot)"
      }
    ],
    "attributes": {
      "pac": 67,
      "sho": 76,
      "pas": 63,
      "dri": 73,
      "def": 31,
      "phy": 78
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p246186.png",
    "category": "bargains"
  },
  {
    "id": "ea-259608-evan-ferguson",
    "eaId": 259608,
    "name": "אוואן פרגוסון",
    "enName": "Evan Ferguson",
    "age": 21,
    "position": "ST",
    "club": "ברייטון",
    "nation": "אירלנד",
    "rating": 74,
    "potential": 87,
    "growth": 13,
    "marketValueEur": 11000000,
    "weeklyWageEur": 28000,
    "releaseClauseEur": 27000000,
    "contractYears": "4 שנים (עד 2030)",
    "height": 188,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 4,
    "squadRole": "חלוץ העתיד בפרמייר ליג",
    "roleSystem": "סיומת קטלנית מכל זווית ומשחק פיזי שלם",
    "primaryRole": "חלוץ שלם (Complete Forward) ++",
    "secondaryRole": "חלוץ רחבה",
    "playstyles": [
      {
        "name": "סיומת ברחבה (Acrobatic+)",
        "plus": true
      },
      {
        "name": "בעיטת פטיש (Power Shot)"
      },
      {
        "name": "החזקת כדור (Hold Up)"
      }
    ],
    "attributes": {
      "pac": 68,
      "sho": 75,
      "pas": 60,
      "dri": 71,
      "def": 21,
      "phy": 72
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p259608.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-269176-alejo-v-liz",
    "eaId": 269176,
    "name": "אלחו וליס",
    "enName": "Alejo Véliz",
    "age": 22,
    "position": "ST",
    "club": "באהיה",
    "nation": "ארגנטינה",
    "rating": 72,
    "potential": 85,
    "growth": 13,
    "marketValueEur": 5500000,
    "weeklyWageEur": 18000,
    "releaseClauseEur": 13000000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 187,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "חלוץ ארגנטינאי לוחם",
    "roleSystem": "נגיחות קטלניות ולחץ מתמיד",
    "primaryRole": "חלוץ מטרה (Target Forward) +",
    "secondaryRole": "חלוץ לחץ",
    "playstyles": [
      {
        "name": "משחק ראש אווירי (Aerial+)",
        "plus": true
      }
    ],
    "attributes": {
      "pac": 71,
      "sho": 71,
      "pas": 57,
      "dri": 67,
      "def": 29,
      "phy": 75
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p269176.png",
    "category": "wonderkids"
  },
  {
    "id": "ea-260942-david-datro-fofana",
    "eaId": 260942,
    "name": "דוד דטרו פופאנה",
    "enName": "David Datro Fofana",
    "age": 23,
    "position": "ST",
    "club": "צ׳לסי",
    "nation": "חוף השנהב",
    "rating": 72,
    "potential": 84,
    "growth": 12,
    "marketValueEur": 5400000,
    "weeklyWageEur": 24000,
    "releaseClauseEur": 12500000,
    "contractYears": "3 שנים (עד 2029)",
    "height": 181,
    "foot": "ימין",
    "skills": 3,
    "weakFoot": 3,
    "squadRole": "חלוץ מתפרצות מהיר",
    "roleSystem": "מהירות חודרת וסיומת באחד על אחד",
    "primaryRole": "חלוץ מתפרצות (Advanced Forward)",
    "secondaryRole": "חלוץ פיזי",
    "playstyles": [
      {
        "name": "מהירות מתפרצת (Rapid)"
      }
    ],
    "attributes": {
      "pac": 82,
      "sho": 70,
      "pas": 60,
      "dri": 74,
      "def": 25,
      "phy": 73
    },
    "photo": "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p260942.png",
    "category": "bargains"
  }
];
