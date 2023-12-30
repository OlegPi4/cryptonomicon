
// запрос цен тиккеров 
export const loadTickers = tickers => 
   fetch(
   `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickers.join(",")}&tsyms=USD&extraParams=Pi4`)
   .then(r => r.json())
   .then(rawData => 
      Object.fromEntries(
         Object.entries(rawData).map(([key, value]) => [key, value.USD])
      ));
   
//загрузка базы криптовалют для выведения подсказки под добавлением тиккера 
// export const  loadCoins = async  function() { 
//     try {
//         const res = await fetch(
//          `https://min-api.cryptocompare.com/data/all/coinlist?summary=true`);
//          const data =   await res.json();  
//          const coins = Object.keys(data.Data);
//          return coins
//       } catch(e) {
//         alert('Ошибка получения данных')
//       }
//    }    

export const  loadCoins =  () => { 
      let r = fetch(`https://min-api.cryptocompare.com/data/all/coinlist?ummary=true`)
       .then(r =>  r.json())  
       .then(r => Object.keys(r.Data));
       return r
            
}
