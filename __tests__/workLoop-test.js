/**
 * @flow
 */

import {
  createElement,
  render,
  createDom,
  performUnitOfWork,
  workLoop,
} from '../src';
import { JSDOM } from 'jsdom';

describe('workLoop', () => {
  function requestIdleCallback(callback) {
    // callbackを引数として追加
    // callback({ timeRemaining: () => 1 });
    expect(callback).not.toBe(null);
  }

  test('requestIdleCallback mock', () => {
    global.requestIdleCallback = requestIdleCallback;
    workLoop(null);
    // expect(requestIdleCallback).toHaveBeenCalledTimes(1);
  });
});

// test('requestIdleCallback mock', () => {
//   workLoop();

//   expect(requestIdleCallback).toHaveBeenCalledTimes(1);
// });
