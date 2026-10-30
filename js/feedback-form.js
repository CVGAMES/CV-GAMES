(function () {
  'use strict';

  const form = document.querySelector('[data-feedback-form]');
  if (!form) return;

  const status = form.querySelector('[data-feedback-status]');
  const copyButton = form.querySelector('[data-copy-feedback]');
  const recipient = 'cvgames.ofc@gmail.com';

  function makeMessage() {
    const values = new FormData(form);
    const browser = String(values.get('browser') || '').trim();
    const lines = [
      'Feedback para o CV GAMES',
      '',
      `Jogo ou área: ${values.get('game')}`,
      `Tipo: ${values.get('type')}`,
      `Aparelho: ${values.get('device')}`,
      `Navegador: ${browser || 'Não informado'}`,
      `Página: ${window.location.origin}${window.location.pathname}`,
      '',
      'Mensagem:',
      String(values.get('message') || '').trim()
    ];

    return lines.join('\n');
  }

  function prepareFeedback() {
    if (!form.reportValidity()) return false;
    const values = new FormData(form);
    const subject = `[CV GAMES] Feedback — ${values.get('game')}`;
    const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(makeMessage())}`;
    const composeTab = window.open(gmailCompose, '_blank');
    if (composeTab) {
      composeTab.opener = null;
      if (status) status.textContent = 'Abri um rascunho no Gmail em outra aba. Revise a mensagem e clique em Enviar.';
    } else {
      window.location.assign(gmailCompose);
      if (status) status.textContent = 'Abrindo o rascunho no Gmail. Revise a mensagem e clique em Enviar.';
    }
    return true;
  }

  async function copyFeedback() {
    if (!form.reportValidity()) return;
    const message = makeMessage();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
      } else {
        const temporaryField = document.createElement('textarea');
        temporaryField.value = message;
        temporaryField.setAttribute('readonly', '');
        temporaryField.style.position = 'fixed';
        temporaryField.style.opacity = '0';
        document.body.append(temporaryField);
        temporaryField.select();
        const copied = document.execCommand('copy');
        temporaryField.remove();
        if (!copied) throw new Error('Cópia indisponível');
      }
      if (status) status.textContent = 'Mensagem copiada. Cole-a em um e-mail para cvgames.ofc@gmail.com e envie.';
    } catch {
      if (status) status.textContent = 'Não consegui copiar automaticamente. Tente preparar o e-mail ou copie o texto manualmente.';
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    prepareFeedback();
  });
  copyButton?.addEventListener('click', copyFeedback);
}());
