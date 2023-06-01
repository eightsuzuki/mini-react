// 次に実行するタスク・レンダリングをnullに初期化
let nextUnitOfWork = null

// ここでワークループの関数を作り、requestIdleCallbackに渡す
function workLoop(deadline) {
  // shouldYieldがflaseかつ待機中のタスクがあれば、レンダリング処理が始まる
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    // 一つの処理ユニットが終われば、次に必要な処理をリターンする
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    // もうすぐにアイドリングが終わる目印
    // IdleDeadlineのこと: https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline
    shouldYield = deadline.timeRemaining() < 1
  }
  // スレッドをブロックしないために、次のアイドリング期間を待つ
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}