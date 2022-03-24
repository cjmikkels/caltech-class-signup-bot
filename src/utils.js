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
 * Returns the parent of the given element
 * @param {ElementHandle} element – the element whose parent you want
 * @returns
 */
const getParent = async (element) => {
  return (await element.$x('..'))[0];
};

const checkForDesiredInfo = (optionName, desiredInfo) => {
  const optionNameLowerCase = optionName.toLowerCase();
  const desiredInfoLowerCase = desiredInfo.toLowerCase();

  return optionNameLowerCase.includes(desiredInfoLowerCase);
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

  let desiredInfoId;
  for (const optionElement of optionElements) {
    const parent = await getParent(optionElement);
    const parentId = await getProperty(parent, 'id');

    // If we're on SECTION_INSTRUCTOR, we only want to examine option elements
    // under the SECTION_INSTRUCTOR select tag
    if (!selectElementIdentifier.includes(parentId)) continue;

    const optionName = await getElementText(page, optionElement);

    if (checkForDesiredInfo(optionName, desiredInfo)) {
      desiredInfoId = await getProperty(optionElement, htmlTagAttributes.VALUE);
      break;
    }
  }

  // Todo: create a select function that handles all of this
  await Promise.all([
    page.select(selectElementIdentifier, desiredInfoId),
    page.waitForSelector(selectElementIdentifier),
  ]);
};

/**
 * Signs up for a class
 * @param {*} page
 * @param {*} classToSignUpFor – object for the class we want to sign up for (from the config object)
 */
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

/**
 * Returns the ASCII value of a character
 * @param {*} char
 * @returns
 */
const getAsciiValue = (char) => {
  return char.charCodeAt(0);
};

const asciiValueOfZero = getAsciiValue('0');
const asciiValueOfNine = getAsciiValue('9');

/**
 * Returns boolean representing whether the given character is a digit
 * @param {*} char
 * @returns
 */
const isDigit = (char) => {
  const asciiValue = getAsciiValue(char);
  return asciiValue >= asciiValueOfZero && asciiValue <= asciiValueOfNine;
};

/**
 * Returns the number of digits in a string
 * @param {*} string
 * @returns
 */
const getNumDigitsInString = (string) => {
  let numDigits = 0;

  for (let char of string) {
    if (isDigit(char)) {
      numDigits++;
    }
  }

  return numDigits;
};

/**
 * Returns index of first digit in string
 * @param {*} string
 */
const getIndexOfFirstDigit = (string) => {
  for (let i = 0; i < string.length; i++) {
    const char = string.charAt(i);

    if (isDigit(char)) return i;
  }

  return -1;
};

/**
 * Formats a string e.g. "Ma 1c" => "Ma 001C"
 * @param {*} string – the initial string
 * @param {*} desiredNumberSize – how many number we want, e.g. if we want 1 => 001, desiredNumberSize = 3
 * @returns
 */
const format = (string, desiredNumberSize) => {
  const numDigitsInString = getNumDigitsInString(string);
  const numDigitsToAdd = desiredNumberSize - numDigitsInString;

  const indexOfFirstDigit = getIndexOfFirstDigit(string);

  const beforeDigits = string.substring(0, indexOfFirstDigit);
  const zeroInsertion = '0'.repeat(numDigitsToAdd);
  const remainingCharacters = string.substring(indexOfFirstDigit).toUpperCase();

  return beforeDigits + zeroInsertion + remainingCharacters;
};

/**
 * Do some formatting on the user-inputted class data. e.g. 1c => 001c
 * Suppose we had a class number of 11, but 111 also exists in that department.
 * We could have a collision. So, for class numbers, we always have 3-digits
 * e.g. 011 vs 111
 * @param {*} classes
 */
const formatClasses = (classes) => {
  const sizeOfClassNumber = 3;
  const sizeOfSectionNumber = 2;

  for (const desiredClass of classes) {
    desiredClass.offeringName = format(
      desiredClass.offeringName,
      sizeOfClassNumber,
    );

    desiredClass.sectionInstructor = format(
      desiredClass.sectionInstructor,
      sizeOfSectionNumber,
    );
  }
};

module.exports = {
  HTMLtag,
  clickElementWithCertainText,
  typeIntoElement,
  getProperty,
  getElementText,
  selectClassInfo,
  signUpForGivenClass,
  formatClasses,
};
