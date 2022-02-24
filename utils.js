class HTMLtag {
  static A = new HTMLtag('a');
  static Button = new HTMLtag('button');
  static Span = new HTMLtag('span');

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

    case HTMLtag.Span:
      const [span] = await page.$x(`//span[contains(., '${text}')]`);
      if (span) {
        await span.click();
      }
      break;
  }

  return;
};

/**
 *
 * @param {*} page
 * @param {*} elementIdentifier - identifier of element to type into e.g. 'input[name=login]'
 * @param {*} stringToType - string to type
 */
const typeIntoElement = async (page, elementIdentifier, stringToType) => {
  await page.focus(elementIdentifier);
  await page.keyboard.type(stringToType);
};

module.exports = { HTMLtag, clickElementWithCertainText, typeIntoElement };
