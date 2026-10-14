export type Word = {
  hebrew: string;
  english: string;
  root: string;
  exampleSentenceHebrew: string; // target word wrapped in [ ]
  exampleSentenceEnglish: string;
  synonyms: string[];
  antonyms: string[];
};

type Row = [string, string, string, string, string, string, string];

// [hebrew, english, root, sentenceHe (word in [ ]), sentenceEn, synonyms, antonyms]
const ROWS: Row[] = [
  ["לְאַלְתֵּר", "Improvise / On the spot", "א-ל-ת-ר", "השחקן שכח את הטקסט ונאלץ [לְאַלְתֵּר] מול הקהל.", "The actor forgot his lines and had to improvise in front of the audience.", "לִבְדּוֹת, מִיָּד", "לְתַכְנֵן"],
  ["מַשְׂטֵמָה", "Extreme hatred / Malice", "ש-ט-ם", "בין שתי המשפחות שררה [מַשְׂטֵמָה] עמוקה במשך דורות.", "Deep hatred existed between the two families for generations.", "שִׂנְאָה, אֵיבָה", "אַהֲבָה, חִבָּה"],
  ["עָרְמָתִי", "Cunning / Sly", "ע-ר-ם", "השועל [הָעָרְמָתִי] הצליח להערים על העורב.", "The cunning fox managed to trick the crow.", "עַרְמוּמִי, נוֹכֵל", "תָּמִים, יָשָׁר"],
  ["לְהַלֵּל", "Praise / Glorify", "ה-ל-ל", "המורה נהגה [לְהַלֵּל] את התלמידים על מאמציהם.", "The teacher used to praise the students for their efforts.", "לְשַׁבֵּחַ, לְפָאֵר", "לְגַנּוֹת, לִנְזוֹף"],
  ["מְהוּסָס", "Hesitant / Uncertain", "ה-ס-ס", "הוא ענה בקול [מְהוּסָס], כאילו לא היה בטוח.", "He answered in a hesitant voice, as if unsure.", "מְפַקְפֵּק, מְגַמְגֵּם", "נֶחְרָץ, בָּטוּחַ"],
  ["סִלּוּף", "Distortion / Falsification", "ס-ל-ף", "הכתבה הייתה [סִלּוּף] גמור של מה שקרה באמת.", "The article was a complete distortion of what really happened.", "עִוּוּת, זִיּוּף", "דִּיּוּק, אֱמֶת"],
  ["נִרְפֶּה", "Lazy / Sluggish", "ר-פ-ה", "החייל [הַנִּרְפֶּה] לא סיים את המשימה בזמן.", "The sluggish soldier didn't finish the task on time.", "עָצֵל, רַשְׁלָן", "זָרִיז, חָרוּץ"],
  ["תִּגְרָה", "Fight / Brawl", "ג-ר-ה", "בהפסקה פרצה [תִּגְרָה] בין שני תלמידים.", "During recess a fight broke out between two students.", "קְטָטָה, מְרִיבָה", "שָׁלוֹם, הַשְׁלָמָה"],
  ["לִנְזוֹף", "Scold / Reprimand", "נ-ז-ף", "המנהל נאלץ [לִנְזוֹף] בתלמיד שאיחר שוב.", "The principal had to scold the student who was late again.", "לְהוֹכִיחַ, לִגְעוֹר", "לְשַׁבֵּחַ, לְהַלֵּל"],
  ["לְהַפְרִיז", "Exaggerate", "פ-ר-ז", "אין צורך [לְהַפְרִיז] — המצב לא כל כך גרוע.", "No need to exaggerate — the situation isn't that bad.", "לְהַגְזִים", "לְהַמְעִיט"],
  ["תַּרְמִית", "Deception / Fraud", "ר-מ-ה", "החברה נחשפה כ[תַּרְמִית] שגזלה כסף מלקוחות.", "The company was exposed as a fraud that stole money from clients.", "הוֹנָאָה, רַמָּאוּת", "יֹשֶׁר, הֲגִינוּת"],
  ["לְהַרְהֵר", "Ponder / Reflect", "ה-ר-ה-ר", "ישבתי על החוף [לְהַרְהֵר] בחיי.", "I sat on the beach to reflect on my life.", "לַחְשׁוֹב, לְעַיֵּן", "לְהִתְעַלֵּם"],
  ["מְעֻרְפָּל", "Foggy / Vague / Dim", "ע-ר-פ-ל", "התשובה שלו הייתה [מְעֻרְפֶּלֶת] ולא ברורה.", "His answer was vague and unclear.", "עָמוּם, לֹא בָּרוּר", "בָּהִיר, צָלוּל"],
  ["עֲרִירִי", "Lonely / Childless", "ע-ר-ר", "הזקן [הָעֲרִירִי] גר לבדו בקצה הכפר.", "The lonely old man lived alone at the edge of the village.", "בּוֹדֵד, גַּלְמוּד", "מֻקָּף, מְבֻרָךְ בְּיְלָדִים"],
  ["לִכְסוֹף", "Long for / Yearn", "כ-ס-ף", "המהגר לא חדל [לִכְסוֹף] אל ארץ הולדתו.", "The immigrant never stopped yearning for his homeland.", "לְהִשְׁתּוֹקֵק, לְהִתְגַּעְגֵּעַ", "לִסְלוֹד"],
  ["אָדִישׁ", "Indifferent / Apathetic", "א-ד-ש", "הוא נשאר [אָדִישׁ] לחלוטין לבקשות העזרה.", "He remained completely indifferent to the pleas for help.", "אַפָּתִי, שָׁוֶה נֶפֶשׁ", "אִכְפָּתִי, נִלְהָב"],
  ["שַׁאַפְתָּן", "Ambitious", "ש-א-ף", "הסטודנט [הַשַּׁאַפְתָּן] חלם להקים חברה משלו.", "The ambitious student dreamed of founding his own company.", "נִמְרָץ, שׁוֹאֵף", "חֲסַר שְׁאִיפוֹת"],
  ["לְהִתְגַּבֵּר", "Overcome", "ג-ב-ר", "היא הצליחה [לְהִתְגַּבֵּר] על הפחד מגבהים.", "She managed to overcome her fear of heights.", "לְנַצֵּחַ, לִגְבּוֹר", "לְהִכָּנַע"],
  ["יְהִירוּת", "Arrogance", "י-ה-ר", "[יְהִירוּתוֹ] גרמה לחבריו להתרחק ממנו.", "His arrogance caused his friends to distance themselves.", "גַּאַוְתָנוּת, הִתְנַשְּׂאוּת", "עֲנָוָה, צְנִיעוּת"],
  ["עַנְוְתָנוּת", "Humility / Modesty", "ע-נ-ו", "למרות הצלחתו, הוא התנהג ב[עַנְוְתָנוּת].", "Despite his success, he behaved with humility.", "צְנִיעוּת, עֲנָוָה", "יְהִירוּת, רַבְרְבָנוּת"],
  ["לְהַשְׁמִיץ", "Slander / Defame", "ש-מ-ץ", "אסור [לְהַשְׁמִיץ] אנשים ברשתות החברתיות.", "It is forbidden to slander people on social media.", "לְהַכְפִּישׁ, לְהוֹצִיא דִּבָּה", "לְשַׁבֵּחַ, לְהַלֵּל"],
  ["חַמְקָנִי", "Elusive / Evasive", "ח-מ-ק", "הפושע [הַחַמְקָנִי] הצליח לברוח שוב.", "The elusive criminal managed to escape again.", "מִתְחַמֵּק, חֲלַקְלַק", "יָשִׁיר, גָּלוּי"],
  ["נִלְהָב", "Enthusiastic / Eager", "ל-ה-ב", "הקהל [הַנִּלְהָב] מחא כפיים בסוף ההופעה.", "The enthusiastic crowd applauded at the end of the show.", "נִרְגָּשׁ, מִתְלַהֵב", "אָדִישׁ, אַפָּתִי"],
  ["מְפֻקְפָּק", "Dubious / Questionable", "פ-ק-פ-ק", "המקור של הידיעה היה [מְפֻקְפָּק].", "The source of the news was questionable.", "חָשׁוּד, מֻטָּל בְּסָפֵק", "אָמִין, וַדָּאִי"],
  ["לְהִתְחַמֵּק", "Evade / Dodge", "ח-מ-ק", "הפוליטיקאי ניסה [לְהִתְחַמֵּק] מהשאלה.", "The politician tried to dodge the question.", "לְהִשָּׁמֵט, לְהִסְתַּלֵּק", "לְהִתְמוֹדֵד"],
  ["שַׁלְוָה", "Serenity / Calm", "ש-ל-ו", "על האגם שררה [שַׁלְוָה] מוחלטת.", "Complete serenity prevailed over the lake.", "רֹגַע, שֶׁקֶט", "סְעָרָה, מְהוּמָה"],
  ["סְתַגְלָנִי", "Adaptable", "ס-ג-ל", "בעל חיים [סְתַגְלָנִי] שורד גם בתנאים קשים.", "An adaptable animal survives even in harsh conditions.", "גָּמִישׁ", "נוֹקְשֶׁה"],
  ["קַפְּדָנִי", "Meticulous / Strict", "ק-פ-ד", "המדען [הַקַּפְּדָנִי] בדק כל פרט פעמיים.", "The meticulous scientist checked every detail twice.", "יְסוֹדִי, מַחְמִיר", "רַשְׁלָנִי"],
  ["רַשְׁלָנִי", "Negligent / Careless", "ר-ש-ל", "בגלל עבודה [רַשְׁלָנִית] הגשר קרס.", "Because of careless work the bridge collapsed.", "מְרֻשָּׁל, מְזַלְזֵל", "קַפְּדָנִי, יְסוֹדִי"],
  ["לְהַפְצִיר", "Plead / Implore", "פ-צ-ר", "הילד המשיך [לְהַפְצִיר] בהוריו לקנות כלב.", "The boy kept pleading with his parents to buy a dog.", "לְהִתְחַנֵּן, לְבַקֵּשׁ", "לִדְרוֹשׁ, לְצַוּוֹת"],
  ["תְּמִימוּת", "Naivety / Innocence", "ת-מ-ם", "ב[תְמִימוּתוֹ] הוא האמין לכל מה שסיפרו לו.", "In his naivety he believed everything he was told.", "פְּתַיּוּת, נָאִיבִיּוּת", "עָרְמָה, חַשְׁדָנוּת"],
  ["עַקְשָׁן", "Stubborn", "ע-ק-ש", "הוא [עַקְשָׁן] ולא מוכן לשנות את דעתו.", "He is stubborn and unwilling to change his mind.", "נוֹקְשֶׁה, קְשֵׁה עֹרֶף", "וַתְּרָן, גָּמִישׁ"],
  ["לְהִתְמַהְמֵהַּ", "Linger / Delay", "מ-ה-ה", "אל [תִּתְמַהְמַהּ] — הרכבת עומדת לצאת!", "Don't linger — the train is about to leave!", "לְהִשְׁתַּהוֹת, לְאַחֵר", "לְמַהֵר, לְהָחִישׁ"],
  ["זָרִיז", "Quick / Agile", "ז-ר-ז", "השוער [הַזָּרִיז] עצר את הכדור ברגע האחרון.", "The agile goalkeeper stopped the ball at the last moment.", "מָהִיר, חָרוּץ", "אִטִּי, נִרְפֶּה"],
  ["מְסֻרְבָּל", "Cumbersome / Clumsy", "ס-ר-ב-ל", "הנוסח [הַמְסֻרְבָּל] הקשה על הבנת החוזה.", "The cumbersome wording made the contract hard to understand.", "כָּבֵד, מְגֻשָּׁם", "זָרִיז, פָּשׁוּט"],
  ["לְהַכְחִישׁ", "Deny", "כ-ח-ש", "החשוד מיהר [לְהַכְחִישׁ] כל קשר לגניבה.", "The suspect rushed to deny any connection to the theft.", "לִשְׁלוֹל, לְהִתְכַּחֵשׁ", "לְהוֹדוֹת, לְאַשֵּׁר"],
  ["לְהוֹקִיר", "Appreciate / Cherish", "י-ק-ר", "חשוב [לְהוֹקִיר] את מי שעוזר לנו.", "It's important to appreciate those who help us.", "לְהַעֲרִיךְ, לְכַבֵּד", "לְזַלְזֵל, לְבַזּוֹת"],
  ["בּוּז", "Contempt / Scorn", "ב-ו-ז", "הוא הביט ביריבו ב[בּוּז] גלוי.", "He looked at his rival with open contempt.", "זִלְזוּל, לַעַג", "הַעֲרָכָה, כָּבוֹד"],
  ["חֲשָׁדָנִי", "Suspicious", "ח-ש-ד", "השומר [הַחֲשָׁדָנִי] בדק את התיק פעמיים.", "The suspicious guard checked the bag twice.", "סַפְקָן, זָהִיר", "תָּמִים, בּוֹטֵחַ"],
  ["פִּשְׁרָה", "Compromise", "פ-ש-ר", "לבסוף הגיעו הצדדים ל[פִשְׁרָה] הוגנת.", "In the end the sides reached a fair compromise.", "הֶסְדֵּר, הַסְכָּמָה", "עִמּוּת, עַקְשָׁנוּת"],
  ["לְהִתְנַשֵּׂא", "Act superior / Condescend", "נ-ש-א", "אין סיבה [לְהִתְנַשֵּׂא] על חברים חדשים.", "There's no reason to act superior toward new friends.", "לְהִתְיַהֵר, לְהִתְרַבְרֵב", "לְהִצְטַנֵּעַ"],
  ["נָדִיב", "Generous", "נ-ד-ב", "השכן [הַנָּדִיב] תרם אלפי שקלים לבית הספר.", "The generous neighbor donated thousands of shekels to the school.", "רְחַב לֵב, פַּזְרָן", "קַמְצָן"],
  ["קַמְצָן", "Stingy / Miser", "ק-מ-ץ", "ה[קַמְצָן] סירב לשלם אפילו שקל אחד.", "The miser refused to pay even one shekel.", "צַר עַיִן", "נָדִיב, רְחַב לֵב"],
  ["שַׁבְרִירִי", "Fragile", "ש-ב-ר", "הכד [הַשַּׁבְרִירִי] נשבר במגע קל.", "The fragile vase broke at a light touch.", "עָדִין, רָפֶה", "אֵיתָן, חָזָק"],
  ["אֵיתָן", "Steadfast / Firm", "א-ת-ן", "הוא נשאר [אֵיתָן] בעמדתו למרות הלחץ.", "He remained firm in his position despite the pressure.", "יַצִּיב, נֶחְרָץ", "רוֹפֵף, שַׁבְרִירִי"],
  ["לְהַבְלִיג", "Restrain oneself", "ב-ל-ג", "למרות העלבון, היא החליטה [לְהַבְלִיג].", "Despite the insult, she decided to restrain herself.", "לְהִתְאַפֵּק, לִשְׁלוֹט בְּעַצְמוֹ", "לְהִתְפָּרֵץ, לְהָגִיב"],
  ["מְמֻשָּׁךְ", "Prolonged / Lengthy", "מ-ש-ך", "אחרי דיון [מְמֻשָּׁךְ] התקבלה החלטה.", "After a lengthy discussion a decision was made.", "אָרֹךְ, מִתְמַשֵּׁךְ", "קָצָר, חוֹלֵף"],
  ["חוֹלֵף", "Fleeting / Temporary", "ח-ל-ף", "זה רק מצב רוח [חוֹלֵף], מחר יהיה טוב יותר.", "It's just a passing mood; tomorrow will be better.", "זְמַנִּי, אֲרָעִי", "נִצְחִי, קָבוּעַ"],
  ["נֶצַח", "Eternity", "נ-צ-ח", "ההמתנה בתור הרגישה כמו [נֶצַח].", "Waiting in line felt like an eternity.", "עוֹלָם, תָּמִיד", "רֶגַע, הֶרֶף עַיִן"],
  ["לְהִשְׁתָּאוֹת", "Marvel / Be amazed", "ש-א-ה", "התיירים לא הפסיקו [לְהִשְׁתָּאוֹת] מיופי הנוף.", "The tourists couldn't stop marveling at the scenery.", "לְהִתְפַּעֵל, לְהִדָּהֵם", "לְהִשָּׁאֵר אָדִישׁ"],
  ["תַּעֲלוּמָה", "Mystery / Enigma", "ע-ל-ם", "היעלמות הספינה נותרה [תַּעֲלוּמָה].", "The ship's disappearance remained a mystery.", "חִידָה, סוֹד", "פִּתְרוֹן, גִּלּוּי"],
  ["לְפַעְנֵחַ", "Decipher / Decode", "פ-ע-נ-ח", "הבלש הצליח [לְפַעְנֵחַ] את הקוד הסודי.", "The detective managed to decipher the secret code.", "לִפְתּוֹר, לְפָרֵשׁ", "לְהַצְפִּין"],
  ["סַקְרָן", "Curious", "ס-ק-ר", "הילד [הַסַּקְרָן] שאל שאלות בלי הפסקה.", "The curious child asked questions nonstop.", "חַקְרָן, מִתְעַנְיֵן", "אָדִישׁ"],
  ["מַתְמִיד", "Persistent / Diligent", "ת-מ-ד", "רק תלמיד [מַתְמִיד] יצליח במבחן הקשה.", "Only a persistent student will succeed in the hard test.", "שַׁקְדָן, עִקָּבִי", "נִרְפֶּה, מְוַתֵּר"],
  ["לְהַזְנִיחַ", "Neglect", "ז-נ-ח", "אסור [לְהַזְנִיחַ] את השיעורים לקראת המבחן.", "You mustn't neglect your homework before the exam.", "לְהִתְרַשֵּׁל, לִזְנוֹחַ", "לְטַפֵּחַ, לְהַקְפִּיד"],
  ["גַּאֲוָתָן", "Boastful / Proud", "ג-א-ה", "ה[גַּאֲוָתָן] סיפר לכולם כמה הוא מוכשר.", "The boastful one told everyone how talented he was.", "יָהִיר, רַבְרְבָן", "עָנָו, צָנוּעַ"],
  ["חָזוֹן", "Vision / Prophecy", "ח-ז-ה", "למייסד היה [חָזוֹן] של עיר ירוקה.", "The founder had a vision of a green city.", "שְׁאִיפָה, נְבוּאָה", "מְצִיאוּת"],
  ["לְשַׁעֵר", "Guess / Assume", "ש-ע-ר", "קשה [לְשַׁעֵר] מה יקרה בעוד עשר שנים.", "It's hard to guess what will happen in ten years.", "לְנַחֵשׁ, לְהַנִּיחַ", "לָדַעַת בְּוַדָּאוּת"],
  ["מֻפְלָג", "Extraordinary / Far-reaching", "פ-ל-ג", "הוא נחשב למומחה [מֻפְלָג] בתחומו.", "He is considered an extraordinary expert in his field.", "יוֹצֵא דֹּפֶן, נִשְׂגָּב", "רָגִיל, שׁוּלִי"],
  ["זַעַם", "Rage / Fury", "ז-ע-ם", "ההחלטה עוררה [זַעַם] רב בציבור.", "The decision sparked great fury among the public.", "כַּעַס, חֵמָה", "שַׁלְוָה, רֹגַע"],
  ["לְפַיֵּס", "Appease / Reconcile", "פ-י-ס", "הוא קנה לה פרחים כדי [לְפַיֵּס] אותה.", "He bought her flowers to appease her.", "לְרַצּוֹת, לְהַשְׁלִים", "לְהַרְגִּיז, לְהַקְנִיט"],
  ["הַסְכָּמָה", "Agreement / Consent", "ס-כ-ם", "ההורים נתנו את [הַסְכָּמָתָם] לטיול.", "The parents gave their consent for the trip.", "אִשּׁוּר, הֶסְכֵּם", "הִתְנַגְּדוּת, סֵרוּב"],
  ["נוֹקְשֶׁה", "Rigid / Inflexible", "נ-ק-ש", "המנהל [הַנּוֹקְשֶׁה] לא הסכים לשום חריגה.", "The rigid manager wouldn't allow any exception.", "קָשׁוּחַ, עַקְשָׁן", "גָּמִישׁ, סְתַגְלָנִי"],
  ["מְגֻחָךְ", "Ridiculous / Absurd", "ג-ח-ך", "התירוץ שלו היה כל כך [מְגֻחָךְ] שכולם צחקו.", "His excuse was so ridiculous that everyone laughed.", "אַבְּסוּרְדִּי, מַצְחִיק", "רְצִינִי, הֶגְיוֹנִי"],
  ["לְהִתְעַשֵּׁת", "Pull oneself together", "ע-ש-ת", "אחרי ההפסד הקבוצה הצליחה [לְהִתְעַשֵּׁת].", "After the loss the team managed to pull itself together.", "לְהִתְאוֹשֵׁשׁ, לְהִתְגַּבֵּר", "לְהִתְמוֹטֵט"],
  ["תּוֹשִׁיָּה", "Resourcefulness", "י-ש-ה", "הוא גילה [תּוֹשִׁיָּה] ומצא דרך לצאת מהמערה.", "He showed resourcefulness and found a way out of the cave.", "כּשֶׁר הַמְצָאָה, פִּקְחוּת", "חֹסֶר אוֹנִים"],
  ["רְדִידוּת", "Shallowness", "ר-ד-ד", "המבקר התלונן על [רְדִידוּת] העלילה.", "The critic complained about the shallowness of the plot.", "שִׁטְחִיּוּת", "עֹמֶק, מַעֲמִיקוּת"],
  ["מַעֲמִיק", "Profound / In-depth", "ע-מ-ק", "החוקרת כתבה מחקר [מַעֲמִיק] על הנושא.", "The researcher wrote an in-depth study on the topic.", "יְסוֹדִי, עָמֹק", "שִׁטְחִי, רָדוּד"],
  ["לְהִתְרַפֵּס", "Grovel / Fawn", "ר-פ-ס", "הוא נהג [לְהִתְרַפֵּס] בפני הבוס כדי לקבל קידום.", "He used to grovel before the boss to get a promotion.", "לְהִתְחַנֵּף", "לְהִתְנַשֵּׂא, לְהַתְרִיס"],
  ["נִכְלוּלִים", "Schemes / Trickery", "נ-כ-ל", "בעזרת [נִכְלוּלִים] הוא הצליח לרמות את כולם.", "Through schemes he managed to fool everyone.", "תַּחְבּוּלוֹת, תְּכָכִים", "יֹשֶׁר, הֲגִינוּת"],
  ["אֲרִיכוּת", "Long-windedness", "א-ר-ך", "ה[אֲרִיכוּת] של הנאום הרדימה את הקהל.", "The long-windedness of the speech put the audience to sleep.", "גְּבָבָה, מַלְלָנוּת", "תַּמְצִיתִיּוּת"],
  ["תַּמְצִיתִי", "Concise / Brief", "מ-צ-ה", "כתבו סיכום [תַּמְצִיתִי] של חצי עמוד.", "Write a concise summary of half a page.", "קָצָר, מְמֻקָּד", "אָרֹךְ, מְסֻרְבָּל"],
  ["לְהַתְרִיס", "Defy / Protest boldly", "ת-ר-ס", "התלמיד העז [לְהַתְרִיס] נגד ההחלטה הלא הוגנת.", "The student dared to defy the unfair decision.", "לִמְחוֹת, לְהִתְקוֹמֵם", "לְהִתְרַפֵּס, לְהִכָּנַע"],
  ["מְסֻיָּג", "Reserved / Qualified", "ס-י-ג", "הוא הביע תמיכה [מְסֻיֶּגֶת] בתוכנית.", "He expressed reserved support for the plan.", "זָהִיר, חֶלְקִי", "מֻחְלָט, נִלְהָב"],
  ["רַבְגּוֹנִי", "Versatile / Diverse", "ג-ו-ן", "האמן [הָרַבְגּוֹנִי] מצייר, שר ומנגן.", "The versatile artist paints, sings and plays music.", "מְגֻוָּן, רַב־צְדָדִי", "חַד־גּוֹנִי"],
];

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export const VOCAB: Word[] = ROWS.map(([hebrew, english, root, he, en, syn, ant]) => ({
  hebrew, english, root, exampleSentenceHebrew: he, exampleSentenceEnglish: en, synonyms: list(syn), antonyms: list(ant),
}));

export const sentenceFull = (w: Word) => w.exampleSentenceHebrew.replace(/[[\]]/g, "");
export const sentenceBlank = (w: Word) => w.exampleSentenceHebrew.replace(/\[[^\]]*\]/g, "_____");
export const sentenceParts = (w: Word) => {
  const m = w.exampleSentenceHebrew.match(/^(.*)\[([^\]]*)\](.*)$/);
  return m ? { before: m[1]!, word: m[2]!, after: m[3]! } : { before: w.exampleSentenceHebrew, word: "", after: "" };
};

export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "he-IL";
  u.rate = 0.85;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("he"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}
