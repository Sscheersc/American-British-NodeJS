'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  app.route('/api/translate')
  .post((req, res) => {
    const { text, locale } = req.body;

    // Check for missing fields
    if (!text && !locale) {
      return res.json({ error: 'Required field(s) missing' });
    } else if (!text) {
      return res.json({ error: 'No text to translate' });
    } else if (!locale) {
      return res.json({ error: 'Invalid value for locale field' });
    }

    // Check for valid locale
    if (!(locale === "american-to-british" || locale === "british-to-american")) {
      return res.json({ error: 'Invalid value for locale field' });
    }

    try {
      const translation = translator.translate(text, locale);

      if (translation === text) {
        return res.json({ text, translation: 'Everything looks good to me!' });
      }

      res.json({ text, translation });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

};