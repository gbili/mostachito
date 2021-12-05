const siteTitle = "Hello";
const secondsBeforeAutoRefresh = "234";
const statusInfo = {
  statusName: "my status",
  friendlyFullSentence: "asdfasdf",
  dateLastChecked: '08/10/1987',
  checkIntervalInMinutes: '1',
  checksSpreeCount: "899",
  aliveForYMDHMS: "1234",
  errors: [
    { message: 'error 0'},
    { message: 'error 1'}
  ]
};
export const mockViewDataWithErros = {
  siteTitle,
  secondsBeforeAutoRefresh,
  statusInfo,
}
export const mockViewDataWithEmptyErros = {
  siteTitle,
  secondsBeforeAutoRefresh,
  statusInfo: {
    ...statusInfo,
    errors: []
  },
}

export const hydrationOutputGen = (data: typeof mockViewDataWithErros | typeof mockViewDataWithEmptyErros) => {
  const { siteTitle, secondsBeforeAutoRefresh, statusInfo } = data;

  const errorsHydrated = statusInfo.errors.length > 0
    ? `
              <tr>
                <td>Error message :</td>
                <td>${statusInfo.errors[0].message}</td>
              </tr>
              <tr>
                <td>Error message :</td>
                <td>${statusInfo.errors[1].message}</td>
              </tr>
`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${siteTitle}</title>
    <meta name="description" content="Server status check">
    <meta name="author" content="Guillermo Pages">
    <meta name="company" content="Meow LLC">
    <link rel="stylesheet" href="css/styles.css?v=1.0">
    <meta http-equiv="refresh" content="${secondsBeforeAutoRefresh}" >
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
  </head>

  <body>
    <div id="main-container">
      <header>
        <h1>${siteTitle}</h1>
      </header>
      <div id="content">
        <p class="status-${statusInfo.statusName}"></p>
        <p>${statusInfo.friendlyFullSentence}</p>
        <table>
          <thead>
            <tr>
              <th colspan="2">Stats</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Current status</td>
              <td class="status-${statusInfo.statusName}">${statusInfo.statusName}</td>
            </tr>
            <tr>
              <td>Last check date</td>
              <td>${statusInfo.dateLastChecked}</td>
            </tr>
            <tr>
              <td>Checking every</td>
              <td>${statusInfo.checkIntervalInMinutes} min.</td>
            </tr>
            <tr>
              <td>Times checked</td>
              <td>${statusInfo.checksSpreeCount}</td>
            </tr>
            <tr>
              <td>Bot alive for</td>
              <td>${statusInfo.aliveForYMDHMS}</td>
            </tr>
            ${errorsHydrated}
          </tbody>
        </table>
      </div>
    </div>
  </body>
</html>
`;
}

export const iterableMatchedTemplate = `
            {{statusInfo.errors as error
              <tr>
                <td>Error message :</td>
                <td>{{ error.message }}</td>
              </tr>
            statusInfo.errors}}
`;

export const missingPrefixClosingTagIterableMatchedTemplate = `
            {{statusInfo.errors as error
              <tr>
                <td>Error message :</td>
                <td>{{ error.message }}</td>
              </tr>
            errors}}
`;