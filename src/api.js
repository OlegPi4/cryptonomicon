
// запрос цен тиккеров 
export const loadTickers = tickers => 
   fetch(
   `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(",")}&tsyms=USD&extraParams=Pi4`)
   .then(r => r.json())
   .then(rawData => 
      Object.fromEntries(
         Object.entries(rawData).map(([key, value]) => [key, value.USD])
      ));
   