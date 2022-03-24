const { htmlTagAttributes } = require('./constants');

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

/**
 * Get a given property of an element e.g. getProperty(\<img src="hi" />, 'src') => "hi"
 * @param {*} element – element to get property from (NOT identifier like 'input[name=login]')
 * @param {*} property – the property to retrieve, e.g. src, href, value, etc.
 * @returns
 */
const getProperty = async (element, property) => {
  return await (await element.getProperty(property)).jsonValue();
};

/**
 * Gets text of element e.g. \<div>hello\</div> => "hello"
 * @param {*} page
 * @param {*} element – element to get text of (NOT identifier like 'input[name=login]')
 * @returns
 */
const getElementText = async (page, element) => {
  return await page.evaluate((el) => el.textContent, element);
};

const selectClassInfo = async (page, selectElementIdentifier, desiredInfo) => {
  // Populate the class department
  const optionElements = await page.$$('option');

  // let desiredDepartmentId;
  let desiredInfoId;
  for (const optionElement of optionElements) {
    const optionName = await getElementText(page, optionElement);

    if (optionName === desiredInfo) {
      desiredInfoId = await getProperty(optionElement, htmlTagAttributes.VALUE);
      break;
    }
  }

  await Promise.all([
    page.select(selectElementIdentifier, desiredInfoId),
    page.waitForSelector(selectElementIdentifier),
  ]);
};

// selectClassInfo(selectorIdentifiers.DEPARTMENT, desiredClass.department);

module.exports = {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
  getProperty,
  getElementText,
  selectClassInfo,
};
