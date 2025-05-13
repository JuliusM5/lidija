// server/routes/about.js - About page API endpoints

const express = require('express');
const router = express.Router();
const { loadData, ABOUT_FILE } = require('../utils/fileUtil');

/**
 * GET /api/about
 * Get about page data
 */
router.get('/', (req, res) => {
  // Load about page data
  const about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    // Return default data structure if no data found
    const defaultAbout = {
      title: 'Apie Mane',
      subtitle: 'Kelionė į širdį per maistą, pilną gamtos dovanų, švelnumo ir paprastumo',
      image: '',
      intro: 'Sveiki, esu Lidija – keliaujanti miško takeliais, pievomis ir laukais, kur kiekvienas žolės stiebelis, vėjo dvelksmas ar laukinė uoga tampa įkvėpimu naujam skoniui. Maisto gaminimas ir fotografija man – tai savotiška meditacija, leidžianti trumpam sustoti ir pasimėgauti akimirka šiandieniniame chaose.',
      sections: [
        {
          title: 'Mano istorija',
          content: 'Viskas prasidėjo mažoje kaimo virtuvėje, kur mano močiutė Ona ruošdavo kvapnius patiekalus iš paprastų ingredientų. Stebėdavau, kaip jos rankos minkydavo tešlą, kaip ji lengvai ir gracingai sukosi tarp puodų ir keptuvių, kaip pasakodavo apie kiekvieną žolelę, kurią pridėdavo į sriubą ar arbatą.'
        },
        {
          title: 'Mano filosofija',
          content: 'Tikiu, kad maistas yra daugiau nei tik kuras mūsų kūnui – tai būdas sujungti žmones, išsaugoti tradicijas ir kurti naujus prisiminimus.'
        }
      ],
      email: 'lidija@saukstas-meiles.lt',
      social: {
        facebook: 'https://facebook.com/saukstas.meiles',
        instagram: 'https://instagram.com/saukstas.meiles',
        pinterest: 'https://pinterest.com/saukstas.meiles'
      }
    };
    
    res.json({
      success: true,
      data: defaultAbout
    });
  } else {
    res.json({
      success: true,
      data: about
    });
  }
});

module.exports = router;