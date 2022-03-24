const { htmlTagAttributes, selectTagIdentifiers } = require('./constants');

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

/**
 * Selects the desired class info for one select box (e.g. select "Ma" for department)
 * @param {*} page
 * @param {*} selectElementIdentifier – how we can grab the select element that we want to populate,
 *  e.g. selectTagIdentifiers.DEPARTMENT = 'select#P63_DEPARTMENT'
 * @param {*} desiredInfo – what info we're searching for, e.g. "Ma" for a department
 */
const selectClassInfo = async (page, selectElementIdentifier, desiredInfo) => {
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

const signUpForGivenClass = async (page, classToSignUpFor) => {
  await selectClassInfo(
    page,
    selectTagIdentifiers.DEPARTMENT,
    classToSignUpFor.department,
  );

  await page.waitForFunction(
    () => document.querySelector('select#P63_OFFERING_NAME').length > 1,
  );

  await selectClassInfo(
    page,
    selectTagIdentifiers.OFFERING_NAME,
    classToSignUpFor.offeringName,
  );

  await page.waitForFunction(
    () => document.querySelector('select#P63_SECTION_INSTRUCTOR').length > 1,
  );
  await selectClassInfo(
    page,
    selectTagIdentifiers.SECTION_INSTRUCTOR,
    classToSignUpFor.sectionInstructor,
  );

  await page.waitForFunction(
    () => document.querySelector('select#P63_GRADE_SCHEME').length > 0,
  );

  await clickElementWithCertainText(page, 'Save', HTMLtag.Span);
};

module.exports = {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
  getProperty,
  getElementText,
  selectClassInfo,
  signUpForGivenClass,
};
