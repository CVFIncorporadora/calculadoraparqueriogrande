const NUMERO_COMERCIAL = '5554991119831';

function formatarTelefone(valor) {
  const nums = (valor || '').replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10) {
    return nums
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return nums
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function initWhatsappFab() {
  const btn = document.getElementById('btnWhatsapp');
  const dialog = document.getElementById('dialogWhatsapp');
  const form = document.getElementById('formWhatsapp');
  const btnCancelar = document.getElementById('btnCancelarWhatsapp');
  const inputNome = document.getElementById('inputNomeWhats');
  const inputTelefone = document.getElementById('inputTelefoneWhats');
  const erroTelefone = document.getElementById('erroTelefoneWhats');

  inputTelefone.addEventListener('input', (e) => {
    e.target.value = formatarTelefone(e.target.value);
  });

  btn.addEventListener('click', () => {
    form.reset();
    erroTelefone.textContent = '';
    dialog.showModal();
  });

  btnCancelar.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (e) => {
    const rect = dialog.getBoundingClientRect();
    const dentro = e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!dentro) dialog.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = inputNome.value.trim();
    const telefoneDigits = inputTelefone.value.replace(/\D/g, '');

    if (telefoneDigits.length < 10) {
      erroTelefone.textContent = 'Telefone inválido';
      return;
    }
    erroTelefone.textContent = '';

    const nomeLote = document.getElementById('nomeLote')?.textContent || '---';
    const areaLote = document.getElementById('areaLote')?.textContent || '---';
    const valorLote = document.getElementById('valorLote')?.textContent || '---';

    let mensagem = `Olá! Meu nome é ${nome} e meu telefone é ${inputTelefone.value}. Tenho interesse no Parque Rio Grande.`;
    if (nomeLote !== '---') {
      mensagem += `\n\nLote: ${nomeLote}\nÁrea: ${areaLote}\nValor: ${valorLote}`;
    }

    const url = `https://wa.me/${NUMERO_COMERCIAL}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    dialog.close();
  });
}
