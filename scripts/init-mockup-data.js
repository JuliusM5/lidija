// scripts/init-mockup-data.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Try to load environment variables if dotenv is available
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is not installed, which is fine
}

// Define constants
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const ABOUT_FILE = path.join(DATA_DIR, 'about.json');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Sample comments
const comments = [
  {
    id: `comment-${uuidv4()}`,
    recipe_id: recipes[0].id,
    parent_id: null,
    author: 'Laura',
    email: 'laura@example.com',
    content: 'Mano močiutė visada dėdavo truputį krienų į šaltibarščius. Tai suteikia ypatingą aštrumą!',
    status: 'approved',
    created_at: '2025-05-03T16:42:10Z'
  },
  {
    id: `comment-${uuidv4()}`,
    recipe_id: recipes[0].id,
    parent_id: null,
    author: 'Tomas',
    email: 'tomas@example.com',
    content: 'Kefyrą galima pakeisti graikišku jogurtu?',
    status: 'approved',
    created_at: '2025-05-04T09:15:33Z'
  },
  {
    id: `comment-${uuidv4()}`,
    recipe_id: recipes[1].id,
    parent_id: null,
    author: 'Marius',
    email: 'marius@example.com',
    content: 'Pagal šį receptą išėjo tobulas kugelis! Ačiū už dalijimąsi.',
    status: 'approved',
    created_at: '2025-03-20T18:30:12Z'
  }
];

// Sample about page data
const aboutData = {
  title: 'Apie Mane',
  subtitle: 'Kelionė į širdį per maistą, pilną gamtos dovanų, švelnumo ir paprastumo',
  image: '',
  intro: 'Sveiki, esu Lidija – keliaujanti miško takeliais, pievomis ir laukais, kur kiekvienas žolės stiebelis, vėjo dvelksmas ar laukinė uoga tampa įkvėpimu naujam skoniui. Maisto gaminimas ir fotografija man – tai savotiška meditacija, leidžianti trumpam sustoti ir pasimėgauti akimirka šiandieniniame chaose.',
  sections: [
    {
      title: 'Mano istorija',
      content: 'Viskas prasidėjo mažoje kaimo virtuvėje, kur mano močiutė Ona ruošdavo kvapnius patiekalus iš paprastų ingredientų. Stebėdavau, kaip jos rankos minkydavo tešlą, kaip ji lengvai ir gracingai sukosi tarp puodų ir keptuvių, kaip pasakodavo apie kiekvieną žolelę, kurią pridėdavo į sriubą ar arbatą.\n\nBaigusi mokyklą, persikėliau į Kauną studijuoti ir pradėjau kurti savo virtuvėje. Dirbau įvairiose maisto srityse – nuo restoranų iki maisto stilistikos žurnalams. Tačiau po ilgo laiko, praleisto mieste, pajutau poreikį grįžti prie savo šaknų, arčiau gamtos, arčiau tų paprastų, bet sodrių skonių, kurie lydėjo mano vaikystę.\n\nTaip ir atsirado mano kulinarinius eksperimentus apjungiantis projektas „Šaukštas Meilės". Šis tinklaraštis gimė iš noro pasidalinti maisto džiaugsmu, gamtos dovanotas receptais ir istorijomis, kurios supa kiekvieną patiekalą.'
    },
    {
      title: 'Mano filosofija',
      // scripts/init-mockup-data.js (continuation)
      content: 'Tikiu, kad maistas yra daugiau nei tik kuras mūsų kūnui – tai būdas sujungti žmones, išsaugoti tradicijas ir kurti naujus prisiminimus. Mano kulinarinė filosofija grindžiama trimis pagrindiniais principais:\n\nPaprastumas. Geriausios receptų idėjos dažnai gimsta iš paprastumo. Naudoju nedaug ingredientų, bet kiekvienas jų atlieka svarbų vaidmenį patiekalo skonio ir tekstūros harmonijoje.\n\nSezoniniai produktai. Gamta yra geriausia šefė, todėl gerbiu jos ritmą ir renkuosi produktus, kurie yra savo geriausios kokybės tuo metu. Pavasario žalumynai, vasaros uogos, rudens grybai ir žiemos šakniavaisiai – kiekvienas sezonas turi savo išskirtinį charakterį.\n\nTradicijų puoselėjimas. Lietuviška virtuvė turi gilias tradicijas, kurias stengiuosi išsaugoti ir perteikti šiuolaikiniam skoniui. Kas gali būti geriau nei močiutės receptai, pritaikyti šiandieniniam gyvenimui?'
    },
    {
      title: 'Mano darbo kampelis',
      content: 'Šiandien gyvenu nedideliame namelyje Kauno rajone, apsuptame medžių. Mano virtuvė – tai erdvė, kur tradicijos susipina su inovacijomis. Šviesi, pilna augalų ir žolelių, su dideliu mediniu stalu, paveldėtu iš močiutės, kur ir vyksta visi mano kulinariniai eksperimentai.\n\nFotografuoju savo patiekalus natūralioje šviesoje, dažniausiai ant seno medinio stalo prie lango, kuris žvelgia į sodą. Tikiu, kad maisto nuotraukos turi perteikti ne tik patiekalo išvaizdą, bet ir atmosferą, istoriją, prisiminimus, kuriuos tas patiekalas sukelia.'
    }
  ],
  email: 'lidija@saukstas-meiles.lt',
  social: {
    facebook: 'https://facebook.com/saukstas.meiles',
    instagram: 'https://instagram.com/saukstas.meiles',
    pinterest: 'https://pinterest.com/saukstas.meiles'
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2025-01-15T10:30:00Z'
};

// Function to save data to file
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
    return false;
  }
}

// Initialize data files with mock data
function initMockupData() {
  console.log('\n===== Šaukštas Meilės - Initializing Mockup Data =====\n');
  
  // Check if files already exist
  const filesExist = {
    recipes: fs.existsSync(RECIPES_FILE),
    comments: fs.existsSync(COMMENTS_FILE),
    about: fs.existsSync(ABOUT_FILE)
  };
  
  // Prompt for overwrite if files exist
  if (filesExist.recipes || filesExist.comments || filesExist.about) {
    console.log('Some data files already exist:');
    if (filesExist.recipes) console.log('- Recipes: Yes');
    if (filesExist.comments) console.log('- Comments: Yes');
    if (filesExist.about) console.log('- About page: Yes');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nDo you want to overwrite existing files? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        writeAllFiles();
        console.log('\nMock data initialized successfully!');
      } else {
        console.log('\nOperation cancelled.');
      }
      readline.close();
    });
  } else {
    // If no files exist, create them
    writeAllFiles();
    console.log('\nMock data initialized successfully!');
  }
}

// Function to write all mockup data files
function writeAllFiles() {
  // Save recipes
  if (saveData(RECIPES_FILE, recipes)) {
    console.log(`Created recipes data with ${recipes.length} recipes.`);
  } else {
    console.error('Failed to create recipes data.');
  }
  
  // Save comments
  if (saveData(COMMENTS_FILE, comments)) {
    console.log(`Created comments data with ${comments.length} comments.`);
  } else {
    console.error('Failed to create comments data.');
  }
  
  // Save about page data
  if (saveData(ABOUT_FILE, aboutData)) {
    console.log('Created about page data.');
  } else {
    console.error('Failed to create about page data.');
  }
}

// Start initialization process
initMockupData();