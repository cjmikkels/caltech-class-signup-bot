/**
 * A class to represent HTML tag types that we interact with
 */
class HTMLtag {
  static A = new HTMLtag('a');
  static Button = new HTMLtag('button');
  static Span = new HTMLtag('span');

  constructor(name) {
    this.name = name;
  }
}

/**
 * Clicks the element with the provided text
 * @param {Page} page
 * @param {string} text - the text of the item you want to click
 * @param {HTMLtag} tagType – which HTML tag type you're clicking, e.g. button, a, etc.
 * @returns
 */
const clickElementWithCertainText = async (
  page,
  text,
  tagType,
  shouldWaitForNavigation = true,
) => {
  switch (tagType) {
    case HTMLtag.A:
      const [a] = await page.$x(`//a[contains(., '${text}')]`);
      if (a) {
        if (shouldWaitForNavigation) {
          await Promise.all([page.waitForNavigation(), a.click()]);
        } else {
          await a.click();
        }
      }
      break;

    case HTMLtag.button:
      break;

    case HTMLtag.Span:
      const [span] = await page.$x(`//span[contains(., '${text}')]`);
      if (span) {
        if (shouldWaitForNavigation) {
          await Promise.all([page.waitForNavigation(), span.click()]);
        } else {
          await span.click();
        }
      }
      break;
  }

  return;
};

/**
 * Types text into the specified element (e.g. into a text box)
 * @param {*} page
 * @param {*} elementIdentifier - identifier of element to type into e.g. 'input[name=login]'
 * @param {*} stringToType - string to type
 */
const typeIntoElement = async (page, elementIdentifier, stringToType) => {
  await page.focus(elementIdentifier);
  await page.keyboard.type(stringToType);
};

const getProperty = async (element, property) => {
  return await (await element.getProperty(property)).jsonValue();
};

/**
 * Gets text of element e.g. \<div>hello\</div> => "hello"
 * @param {*} page
 * @param {*} element – element to get text of (NOT identifier like 'input[name=login])
 * @returns
 */
const getElementText = async (page, element) => {
  return await page.evaluate((el) => el.textContent, element);
};

module.exports = {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
  getProperty,
  getElementText,
};
