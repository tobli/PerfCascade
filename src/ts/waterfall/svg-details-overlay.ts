
import svg from "../helpers/svg"
import dom from "../helpers/dom"
import TimeBlock from "../typing/time-block"
import {getKeys} from "./extract-details-keys"


function createCloseButtonSvg(y: number): SVGGElement {
  let closeBtn = svg.newEl("a", {
    "class": "info-overlay-close-btn"
  }) as SVGGElement

  closeBtn.appendChild(svg.newEl("rect", {
    "width": 25,
    "height": 25,
    "x": "100%",
    "y": y,
    "rx": 5,
    "ry": 5
  }))

  closeBtn.appendChild(svg.newEl("text", {
    "width": 25,
    "height": 25,
    "x": "100%",
    "y": y,
    "dx": 9,
    "dy": 17,
    "fill": "#111",
    "text": "X",
    "textAnchor": "middle"
  }))

  closeBtn.appendChild(svg.newEl("title", {
    "text": "Close Overlay"
  }))

  return closeBtn
}


function createHolder(y: number): SVGGElement {
  let holder = svg.newEl("g", {
    "class": "info-overlay-holder"
  }) as SVGGElement

  let bg = svg.newEl("rect", {
    "width": "100%",
    "height": 350,
    "x": "0",
    "y": y,
    "rx": 2,
    "ry": 2,
    "class": "info-overlay"
  })

  holder.appendChild(bg)
  return holder
}



function makeDefinitionList(dlKeyValues) {
  return Object.keys(dlKeyValues)
    .filter(key => (dlKeyValues[key] !== undefined && dlKeyValues[key] !== -1 && dlKeyValues[key] !== 0 && dlKeyValues[key] !== ""))
    .map(key => `
      <dt>${key}</dt>
      <dd>${dlKeyValues[key]}</dd>
    `).join("")
}

function makeTab(innerHtml: string, renderDl: boolean = true) {
  if (innerHtml.trim() === "") {
    return ""
  }
  let inner = renderDl ? `<dl>${innerHtml}</dl>` : innerHtml
  return `<div class="tab">
    ${inner}
  </div>`
}

function makeTabBtn(name: string, tab: string) {
  return !!tab ? `<li><button class="tab-button">${name}</button></li>` : ""
}

function createBody(requestID: number, block: TimeBlock) {
  let body = document.createElement("body");
  body.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  const tabsData = getKeys(requestID, block)
  const generalTab = makeTab(makeDefinitionList(tabsData.general))
  const timingsTab = makeTab(makeDefinitionList(tabsData.timings))
  const requestDl = makeDefinitionList(tabsData.request)
  const requestHeadersDl = makeDefinitionList(block.rawResource.request.headers.reduce((pre, curr) => {
    pre[curr.name] = curr.value
    return pre
  }, {}))
  const responseDl = makeDefinitionList(tabsData.response)
  const responseHeadersDl = makeDefinitionList(block.rawResource.response.headers.reduce((pre, curr) => {
    pre[curr.name] = curr.value
    return pre
  }, {}))
  const isImg = block.requestType === "image"
  const imgTab = isImg ? makeTab(`<img class="preview" data-src="${block.rawResource.request.url}" />`, false) : ""

  body.innerHTML = `
    <div class="wrapper">
      <h3>#${requestID} ${block.name}</h3>
      <nav class="tab-nav">
      <ul>
        ${makeTabBtn("Preview", imgTab)}
        ${makeTabBtn("General", generalTab)}
        <li><button class="tab-button">Request</button></li>
        <li><button class="tab-button">Response</button></li>
        ${makeTabBtn("Timings", timingsTab)}
        <li><button class="tab-button">Raw Data</button></li>
      </ul>
      </nav>
      ${imgTab}
      ${generalTab}
      <div class="tab">
        <dl>
          ${requestDl}
        </dl>
        <h2>All Request Headers</h2>
        <dl>
          ${requestHeadersDl}
        </dl>
      </div>
      <div class="tab">
        <dl>
          ${responseDl}
        </dl>
        <h2>All Response Headers</h2>
        <dl>
          ${responseHeadersDl}
        </dl>
      </div>
      ${timingsTab}
      <div class="tab">
        <code>
          <pre>${JSON.stringify(block.rawResource, null, 2)}</pre>
        </code>
      </div>
    </div>
    `
  return body
}

export function createRowInfoOverlay(indexBackup: number, barX: number,   y: number, block: TimeBlock,
  onClose: Function, unit: number): SVGGElement {
  const requestID =  parseInt(block.rawResource._index, 10) || indexBackup
  let holder = createHolder(y)

  let html = svg.newEl("foreignObject", {
    "width": "100%",
    "height": 250,
    "x": "0",
    "y": y,
    "dy": "5",
    "dx": "5"
  }) as SVGForeignObjectElement


  let closeBtn = createCloseButtonSvg(y)
  closeBtn.addEventListener("click", evt => onClose(holder))

  let body = createBody(requestID, block)
  let buttons = body.getElementsByClassName("tab-button") as NodeListOf<HTMLButtonElement>
  let tabs = body.getElementsByClassName("tab") as NodeListOf<HTMLDivElement>

  let setTabStatus = (index) => {
    dom.forEach(tabs, (tab: HTMLDivElement, j) => {
      tab.style.display = (index === j) ? "block" : "none"
      buttons.item(j).classList.toggle("active", (index === j))
    })
  }

  dom.forEach(buttons, (btn, i) => {
    btn.addEventListener("click", () => { setTabStatus(i) })
  })

  setTabStatus(0)

  html.appendChild(body)
  holder.appendChild(html)
  holder.appendChild(closeBtn)


  return holder
}
