const platforms = {
  facebook: renderFacebook,
  x: renderX,
  linkedin: renderLinkedIn,
  telegram: renderTelegram,
  discord: renderDiscord
};

document.addEventListener('DOMContentLoaded', () => {
  fetchMeta().then(meta => {
    setupTabs(meta);
    showPreview('facebook', meta);
  });
});

function fetchMeta() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            const metas = Array.from(document.getElementsByTagName('meta'));
            return metas.reduce((acc, m) => {
              const prop = m.getAttribute('property') || m.getAttribute('name');
              if (prop && prop.startsWith('og:')) {
                acc[prop] = m.getAttribute('content');
              }
              return acc;
            }, {});
          }
        },
        results => resolve(results[0].result)
      );
    });
  });
}

function setupTabs(meta) {
  document.querySelectorAll('#tabs button').forEach(btn => {
    btn.addEventListener('click', ()=>{
      document.querySelector('#tabs .active').classList.remove('active');
      btn.classList.add('active');
      showPreview(btn.dataset.platform, meta);
    });
  });
}

function showPreview(platform, meta) {
  const container = document.getElementById('preview');
  container.innerHTML = '';
  const renderFn = platforms[platform];
  if (renderFn) container.appendChild(renderFn(meta));
}

// Примеры простых построителей превью:
function renderFacebook(meta) {
  const card = document.createElement('div'); card.className='preview-card fb-card';
  if(meta['og:image']) card.appendChild(Object.assign(document.createElement('img'),{src:meta['og:image']}));
  const body = document.createElement('div'); body.className='content';
  body.innerHTML = `<strong>${meta['og:title']||''}</strong><p>${meta['og:description']||''}</p><a href='${meta['og:url']||'#'}'>${meta['og:url']||''}</a>`;
  card.appendChild(body);
  return card;
}
function renderX(meta) {
  const card = document.createElement('div'); card.className='preview-card x-card';
  const header = document.createElement('div'); header.className='header';
  header.innerHTML = `<img src='${meta['og:image']||''}'/><span>${meta['og:title']||''}</span>`;
  card.appendChild(header);
  if(meta['og:description']){
    const body = document.createElement('div'); body.className='body';
    body.innerHTML=`<p>${meta['og:description']}</p>`;
    if(meta['og:image']) body.appendChild(Object.assign(document.createElement('img'),{src:meta['og:image']}));
    card.appendChild(body);
  }
  return card;
}
function renderLinkedIn(meta) {
  const card = document.createElement('div'); card.className='preview-card li-card';
  if(meta['og:image']) card.appendChild(Object.assign(document.createElement('img'),{src:meta['og:image']}));
  const txt = document.createElement('div'); txt.className='text';
  txt.innerHTML=`<strong>${meta['og:title']||''}</strong><p>${meta['og:description']||''}</p><small>${meta['og:url']||''}</small>`;
  card.appendChild(txt);
  return card;
}
function renderTelegram(meta) {
  const card = document.createElement('div'); card.className='preview-card tg-card';
  card.innerHTML=`<a href='${meta['og:url']||'#'}'><strong>${meta['og:title']||''}</strong></a><p>${meta['og:description']||''}</p>`;
  return card;
}
function renderDiscord(meta) {
  const card = document.createElement('div'); card.className='preview-card dc-card';
  card.innerHTML=`<strong>${meta['og:title']||''}</strong><p>${meta['og:description']||''}</p><a href='${meta['og:url']||'#'}'>${meta['og:url']||''}</a>`;
  return card;
}
