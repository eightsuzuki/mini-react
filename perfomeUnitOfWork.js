function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT', // 特別なテキストノード
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

// export function render(element, container) {
//   const dom =
//     element.type == 'TEXT_ELEMENT'
//       ? document.createTextNode('')
//       : document.createElement(element.type);

//   const isProperty = (key) => key !== 'children';
//   Object.keys(element.props)
//     .filter(isProperty)
//     .forEach((name) => {
//       dom[name] = element.props[name];
//     });

//   element.props.children.forEach((child) => render(child, dom));

//   container.appendChild(dom);
// }

export function createDom(fiber) {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode(fiber.props.value)
      : document.createElement(fiber.type);

  const isProperty = (key) => key !== 'children';
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  //ここは子要素の処理はせず、一旦現時点で作った要素をリターン
  return dom;
}

export function render(element, container) {
  wipRoot = {
    // wip => work in progress、現在更新中のファイバーツリー
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = wipRoot;
}

// 次に実行するタスク・レンダリングをnullに初期化
let nextUnitOfWork = null;
let wipRoot = null;

export function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

// requestIdleCallback(workLoop);

export function performUnitOfWork(fiber) {
  // step 1: ファイバーからDOM要素を作り、作られた要素をDOMに追加
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // step 2: ファイバーの子ファイバーを作る
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }

  // step 3: 次に実行するタスクを決める
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

export function commitRoot() {
  commitWork(wipRoot.child);
  wipRoot = null; // 次回のレンダリングとコミットを干渉しないようにnullへリセット
}

export function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  const domParent = fiber.parent.dom;
  domParent.appendChild(fiber.dom); // fiber.domはDOM要素そのもの
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
