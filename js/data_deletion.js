(function () {
  'use strict';

  var idElement = document.getElementById('anon-id');
  var copyButton = document.getElementById('copy-id');
  var emailLink = document.getElementById('email-request');
  var statusElement = document.getElementById('copy-status');
  var anonId = '';

  try {
    anonId = localStorage.getItem('orbita_anon_id') || '';
  } catch (error) {
    anonId = '';
  }

  if (anonId) {
    idElement.textContent = anonId;
    copyButton.disabled = false;
  } else {
    idElement.textContent = 'ID não encontrado neste navegador / ID not found in this browser';
  }

  var subject = 'Exclusão de dados - Last Orbit';
  var body = [
    'Solicito a exclusão dos dados de telemetria associados ao Last Orbit.',
    '',
    'anon_id: ' + (anonId || '[não encontrado / not found]'),
    '',
    'Confirmo que desejo excluir os eventos vinculados a esse identificador.'
  ].join('\n');
  emailLink.href = 'mailto:lastorbit.contato@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

  copyButton.addEventListener('click', function () {
    if (!anonId) return;

    navigator.clipboard.writeText(anonId).then(function () {
      statusElement.textContent = 'ID copiado / ID copied';
    }).catch(function () {
      statusElement.textContent = 'Selecione e copie o ID acima / Select and copy the ID above';
    });
  });
})();
