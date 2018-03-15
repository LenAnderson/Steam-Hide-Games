// ==UserScript==
// @name         Steam - Hide Games
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Steam-Hide-Games/raw/master/steam_hide_games.user.js
// @version      0.6.0
// @description  Hides games on Steam search
// @author       ZeDoCaixao
// @author       LenAnderson
// @match        http://store.steampowered.com/search/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    let ids = GM_getValue("steamhidden") || [];

    let init = () => {
        ids.forEach(id => {
            Array.from(document.querySelectorAll('a[data-ds-appid="'+id+'"]')).forEach(it=>it.remove());
        });
        Array.from(document.querySelectorAll('.search_result_row')).forEach(el => {
            if (el.getAttribute('data-steamhidden')) return;
            el.setAttribute('data-steamhidden', '1');
            let id = el.getAttribute('data-ds-appid');
            let p = el.querySelector('.responsive_search_name_combined > div > p');
            let span = document.createElement('span'); {
                p.insertBefore(span, p.children[0]);
                span.style.marginTop = '-1em';
                span.style.verticalAlign = 'super';
                span.style.fontSize = 'smaller';
                let a = document.createElement('a'); {
                    span.appendChild(a);
                    a.textContent = '[hide]';
                    a.href = 'javascript:;';
                    a.addEventListener('click', () => {
                        ids.push(id);
                        GM_setValue('steamhidden', ids);
                        el.remove();
                    });
                }
            }
        });
    };

    let getting = false;
    let getNext = () => {
        if (!getting && document.querySelector('#search_result_container').getBoundingClientRect().bottom <= innerHeight) {
            let btn = document.querySelector('.pagebtn:last-child');
            if (btn) {
                getting = true;
                let pagination = document.querySelector('#search_result_container > .search_pagination');
                let spinner = document.createElement('div'); {
                    pagination.insertBefore(spinner, pagination.children[0]);
                    spinner.textContent = '... loading ...';
                    spinner.style.textAlign = 'center';
                }
                let xhr = new XMLHttpRequest();
                xhr.open('GET', btn.href, true);
                xhr.addEventListener('load', ()=>{
                    let html = document.createElement('div');
                    html.innerHTML = xhr.responseText;
                    let list = document.querySelector('#search_result_container > div + div');
                    Array.from(html.querySelectorAll('#search_result_container > div + div > a[data-ds-appid]')).forEach(a=>{
                        list.appendChild(a);
                    });
                    pagination.remove();
                    document.querySelector('#search_result_container').appendChild(html.querySelector('#search_result_container > .search_pagination'));
                    getting = false;
                    getNext();
                });
                xhr.send();
            }
        }
    };
    init();

    var mo = new MutationObserver(function(muts) {
        init();
    });
    mo.observe(document.body, {childList: true, subtree: true});


    addEventListener('scroll', getNext);
    addEventListener('resize', getNext);
})();
