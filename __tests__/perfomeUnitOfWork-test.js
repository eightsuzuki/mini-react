/**
 * @flow
 */

import {
  createElement,
  render,
  createDom,
  performUnitOfWork,
  workLoop,
  commitRoot,
  commitWork,
} from '../perfomeUnitOfWork';
import { JSDOM } from 'jsdom';

describe('performUnitOfWork', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.document;
  });

  // test('step 1:Create DOM elements from fiber and add to the DOM', () => {
  //   const parentFiber = {
  //     dom: document.createElement('div'),
  //     parent: null,
  //   };

  //   const childFiber = {
  //     dom: document.createElement('a'),
  //     parent: parentFiber,
  //   };

  //   performUnitOfWork(childFiber);

  //   expect(parentFiber.dom.childNodes[0]).toBe(childFiber.dom);
  // });
  // step 1以外を消去してください

  test('step 2:Make childFibers of fiber', () => {
    const fiber = {
      dom: document.createElement('div'),
      parent: null,
      props: {
        children: [
          { type: 'p1', props: {} },
          { type: 'p2', props: {} },
        ],
      },
    };

    performUnitOfWork(fiber);

    expect(fiber.child.type).toBe('p1');
    expect(fiber.child.sibling.type).toBe('p2');
  });

  test('step 3:Determine next fiber(child exit)', () => {
    const fiber = {
      type: 'div',
      props: {
        children: [{ type: 'p1', props: {} }],
      },
      parent: null,
      dom: null,
      child: {
        type: 'p2',
        props: {},
        parent: null,
        dom: null,
      },
      sibling: null,
    };

    const nextFiber = performUnitOfWork(fiber);
    expect(nextFiber).toBe(fiber.child);
  });

  test('step 3:Determine next fiber(sibling and no child exit)', () => {
    const fiber = {
      type: 'div1',
      props: {
        children: {},
      },
      parent: null,
      dom: null,
      child: null,
      sibling: {
        type: 'div2',
        parent: null,
      },
    };

    const nextFiber = performUnitOfWork(fiber);
    expect(nextFiber).toBe(fiber.sibling);
  });

  test('step 3:Determine next fiber(parent and no sibling, no child exit)', () => {
    const parentFiber = {
      dom: document.createElement('div'),
      parent: null,
      sibling: {
        type: 'div2',
        parent: null,
      },
    };
    const fiber = {
      type: 'div1',
      props: {
        children: {},
      },
      parent: parentFiber,
      dom: null,
      child: null,
      sibling: null,
    };

    const nextFiber = performUnitOfWork(fiber);
    expect(nextFiber).toBe(parentFiber.sibling);
  });
});
