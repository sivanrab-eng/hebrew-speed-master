# Hebrew Speed Master

בנה אפליקציית רשת אינטראקטיבית מודרנית למשחק "Speed Vocab - מחוננים ז'" המבוסס על קובץ ה-HTML המצורף, עם הדרישות הבאות:

1. **מאגר מילים מורחב ועשיר**:
   - לכלול את 15 המילים הקיימות בקובץ המצורף (לְאַלְתֵּר, מַשְׂטֵמָה, עָרְמָתִי, לְהַלֵּל, מְהוּסָס, סִלּוּף, נִרְפֶּה, תִּגְרָה, לִנְזוֹף, לְהַפְרִיז, תַּרְמִית, לְהַרְהֵר, מְעוּרָף, עֲרִירִי, לִכְסוֹף).
   - להרחיב למאגר גדול של מעל 60 מילים ברמה גבוהה התואמות למבחני מחוננים לכיתה ז', עם ניקוד מדויק בעברית ותרגום/הסבר תמציתי באנגלית.

2. **משחק מהירות (60 שניות)**:
   - מסך פתיחה עם הסבר קצר וכפתור התחלה.
   - מסך משחק: מוצג מונח/הגדרה באנגלית, ומתחתיו גריד של 4 אפשרויות בחירה בעברית מנוקדת.
   - טיימר ספירה לאחור של 60 שניות.
   - ניקוד דינמי, כולל מד רצף הצלחות (Streak / Combo) שמכפיל או נותן בונוס על תשובות רצופות נכונות.
   - משוב ויזואלי מיידי (ירוק לתשובה נכונה, אדום לשגויה) עם אנימציה חלקה ומעבר מיידי לשאלה הבאה.

3. **אפקטים קוליים (Sound Effects)**:
   - שימוש ב-Web Audio API (צלילים סינתטיים קלילים ללא קבצים חיצוניים): צליל הצלחה נעים, צליל טעות, תקתוק עדין ב-10 השניות האחרונות, וצליל סיום משחק.
   - כפתור השתקה/הפעלה של סאונד בראש המסך.

4. **מסך סיום וסיכום**:
   - הצגת ניקוד סופי, מספר תשובות נכונות ואחוז דיוק, ושיא מקומי (High Score נשמר ב-localStorage).
   - פיצ'ר ייחודי: סקירת טעויות (Review Mistakes) - מציג רשימה של המילים שהשחקן טעה בהן במהלך הסיבוב כדי ללמוד מהן.
   - כפתור "שחק שוב".

5. **עיצוב וממשק**:
   - עיצוב מודרני, אלגנטי וספורטיבי (Tailwind, Lucide icons, תמיכה מלאה ב-RTL).
   - טיפוגרפיה ברורה וגדולה במיוחד לקריאה נוחה של עברית עם ניקוד.
   - התאמה רספונסיבית מעולה למובייל ולמחשב.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hebrew-speed-master.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/dc22cbd6-c6f4-4c30-8af4-6e9f3f954000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
