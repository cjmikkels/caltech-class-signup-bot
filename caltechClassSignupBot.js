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

const typeIntoElement = async (page, elementIdentifier, stringToType) => {
  await page.focus(elementIdentifier);
  await page.keyboard.type(stringToType);
};

const signIn = async (page) => {
  await typeIntoElement(page, 'input[name=login]', USERNAME);
  await typeIntoElement(page, 'input[name=password]', PASSWORD);

  await page.click('input[type=submit]');
};

const signupForClasses = async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 100 });

  const page = await browser.newPage();
  await page.goto('https://google.com');

  // await signIn(page);

  await clickElementWithCertainText(page, 'Sign in', HTMLtag.A);
};

// console.log(USERNAME);
signupForClasses();
