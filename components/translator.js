const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require('./british-only.js');

class Translator {
    translate(text, locale, highlight = false) {
        let translated;
        if (locale === 'american-to-british') {
            translated = this.americanToBritish(text);
        } else if (locale === 'british-to-american') {
            translated = this.britishToAmerican(text);
        } else {
            return 'Invalid locale';
        }

        // Highlight differences if needed
        if (highlight) {
            translated = this.highlightDifferences(text, translated);
        }

        return translated;
    }

    americanToBritish(text) {
        let translated = text.slice();

        // Handle American-only words first
        for (const word in americanOnly) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            translated = translated.replace(regex, americanOnly[word]);
        }

        // Handle American-to-British spelling
        for (const word in americanToBritishSpelling) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            translated = translated.replace(regex, americanToBritishSpelling[word]);
        };

        // Handle chip shop specifically to avoid duplicating "fish-and-chip shop"
        translated = translated.replace(/\bchip shop\b/gi, "fish-and-chip shop");

        // Handle titles with proper capitalization and remove periods
        translated = this.preserveTitleCapitalization(translated, 'american-to-british');

        // Handle time format (e.g., 12:15 -> 12.15)
        translated = translated.replace(/(\d{1,2}):(\d{2})/g, '$1.$2');

        return translated;
    }

    britishToAmerican(text) {
        let translated = text.slice();

        // Handle British-only words first
        for (const word in britishOnly) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            translated = translated.replace(regex, britishOnly[word]);
        }

        // Handle British-to-American spelling
        for (const word in americanToBritishSpelling) {
            const regex = new RegExp(`\\b${americanToBritishSpelling[word]}\\b`, 'gi');
            translated = translated.replace(regex, word);
        }

        // Handle chip shop to avoid conflicts with American translations
        translated = translated.replace(/\bfish-and-chip shop\b/gi, "chip shop");

        // Handle titles with proper capitalization and add periods
        translated = this.preserveTitleCapitalization(translated, 'british-to-american');

        // Handle time format (e.g., 12.15 -> 12:15)
        translated = translated.replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');

        return translated;
    }

    preserveTitleCapitalization(text, fromLocale) {
        const americanTitles = Object.keys(americanToBritishTitles); // Titles with periods (mr., mrs., etc.)
        const britishTitles = Object.values(americanToBritishTitles); // Titles without periods (mr, mrs, etc.)

        // Create a regex pattern to match titles (American or British)
        const americanPattern = new RegExp(`\\b(${americanTitles.join('|')})(?=\\s|$)`, 'gi');
        const britishPattern = new RegExp(`\\b(${britishTitles.join('|')})(?=\\s|$)`, 'gi');

        // Helper function to preserve the capitalization of the match
        function preserveCase(original, replacement) {
            if (original[0] === original[0].toUpperCase()) {
                return replacement.charAt(0).toUpperCase() + replacement.slice(1);
            }
            return replacement;
        }

        if (fromLocale === 'american-to-british') {
            // Match American titles with periods and replace them with their British equivalents (without periods)
            return text.replace(americanPattern, (match) => {
                const lowerMatch = match.toLowerCase();
                const britishTitle = americanToBritishTitles[lowerMatch]; // Get British title (without period)
                return preserveCase(match, britishTitle); // Preserve the case of the original match
            });
        } else if (fromLocale === 'british-to-american') {
            // Match British titles without periods and replace them with their American equivalents (with periods)
            return text.replace(britishPattern, (match) => {
                const lowerMatch = match.toLowerCase();
                const americanTitle = Object.keys(americanToBritishTitles).find(
                    (key) => americanToBritishTitles[key] === lowerMatch
                ); // Find the matching American title (with period)
                return preserveCase(match, americanTitle); // Preserve the case of the original match
            });
        }

        return text; // No changes if locale doesn't match
    }


    highlightDifferences(original, translated) {
        const originalWords = original.split(/(\s+)/); // Split by spaces while keeping them
        const translatedWords = translated.split(/(\s+)/);

        return translatedWords.map((word, index) => {
            if (word !== originalWords[index]) {
                return `<span class="highlight">${word}</span>`;
            }
            return word;
        }).join('');
    }
}

module.exports = Translator;
