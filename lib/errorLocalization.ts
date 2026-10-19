const ERRORS_EN: Record<string, string> = {
  "צריך להתחבר": "Sign in required",
  "חסרה תמונה": "Image required",
  "שימו לפחות שחקן אחד בסגל": "Add at least one player to your squad",
  "רק מנהל יכול לבצע את הפעולה הזו": "Only an administrator can perform this action",
  "צריך לפחות צילום מסך אחד": "Upload at least one screenshot",
  "האתגר לא נמצא": "Challenge not found",
  "האתגר הזה כבר נסגר": "This challenge has closed",
  "ההגשה לא נמצאה": "Submission not found",
  "בחרו סוג פריט": "Choose an item type",
  "הקבוצה לא נמצאה": "Squad not found",
  "אפשר לדרג קבוצות של אחרים": "You can rate other players’ squads",
  "הדירוג הוא בין 1 ל-5": "Ratings must be between 1 and 5",
  "תגובה יכולה להכיל עד 120 תווים": "Comments can contain up to 120 characters",
  "כתבו משפט קצר": "Enter a short description",
  "הפוסט לא נמצא": "Post not found",
  "התגובה לא נמצאה": "Comment not found",
  "אי אפשר לדווח על תגובה של עצמך": "You cannot report your own comment",
  "Skill Rating צריך להיות מספר בין 1 ל-5000": "Skill Rating must be a number between 1 and 5,000",
  "רמת השחקן צריכה להיות בין 1 ל-50": "Player level must be between 1 and 50",
  "צריך למלא לפחות שם משתמש או EA ID": "Enter a gamertag or EA ID",
  "EA ID ארוך מדי": "EA ID is too long",
  "שם משתמש ארוך מדי": "Gamertag is too long",
  "אי אפשר לעקוב אחרי עצמך": "You cannot follow yourself",
  "השחקן לא נמצא": "Player not found",
  "אי אפשר לשלוח הודעה לעצמך": "You cannot message yourself",
  "המודעה לא נמצאה": "Listing not found",
  "אין צילום רמה לאישור": "No level screenshot is available for review",
  "יעד הניקוד צריך להיות מספר בין 1 ל-20000": "The target score must be between 1 and 20,000",
  "פתרון קהילה מיועד ל-SBC קלאסי. ל-Streamlined יש מחשבון.": "Community solutions are for classic SBCs. Use the calculator for Streamlined challenges.",
  "אפשר לבנות סגל של 11 שחקנים, או להעלות צילום מסך": "Build an 11-player squad or upload a screenshot",
  "הפתרון לא נמצא": "Solution not found",
  "אי אפשר לדרג פתרון של עצמך": "You cannot rate your own solution",
  "אימייל לא תקין": "Invalid email address",
  "סיסמה של לפחות 6 תווים": "Your password must contain at least 6 characters",
  "כבר יש חשבון עם האימייל הזה": "An account with this email already exists",
  "אין חשבון עם האימייל הזה": "No account exists with this email",
  "הסיסמה לא נכונה": "Incorrect password",
  "תאריך הסיום צריך להיות בפורמט 2026-10-20": "Enter the end date in YYYY-MM-DD format, for example 2026-10-20",
  "תאריך לא תקין": "Invalid date",
  "צריך אישור לגלריה כדי לבחור צילום מסך.": "Allow access to your gallery to choose a screenshot.",
  "משהו השתבש. נסו שוב.": "Something went wrong. Try again."
};
const FIELDS_EN: Record<string, string> = {
  "כותרת": "Title",
  "חוקים": "Rules",
  "דרישות צילום": "Proof requirements",
  "שם שחקן או מועדון": "Player or club name",
  "תיאור": "Description",
  "טקסט": "Text",
  "תגובה": "Comment",
  "שם": "Name",
  "הודעה": "Message",
  "שם משתמש": "Gamertag",
  "מטרת הפרסום": "Listing purpose",
  "עמדה": "Position",
  "פלטפורמה": "Platform",
  "אזור": "Region"
};

export function errorText(message: string, language: 'he' | 'en'): string {
  if (language === 'he') return message;
  if (ERRORS_EN[message]) return ERRORS_EN[message];
  const missing = message.match(/^חסר (.+)$/)?.[1];
  if (missing && FIELDS_EN[missing]) return `${FIELDS_EN[missing]} is required`;
  const long = message.match(/^(.+) ארוך מדי$/)?.[1];
  if (long && FIELDS_EN[long]) return `${FIELDS_EN[long]} is too long`;
  const screenshots = message.match(/^צריך (\d+) צילומים$/)?.[1];
  if (screenshots) return `Upload ${screenshots} screenshots`;
  return message;
}
