//learn react

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
  nextUnitOfWork = {
    dom: container, // ここのdomは、ファイバーと対応するDOM要素自分自身
    props: {
      children: [element],
    },
  };
}

export function performUnitOfWork(fiber) {
  // step 1: ファイバーからDOM要素を作り、作られた要素をDOMに追加
  // dom属性がなければ、ファイバーからDOM要素を作る
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // もし親ファイバーがあれば、親ファイバーのDOM要素にアペンドする
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  // step 2: ファイバーの子ファイバーを作る
  // 要注意：ここのelementsは実際のDOM要素の配列ではなく、
  // 前節のcreateElementで作られたtypeとpropsのみ持っているオブジェクトの配列となる
  const elements = fiber.props.children;
  let index = 0;
  let prevSibling = null;

  while (index < elements.length) {
    const element = elements[index];
    // elementオブジェクトにparent, domなどの属性を追加することでファイバーとなるため
    // 下記のnewFiberではelementからtypeとpropsを取得している
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    };

    // インデックスが0の場合は初回となるため、まず子ファイバーをセット
    if (index === 0) {
      // ここのchild属性は、あくまでも子要素と対応するファイバーオブジェクト
      fiber.child = newFiber;
    } else {
      // index > 0の場合は、子要素の兄弟要素を見ているため、「兄弟ファイバーの兄弟ファイバー」をセット
      // 初回の実行はここにヒットしないため一旦スキップして、次のprevSibling = newFiberを見てから分かりやすい
      prevSibling.sibling = newFiber;
    }
    // インデックスの増加につれて次のファイバーにいくため、
    // 新しく作られたファイバーが、兄弟ファイバーのチェインでみると一個前のファイバーとなる
    prevSibling = newFiber;
    index++;
  }

  // step 3: 次に実行するタスクを決める
  // 子ファイバーがある場合は、子ファイバーが対象となる
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    // 子ファイバーがない場合は、まず兄弟ファイバーを探す
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 兄弟ファイバーもない場合は、親ファイバーへ戻る（それで親ファイバーの兄弟ファイバーをまた探す）
    nextFiber = nextFiber.parent;
  }
}
