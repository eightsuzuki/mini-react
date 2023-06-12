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

describe('commitWork', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.document;
  });

  test('commit fiber.dom to the parent DOM', () => {
    const parentDom = document.createElement('parent');
    const childDom = document.createElement('child');

    const fiber = {
      dom: childDom,
      parent: {
        dom: parentDom,
      },
      child: null,
      sibling: null,
    };

    commitWork(fiber);

    expect(parentDom.contains(childDom)).toBe(true);
  });

  test('commit child and sibling fibers', () => {
    // モックとして使用するDOM要素を作成
    const parentDom = document.createElement('parent');
    const myDom = document.createElement('me');
    const childDom = document.createElement('child1');
    const siblingDom = document.createElement('child2');

    const myFiber = {
      dom: myDom,
      parent: {
        dom: parentDom,
      },
      child: null,
      sibling: null,
    };

    const siblingFiber = {
      dom: siblingDom,
      parent: myFiber,
      child: null,
      sibling: null,
    };

    const childFiber = {
      dom: childDom,
      parent: myFiber,
      child: null,
      sibling: siblingFiber,
    };

    myFiber.child = childFiber;

    commitWork(myFiber);

    expect(parentDom.contains(myDom)).toBe(true);
    expect(myDom.contains(childDom)).toBe(true);
    expect(childDom.nextSibling).toBe(siblingDom);
    expect(childDom.contains(myDom)).toBe(false);
    expect(parentDom.contains(siblingDom)).toBe(true);
  });
});

// describe('commitRoot', () => {
//   beforeEach(() => {
//     const dom = new JSDOM('<!doctype html><html><body></body></html>');
//     global.document = dom.window.document;
//   });

//   afterEach(() => {
//     delete global.document;
//   });

//   test('commitWork', () => {
//   });
// });

// describe('workLoop', () => {
//   const requestIdleCallback = jest.fn((callback) => {
//     callback({ timeRemaining: () => 1 }); // 仮の timeRemaining の実装
//   });

//   test('requestIdleCallback mock', () => {
//     workLoop();

//     expect(requestIdleCallback).toHaveBeenCalledTimes(1);
//     expect(requestIdleCallback).toHaveBeenCalledWith(expect.any(Function));
//   });
// });
