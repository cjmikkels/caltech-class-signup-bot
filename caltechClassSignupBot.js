const puppeteer = require('puppeteer');
require('dotenv').config();

const { USERNAME, PASSWORD } = process.env;

class HTMLtag {
  static A = new HTMLtag('a');
  static Button = new HTMLtag('button');

  constructor(name) {
    this.name = name;
  }
}

/**
 *
 * @param {Page} page
 * @param {string} text - the text of the item you want to click
 * @param {HTMLtag} tagType – which HTML tag type you're clicking, e.g. button, a, etc.
 * @returns
 */
const clickElementWithCertainText = async (page, text, tagType) => {
  switch (tagType) {
    case HTMLtag.A:
      const [a] = await page.$x(`//a[contains(., '${text}')]`);
      if (a) {
        await a.click();
      }
      break;

    case HTMLtag.button:
      break;
  }

  return;
};

const signupForClasses = async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 2000 });

  const page = await browser.newPage();
  await page.goto('https://access.caltech.edu');

  // await clickElementWithCertainText(page, 'Sign in', HTMLtag.A);

  await browser.close();
};

signupForClasses();
