export function initZipCode() {
  const cepInput = document.getElementById('zip_code');
  if (cepInput) {
    cepInput.addEventListener('blur', function () {
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        fetchAddressData(cep, 'street', 'neighborhood', 'edit-number');
      }
    });
  }

  const addressZipInput = document.getElementById('address-zip');
  if (addressZipInput) {
    addressZipInput.addEventListener('blur', function () {
      const cep = this.value.replace(/\D/g, '');
      if (cep.length === 8) {
        fetchAddressData(
          cep,
          'address-street',
          'address-neighborhood',
          'address-number'
        );
      }
    });
  }
}

function fetchAddressData(
  cep,
  streetFieldId,
  neighborhoodFieldId,
  numberFieldId
) {
  fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`)
    .then((res) => {
      if (!res.ok) throw new Error('CEP inválido');
      return res.json();
    })
    .then((data) => {
      const streetEl = document.getElementById(streetFieldId);
      const neighborhoodEl = document.getElementById(neighborhoodFieldId);
      const numberEl = document.getElementById(numberFieldId);

      if (streetEl) streetEl.value = data.street || '';
      if (neighborhoodEl) neighborhoodEl.value = data.neighborhood || '';

      if (numberEl) numberEl.focus();
    })
    .catch((err) => console.error('Erro na consulta:', err));
}
