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
  reconcileChildren,
  updateDom,
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

// describe('commitWork', () => {
//   beforeEach(() => {
//     const dom = new JSDOM('<!doctype html><html><body></body></html>');
//     global.document = dom.window.document;
//   });

//   afterEach(() => {
//     delete global.document;
//   });

//   test('commits a fiber with PLACEMENT effect', () => {
//     const parentDom = document.createElement('div');
//     const childDom = document.createElement('span');
//     const fiber = {
//       dom: childDom,
//       parent: {
//         dom: parentDom,
//       },
//       effectTag: 'PLACEMENT',
//     };

//     commitWork(fiber);

//     expect(parentDom.childNodes.length).toBe(1);
//     expect(parentDom.childNodes[0]).toBe(childDom);
//   });

//   test('commits a fiber with UPDATE effect', () => {
//     const dom = document.createElement('div');
//     dom.textContent = 'Previous';
//     const fiber = {
//       dom: dom,
//       parent: null,
//       effectTag: 'UPDATE',
//       alternate: {
//         props: {
//           children: ['Previous'],
//         },
//       },
//       props: {
//         children: ['Next'],
//       },
//     };

//     commitWork(fiber);

//     expect(dom.textContent).toBe('Next');
//   });

//   test('commits a fiber with DELETION effect', () => {
//     const parentDom = document.createElement('div');
//     const childDom = document.createElement('span');
//     parentDom.appendChild(childDom);
//     const fiber = {
//       dom: childDom,
//       parent: {
//         dom: parentDom,
//       },
//       effectTag: 'DELETION',
//     };

//     commitWork(fiber);

//     expect(parentDom.childNodes.length).toBe(0);
//   });
// });

describe('reconcileChildren', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.document;
  });

  test('reconcile children and create new fiber', () => {
    const parentFiber = {
      alternate: null,
      child: null,
    };

    const elements = [
      { type: 'div', props: {} },
      { type: 'span', props: {} },
      { type: 'p', props: {} },
    ];

    reconcileChildren(parentFiber, elements);

    expect(parentFiber.child.type).toBe('div');
    expect(parentFiber.child.sibling.type).toBe('span');
    expect(parentFiber.child.sibling.sibling.type).toBe('p');
  });

  test('reconciles children with same type', () => {
    const wipFiber = {
      alternate: {
        child: {
          type: 'div',
          props: { id: 'old' },
          dom: document.createElement('div'),
        },
      },
    };
    const elements = [
      { type: 'div', props: { id: 'new' } },
      { type: 'span', props: { id: 'new2' } },
    ];

    reconcileChildren(wipFiber, elements);

    expect(wipFiber.child.type).toBe('div');
    expect(wipFiber.child.props.id).toBe('new');
    expect(wipFiber.child.alternate).toBeDefined();
    expect(wipFiber.child.effectTag).toBe('UPDATE');
    expect(wipFiber.child.sibling.type).toBe('span');
    expect(wipFiber.child.sibling.props.id).toBe('new2');
    expect(wipFiber.child.sibling.alternate).toBeNull();
    expect(wipFiber.child.sibling.effectTag).toBe('PLACEMENT');
  });

  /* renderを行なってできるsrc.jsでのグローバル関数deletionsはexportされないためテストできない*/

  // test('reconciles children with different types', () => {
  //   const wipFiber = {
  //     alternate: {
  //       child: {
  //         type: 'div',
  //         props: { id: 'old' },
  //         dom: document.createElement('div'),
  //       },
  //     },
  //   };
  //   const elements = [
  //     { type: 'span', props: { id: 'new' } },
  //   ];
  //   let deletions = [];

  //   reconcileChildren(wipFiber, elements); // `deletions` 配列の追加

  //   expect(wipFiber.child.type).toBe('span');
  //   expect(wipFiber.child.props.id).toBe('new');
  //   expect(wipFiber.child.alternate).toBeNull();
  //   expect(wipFiber.child.effectTag).toBe('PLACEMENT');
  //   expect(deletions.length).toBe(1); // `deletions` 配列の要素数を確認
  //   expect(deletions[0].type).toBe('div'); // 削除された要素を確認
  //   expect(deletions[0].effectTag).toBe('DELETION'); // 削除された要素の effectTag を確認
  // });
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

describe('updateDom', () => {
  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    global.document = dom.window.document;
  });

  afterEach(() => {
    delete global.document;
  });

  test('removes previous event listeners correctly', () => {
    const dom = document.createElement('div');
    const prevProps = {
      onClick: jest.fn(),
      onMouseOver: jest.fn(),
      onKeyPress: jest.fn(),
    };
    const nextProps = {
      onClick: jest.fn(),
      onKeyUp: jest.fn(),
    };

    // removeEventListenerのモック関数を作成
    const removeEventListenerMock = jest.fn();
    dom.removeEventListener = removeEventListenerMock;

    updateDom(dom, prevProps, nextProps);

    // 変更されたevent listenerが削除されたか確認
    expect(removeEventListenerMock).toHaveBeenCalledTimes(3);
    expect(removeEventListenerMock).toHaveBeenCalledWith('click', prevProps.onClick);
    expect(removeEventListenerMock).toHaveBeenCalledWith('mouseover', prevProps.onMouseOver);
    expect(removeEventListenerMock).toHaveBeenCalledWith('keypress', prevProps.onKeyPress);
  });

  test('updates DOM element properties correctly', () => {
    const dom = document.createElement('div');
    const prevProps = {
      className: 'prev-class',
      title: 'Previous',
      value: 'prev-value',
    };
    const nextProps = {
      className: 'next-class',
      title: 'Next',

    };
        // removeEventListenerのモック関数を作成
    const removeEventListenerMock = jest.fn();
    dom.removeEventListener = removeEventListenerMock;

    updateDom(dom, prevProps, nextProps);

    expect(dom.className).toBe('next-class');
    expect(dom.title).toBe('Next');
    expect(dom.value).toBe('');
  });

  test('adds new event listeners correctly', () => {
    const dom = document.createElement('div');

    const prevProps = {
      onClick: jest.fn(),
    };

    const nextProps = {
      onClick: jest.fn(),
      onMouseOver: jest.fn(),
    };

    // removeEventListenerのモック関数を作成
    const removeEventListenerMock = jest.fn();
    dom.removeEventListener = removeEventListenerMock;

    // addEventListenerのモック関数を作成
    const addEventListenerMock = jest.fn();
    dom.addEventListener = addEventListenerMock;

    updateDom(dom, prevProps, nextProps);

    // 削除されたイベントリスナーがremoveEventListenerで呼び出されているか確認
    expect(removeEventListenerMock).toHaveBeenCalledTimes(1);
    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'click',
      prevProps.onClick
    );

    // 新しいイベントリスナーがaddEventListenerで設定されているか確認
    expect(addEventListenerMock).toHaveBeenCalledTimes(2);
    expect(addEventListenerMock).toHaveBeenCalledWith(
      'mouseover',
      nextProps.onMouseOver
    );    
    expect(addEventListenerMock).toHaveBeenCalledWith(
      'click',
      nextProps.onClick
    );
  });
});