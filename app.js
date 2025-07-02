// モーダル要素取得
const modal   = document.getElementById('modal');
const mPhoto  = document.getElementById('m-photo');
const mName   = document.getElementById('m-name');
const mRole   = document.getElementById('m-role');
const mBio    = document.getElementById('m-bio');
const btnClose= document.getElementById('m-close');

// すべての.member にクリックリスナ
document.querySelectorAll('.member').forEach(card=>{
  card.addEventListener('click',()=>{
    // data-* 属性から情報を取得して挿入
    mPhoto.src   = card.querySelector('img').src;
    mPhoto.alt   = card.dataset.name + ' の写真';
    mName.textContent = card.dataset.name;
    mRole.textContent = card.dataset.role;
    mBio.textContent  = card.dataset.bio;
    modal.classList.remove('hidden');
  });
});

// 閉じる操作（ボタン・背景クリック・ESCキー）
btnClose.addEventListener('click', ()=> modal.classList.add('hidden'));
modal.addEventListener('click',  e=>{
  if(e.target===modal) modal.classList.add('hidden');
});
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') modal.classList.add('hidden');
});


// ナビゲーションメニュー
document.addEventListener('DOMContentLoaded', () => {
  const nav    = document.querySelector('.main-nav');
  const closeB = document.querySelector('.menu-close');

  if (!nav || !closeB) {
    console.warn('要素が見つかりません');   // class 名ずれ検知用
    return;
  }

  // 黒い四角をクリック → open
  nav.addEventListener('click', () => nav.classList.add('open'));

  // ✕ クリック → close
  closeB.addEventListener('click', e => {
    e.stopPropagation();
    nav.classList.remove('open');
  });

  // メニュー内リンクを押したら閉じる
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open'))
  );
});

// const nav    = document.querySelector('.main-nav');
// const closeB = document.querySelector('.menu-close');

// nav.addEventListener('click', () => nav.classList.add('open'));
// closeB.addEventListener('click', e => {
//   e.stopPropagation();               // ボタン自体のバブリングを止める
//   nav.classList.remove('open');
// });

// /* パネル内リンクをクリックしたら閉じたい場合は↓を追加 */

// nav.querySelectorAll('a').forEach(a =>
//   a.addEventListener('click', () => nav.classList.remove('open'))
// );