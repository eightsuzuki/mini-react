/**
 * @flow
 */

import { createElement, render } from '../render';
import { JSDOM } from 'jsdom';

describe('render', () => {
  let container = null;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
    container = document.createElement('div');
  });

  afterEach(() => {
    delete global.document;
    container = null;
  });

  test('render element with props and appends it to container', () => {
    let element = {
      type: 'div',
      props: {
        id: 'id',
        className: 'class',
        type: 'type',
        value: 'こんにちは',
        children: [],
      },
    };
    const container = document.createElement('div');
    render(element, container);

    const divElement = container.firstChild;

    expect(divElement.tagName).toBe('DIV');
    expect(divElement.id).toBe('id');
    expect(divElement.className).toBe('class');
    expect(divElement.type).toBe('type');
    expect(divElement.value).toBe('こんにちは');
  });

  test('render element with child and appends it to container', () => {
    const childElement = createElement('child', { children: [] });
    const parentElement = {
      type: 'parent',
      props: {
        children: [childElement],
      },
    };
    const container = document.createElement('div');
    render(parentElement, container);

    const divElement = container.firstChild;

    expect(divElement.tagName).toBe('PARENT');
    expect(divElement.firstChild.tagName).toBe('CHILD');
  });
});