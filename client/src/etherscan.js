import axios, { AxiosInstance, AxiosResponse } from 'axios';


const ETH_API_URL1  = 'https://api-kovan.etherscan.io/api?module=account&action=tokentx&address=' + 
                '0xbf9cEc2ae1F566e7f39ef7476a7541361f2b9df9' + '&startblock=0&endblock=999999999&sort=asc&apikey=ASFQIXUSZJRKFICTNWYVX8G7TI11WZ9FDD';

const ETH_REQUEST_HEADERS = {
    //'User-Agent': 'chrome'
};

export function resolveAfter2Seconds(x) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(x);
      }, 2000);
    });
}

export function getEtherscanData(userContractAddr) {

    return new Promise(resolve => {   
    
        var ETH_API_URL  = 'https://api-kovan.etherscan.io/api?module=account&action=tokentx&address=' + 
            userContractAddr + '&startblock=0&endblock=999999999&sort=asc&apikey=ASFQIXUSZJRKFICTNWYVX8G7TI11WZ9FDD';

        axios.get(`${ETH_API_URL}`, { headers: ETH_REQUEST_HEADERS })
        .then(response => {
                //console.log(response.data);
                var obj = response.data; //JSON.parse(response.data);
                //console.log(obj['result']);
                var jsonArr = [];
                obj['result'].map(items =>
                {
                    //console.log(items.to);
                    if(items.to.toLowerCase() === userContractAddr.toLowerCase() && items.tokenSymbol.toLowerCase() === 'adai') {
                        //console.log('Deposit:' + items.value/1000000000000000000);
                        jsonArr.push({
                            type: 'Deposit',
                            timeStamp: items.timeStamp,
                            amt: items.value/1000000000000000000
                        });
                    }else if (items.from.toLowerCase() === userContractAddr.toLowerCase() && items.tokenSymbol.toLowerCase() === 'adai') {
                        //console.log('Withdraw:' + items.value/1000000000000000000);
                        jsonArr.push({
                            type: 'Withdraw',
                            timeStamp: items.timeStamp,
                            amt: items.value/1000000000000000000
                        });
                    }    
                })
                resolve(jsonArr);
        })
        .catch(error => console.error('parsing etherscan data error', error))
    })
}

