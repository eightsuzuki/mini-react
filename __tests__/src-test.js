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

describe('workLoop', () => {
  function requestIdleCallback(callback) {
    // callback({ timeRemaining: () => 1 });
    expect(callback).not.toBe(null);
  }

  test('requestIdleCallback mock work test', () => {
    global.requestIdleCallback = requestIdleCallback;
    workLoop(null);
  });
});

// describe('workLoop1', () => {
//   let originalRequestIdleCallback;
//   let mockRequestIdleCallback;
//   let mockPerformUnitOfWork;
//   let mockCommitRoot;

//   beforeEach(() => {
//     // オリジナルの requestIdleCallback を保持
//     originalRequestIdleCallback = window.requestIdleCallback;

//     // モック化した requestIdleCallback 関数を作成
//     mockRequestIdleCallback = jest.fn((callback) => {
//       // callback({ timeRemaining: () => 1 });
//       expect(callback).not.toBe(null);
//     });

//     // モジュール内の関数をモック化
//     mockPerformUnitOfWork = jest.spyOn(your-module, 'performUnitOfWork').mockImplementation(() => {
//       // 必要な処理を返す
//     });

//     mockCommitRoot = jest.spyOn(your-module, 'commitRoot').mockImplementation(() => {
//       // 必要な処理を返す
//     });

//     // window.requestIdleCallback をモック化した関数に置き換える
//     window.requestIdleCallback = mockRequestIdleCallback;
//   });

//   afterEach(() => {
//     // テスト終了後にモックを元に戻す
//     window.requestIdleCallback = originalRequestIdleCallback;
//     mockPerformUnitOfWork.mockRestore();
//     mockCommitRoot.mockRestore();
//   });

//   test('should call requestIdleCallback', () => {
//     workLoop(null);

//     expect(mockRequestIdleCallback).toHaveBeenCalledTimes(1);
//     expect(mockRequestIdleCallback).toHaveBeenCalledWith(expect.any(Function));
//   });

//   // 他のテストケースも追加できます
// });

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

//   // test('commits the child fiber of wipRoot', () => {
//   //   const parentDom = document.createElement('parent');
//   //   const myDom = document.createElement('me');
//   //   const childDom = document.createElement('child');

//   //   const wipRoot = {
//   //     dom: myDom,
//   //     parent: {
//   //       dom: parentDom,
//   //     },
//   //     child: null,
//   //     sibling: null,
//   //   };

//   //   const fiber = {
//   //     dom: childDom,
//   //     parent: wipRoot,
//   //     child: null,
//   //     sibling: null,
//   //   };

//   //   wipRoot.child = fiber;

//   //   commitRoot();

//   //   console.log(fiber.parent.dom);

//   //   expect(fiber.parent.dom).toBe(0);
//   //   expect(wipRoot).toBe(null);
//   // });

//   // test('resets wipRoot to null', () => {
//   //   const childDom = document.createElement('child');
//   //   const parentDom = document.createElement('parent');
//   //   const container = document.createElement('container');
//   //   const wipRoot = { dom: parentDom, child: null, type: 'parent', props: {} };
//   //   const fiber = {
//   //     dom: childDom,
//   //     type: 'child',
//   //     parent: wipRoot,
//   //   };

//   //   wipRoot.child = fiber;

//   //   commitRoot();

//   //   expect(parentElement.child.dom).toBe(childDom);
//   // });
//   test('resets wipRoot to null', () => {
//     // テストに必要なDOM要素を作成
//     const parentDom = document.createElement('div');
//     const childDom = document.createElement('span');

//     // テスト用のデータを準備
//     const wipRoot = {
//       dom: parentDom,
//       parent: null,
//       child: {
//         dom: childDom,
//         parent: null,
//         child: null,
//         sibling: null,
//       },
//       sibling: null,
//     };

//     // commitRootを実行
//     commitWork(wipRoot.child); // commitWorkの実行が必要

//     // wipRootがnullにリセットされたことを検証
//     expect(wipRoot).toBe(null);
//   });


// });

//　質問　src で wipRootがnullになっているのを確認するほうほう？
