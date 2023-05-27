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

export function render(element, container) {
  const dom =
    element.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  const isProperty = (key) => key !== 'children';
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });

  element.props.children.forEach((child) => render(child, dom));
  container.appendChild(dom);
}

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

// export function render(element, container) {
//   nextUnitOfWork = {
//     dom: container, // ここのdomは、ファイバーと対応するDOM要素自分自身
//     props: {
//       children: [element],
//     },
//   }
// }

// let nextUnitOfWork = null;
// let currentRoot = null;
// let wipRoot = null;
// let deletions = null;

// export function workLoop(deadline) {
//   let shouldYield = false;
//   while (nextUnitOfWork && !shouldYield) {
//     nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
//     shouldYield = deadline.timeRemaining() < 1;
//   }

//   // if (!nextUnitOfWork && wipRoot) {
//   //   commitRoot()
//   // }

//   requestIdleCallback(workLoop);
// }

// requestIdleCallback(workLoop);

// function performUnitOfWork(fiber) {
//   const isFunctionComponent = fiber.type instanceof Function;
//   // if (isFunctionComponent) {
//   //   updateFunctionComponent(fiber);
//   // } else {
//   //   updateHostComponent(fiber);
//   // }
//   if (fiber.child) {
//     return fiber.child;
//   }
//   let nextFiber = fiber;
//   while (nextFiber) {
//     if (nextFiber.sibling) {
//       return nextFiber.sibling;
//     }
//     nextFiber = nextFiber.parent;
//   }
// }
