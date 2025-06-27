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
