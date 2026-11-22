document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const result = document.getElementById('form-result');
  if (!form || !result) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    result.textContent = '';
    result.classList.remove('error');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      result.textContent = 'お問い合わせを受け付けました。ご連絡をお待ちください。';
    } catch {
      result.classList.add('error');
      result.textContent = '送信できませんでした。時間をおいて再度お試しいただくか、メールでお問い合わせください。';
    } finally {
      button.disabled = false;
    }
  });
});
