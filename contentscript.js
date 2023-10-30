/* Copyright 2023 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License. */

/**
 * Selection state of button elements
 */
 const SELECTION = {
  selector: false,
  container: false,
  scribble: false,
  scribbleOn: false,
  autoclick: false
}

/**
* Simulate a mouseclick with multiple events.
* @param {HTMLButtonElement} targetNode
* @returns
*/
const simulateMouseClick = (targetNode) => {
  try {
      function triggerMouseEvent(targetNode, eventType) {
          var clickEvent = document.createEvent('MouseEvents');
          clickEvent.initEvent(eventType, true, true);
          targetNode.dispatchEvent(clickEvent);
      }
      if (!targetNode) return
      SELECTION.autoclick = true
      SELECTION.selector = targetNode.id == 'selectorSelected'
      SELECTION.scribble = targetNode.id == 'scribbleButton'
      const eventTypes = ["mouseover", "mousedown", "mouseup", "click"]
      eventTypes.forEach(function (eventType) {
          triggerMouseEvent(targetNode, eventType);
      });
      SELECTION.autoclick = false
  } catch (e) { console.log('click error', e) }
}

/**
* Wait for Dom to load and initiate listeners and obnservers.
*/
document.addEventListener("DOMContentLoaded", async () => {
  const scribbleButton = document.querySelector('#scribbleButton')
  scribbleButton.addEventListener('mousedown', autoScribbleToggle)

  // detectLongPress(scribbleButton, autoScribbleOn, 2000)

  document.addEventListener('mousedown', (event) => {
      const container = document.querySelector('#workspace-container')
      const scribbleContainer = document.querySelector('#scribbleButton')
      const scribbleButtonClicked = event && event.target && scribbleContainer.contains(event.target)
      SELECTION.container = container.contains(event.target)
      if (!SELECTION.container && !SELECTION.autoclick && !scribbleButtonClicked) {
          autoScribbleOff()
      }
  })

  const selectorcallback = (mutations) => {
      mutations.forEach(async (mutation) => {
          if (mutation.attributeName == 'class') {
              SELECTION.selector = mutation.target.classList.contains('goog-toolbar-button-checked')
              const scribbleButton = document.querySelector('#scribbleButton')
              if (SELECTION.selector && SELECTION.scribbleOn) {
                  simulateMouseClick(scribbleButton)
                  scribbleButton.classList.add('goog-toolbar-button-checked')
                  SELECTION.container = true
              }
          }
      })
  }

  const selectButton = document.querySelector('#selectButton')
  selectButton.addEventListener('click', () => {
      if (SELECTION.selector && !SELECTION.autoclick) {
          autoScribbleOff()
      }
  })
  const selectorobserver = new MutationObserver(selectorcallback);
  selectorobserver.observe(selectButton, { attributes: true });

  document.querySelector('#lineMenuButton')
      .addEventListener('click', setSelectionListener)

});

/**
* Sets the autoscribble to on/off.
*/
function autoScribbleToggle() {
  if (SELECTION.scribbleOn && !SELECTION.autoclick) {
      const scribbleButton = document.querySelector('#scribbleButton')
      SELECTION.scribbleOn = false
      scribbleButton.classList.remove('goog-toolbar-button-checked')
  }
  else if (!SELECTION.scribbleOn && !SELECTION.autoclick) {
      const scribbleButton = document.querySelector('#scribbleButton')
      SELECTION.scribbleOn = true
      scribbleButton.classList.add('goog-toolbar-button-checked')
  }
}

/**
* Sets the autoscribble to off.
*/
function autoScribbleOff() {
  const scribbleButton = document.querySelector('#scribbleButton')
  SELECTION.scribbleOn = false
  scribbleButton.classList.remove('goog-toolbar-button-checked')
}

/**
* Sets the autoscribble to on.
*/
function autoScribbleOn() {
  const scribbleButton = document.querySelector('#scribbleButton')
  SELECTION.scribbleOn = true
  scribbleButton.classList.add('goog-toolbar-button-checked')
}

/**
* Detect a Long press on an element and initiate action.
* @param {HTMLElement} element
* @param {Function} action
* @param {Number} time
* @returns {Boolean}
*/
function detectLongPress(element, action, time = 3000) {
  let pressTimer;
  element.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
      return false
  })
  element.addEventListener('mousedown', () => {
      pressTimer = window.setTimeout(function () {
          action()
      }, time);
      return false
  })
}

/**
* Set a listener for the Drawing Tool selection.
*/
function setSelectionListener() {
  const scribbleItem = document.querySelector('[role="menuitem"] .sketchy-icon-scribble')
  const allMenuItems = scribbleItem.parentNode.parentNode.parentNode.parentNode.childNodes
  allMenuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const select = e.target.parentNode.getElementsByClassName('sketchy-icon-scribble')[0]
        SELECTION.scribble = e.target.textContent.toLowerCase().includes('scribble') || !!select;
          if (SELECTION.scribble) {
            autoScribbleToggle();
          }
      })
  })
  document.querySelector('#lineMenuButton')
    .removeEventListener('click', setSelectionListener);
}
