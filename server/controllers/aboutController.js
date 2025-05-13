// server/controllers/aboutController.js
const path = require('path');
const fs = require('fs');
const { loadData, saveData, handleImageUpload, ABOUT_FILE } = require('../utils/fileUtil');

/**
 * Get about page data
 */
exports.getAboutData = () => {
  // Load about data
  const about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    // Return default data if none exists
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
    
    return { success: true, data: defaultAbout };
  }
  
  return { success: true, data: about };
};

/**
 * Update about page data
 */
exports.updateAboutData = (aboutData, imageFile) => {
  const { 
    title = '', subtitle = '', intro = '', 
    section_titles = [], section_contents = [], 
    email = '', facebook_url = '', instagram_url = '', pinterest_url = '' 
  } = aboutData;
  
  // Load existing about data
  let about = loadData(ABOUT_FILE);
  
  if (!about || Object.keys(about).length === 0) {
    about = {};
  }
  
  // Handle image upload
  let image = about.image || '';
  if (imageFile) {
    const newImage = handleImageUpload(imageFile, 'about');
    if (newImage) {
      // Delete old image if it exists
      if (image) {
        const oldImagePath = path.join(__dirname, '../../public/img/about', image);
        try {
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      image = newImage;
    }
  }
  
  // Create sections array
  const sections = [];
  
  // Handle both array and single value cases
  const titlesArray = Array.isArray(section_titles) ? section_titles : [section_titles];
  const contentsArray = Array.isArray(section_contents) ? section_contents : [section_contents];
  
  for (let i = 0; i < titlesArray.length; i++) {
    if (titlesArray[i]) {
      sections.push({
        title: titlesArray[i],
        content: contentsArray[i] || ''
      });
    }
  }
  
  // Update about data
  about = {
    title,
    subtitle,
    image,
    intro,
    sections,
    email,
    social: {
      facebook: facebook_url,
      instagram: instagram_url,
      pinterest: pinterest_url
    },
    updated_at: new Date().toISOString()
  };
  
  // Save about data
  if (saveData(ABOUT_FILE, about)) {
    return { 
      success: true, 
      message: 'About page updated successfully', 
      data: about 
    };
  } else {
    return { success: false, error: 'Failed to update about page' };
  }
};