document.addEventListener('DOMContentLoaded', () => {
  // ── ナビ開閉 JS は省略 ──

  // ★ Ajax 送信用コード ★
  const form   = document.getElementById('contact-form');
  const result = document.getElementById('form-result');

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();                               // 既定の遷移を阻止
      const data = new FormData(form);

      try {
        const r = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' }});
        if (r.ok) {
          form.reset();                                 // フォームをクリア
          result.classList.remove('hidden');            // 完了メッセージ表示
        } else {
          alert('送信に失敗しました。時間をおいて再度お試しください');
        }
      } catch (err) {
        console.error(err);
        alert('ネットワークエラーが発生しました');
      }
    });
  }
});