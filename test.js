const txServer = 'https://tx-nordics.fhir.org/fhir/r4'; // The Nordic server
// const txServer = 'https://tx.fhir.org/r4'; // The global server

const snomedEditions = {
  dk: {
    module: '554471000005108',
    version: '20250930',
  },
  no: {
    module: '51000202101',
    version: '20251215',
  },
  sv: {
    module: '45991000052106',
    version: '20251130',
  },
};

const codes = [
  '73211009', // Diabetes mellitus
  '860604008', // Allery to apple
  '59282003', // Pulmonary embolism
];

async function translate(code, language) {
  const params = new URLSearchParams();
  params.append('system', 'http://snomed.info/sct');
  params.append('version', `http://snomed.info/sct/${
    snomedEditions[language].module
  }/version/${
    snomedEditions[language].version
  }`);
  params.append('code', code);
  return fetch(`${txServer}/CodeSystem/$lookup?${params}`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json());
}

codes.reduce((p1, code) => p1
  .then(() => Object.keys(snomedEditions).reduce((p2, language) => p2
    .then(async () => {
      try {
        const result = await translate(code, language);
        const { parameter } = result;
        const languageDesignation = parameter?.find(
          p => p.name === 'designation' &&
          p.part?.some(part => part.name === 'language' && part.valueCode === language)
        )?.part.find(part => part.name === 'value')?.valueString || 'N/A';
        console.log(`${code} (${language}): ${languageDesignation}`);
      } catch (error) {
        console.error(error);
      }
    }), p1)), Promise.resolve());
