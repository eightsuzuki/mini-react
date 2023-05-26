/**
 * @flow
 */

import { createElement, render } from '../src';
import { JSDOM } from 'jsdom';

describe('createElement', () => {
  test('create element', () => {
    let expected = {
      type: 'div',
      props: { children: [] },
    };
    let elem = createElement('div', null);
    expect(elem).toEqual(expected);
  });
});




