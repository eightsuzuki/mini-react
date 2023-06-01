/**
 * @flow
 */

import {
  createElement,
  render,
  createDom,
  workLoop,
  performUnitOfWork,
} from '../src';
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

// describe('render', () => {
//   let container = null;

//   beforeEach(() => {
//     const dom = new JSDOM('<!doctype html><html><body></body></html>');
//     global.document = dom.window.document;
//     container = document.createElement('div');
//   });

//   afterEach(() => {
//     delete global.document;
//     container = null;
//   });

//   test('render element with props and appends it to container', () => {
//     let element = {
//       type: 'div',
//       props: {
//         id: 'id',
//         className: 'class',
//         type: 'type',
//         value: 'こんにちは',
//         children: [],
//       },
//     };
//     const container = document.createElement('div');
//     render(element, container);

//     const divElement = container.firstChild;

//     expect(divElement.tagName).toBe('DIV');
//     expect(divElement.id).toBe('id');
//     expect(divElement.className).toBe('class');
//     expect(divElement.type).toBe('type');
//     expect(divElement.value).toBe('こんにちは');
//   });

//   test('render element with child and appends it to container', () => {
//     const childElement = createElement('child', { children: [] });
//     const parentElement = {
//       type: 'parent',
//       props: {
//         children: [childElement],
//       },
//     };
//     const container = document.createElement('div');
//     render(parentElement, container);

//     const divElement = container.firstChild;

//     expect(divElement.tagName).toBe('PARENT');
//     expect(divElement.firstChild.tagName).toBe('CHILD');
//   });
// });

describe('createDom', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.document;
  });

  test('create DOM node with type and prop', () => {
    const fiber = {
      type: 'div',
      props: {
        value: 'Hi',
      },
    };

    const domNode = createDom(fiber);

    expect(domNode.nodeType).toBe(1);
    expect(domNode.value).toBe('Hi');
    expect(domNode.nodeValue).toBe(null);
    //nodeValueはテキストノードの時のみ、それ以外つまりDOMノードではnullを返す
  });

  test('create DOM text node', () => {
    let fiber = {
      type: 'TEXT_ELEMENT',
      props: {
        value: 'Hi',
      },
    };

    const domNode = createDom(fiber);

    expect(domNode.nodeType).toBe(3);
    expect(domNode.nodeValue).toBe('Hi');
    expect(domNode.value).toBe('Hi');
  });
});

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
  //step 1以外を消去してください


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

  test('step 3:Determine next fiber(childFiber)', () => {
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

  // test('step 3:Determine next fiber(siblingFiber)', () => {
  //   const fiber = {
  //     type: 'div',
  //     props: {
  //       children: [{ type: 'p1', props: {} }],
  //     },
  //     parent: null,
  //     dom: null,
  //     child: null,
  //     sibling: {
  //       type: 'p2',
  //       props: {},
  //       parent: null,
  //       dom: null,
  //     },
  //   };

  //   const nextFiber = performUnitOfWork(fiber);
  //   expect(nextFiber).toBe(fiber.sibling);
  // });
});