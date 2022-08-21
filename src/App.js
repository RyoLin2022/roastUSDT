import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers';

export let savedAcc;
let currentAccount = null;
let LPContract = null;
function App() {
  let LPDecimals = 18;
  let contractAddress = "0x48CF5A5d385f0f801B95C29a0406125801b9b00F";
  switchEthereumChain();

  async function switchEthereumChain() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7D0' }],
      });
    } catch (e) {
      if (e.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7D0',
                chainName: 'DogeChain',
                nativeCurrency: {
                  name: 'WDoge',
                  symbol: 'WDoge', // 2-6 characters long
                  decimals: 18
                },
                blockExplorerUrls: ['https://explorer.dogechain.dog/'],
                rpcUrls: ['https://rpc03-sg.dogechain.dog'],
              },
            ],
          });
        } catch (addError) {
          alert("Please change the chain to DogeChain");
          console.error(addError);
        }
      }
    }
  }

  const [walletAddress, setWalletAddress] = useState("");

  async function requestAccount() {
    console.log('Requesting account...');
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      currentAccount = accounts[0];
      savedAcc = accounts[0];
    } catch (error) {
      console.log('error connecting');
    }

    //Check if Metamask Exist
    if (window.ethereum) {
      console.log('detected');
    } else {
      console.log('not detected');
      alert("Please Install Metamask");
    }
  }

  async function getBalance() {
    let accBalance = await window.ethereum.request({
      method: "eth_getBalance",
      params:
        [currentAccount, 'latest']
    });
    var rounded;
    var balanceDEC = Number(accBalance).toString(10);
    var balanceBtn = document.getElementById("balance-btn");
    if (balanceDEC < Math.pow(10, 21)) {
      var inWeiBal = balanceDEC.length;
      console.log(balanceDEC);
      var str = Math.pow(10, (inWeiBal - 18 - 5));
      rounded = Math.round(str * parseInt(balanceDEC.substring(0, 5)) * 10000) / 10000;
    } else {
      if (balanceDEC.includes("."));
      let balLength1 = balanceDEC.length;
      let realbalLength = balanceDEC.substring(balLength1 - 2, balLength1);
      rounded = balanceDEC.substring(0, 1) + balanceDEC.substring(2, realbalLength - 18 + 2);
    }
    balanceBtn.innerText = rounded + " WDoge";
  }

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      var btnConnect = document.getElementById("connect-btn");
      document.getElementById("balance-btn").hidden = false;

      let lengthAcc = currentAccount.length;
      btnConnect.innerText = currentAccount.substring(0, 4) + "..." + currentAccount.substring(lengthAcc - 4, lengthAcc);
      getBalance();
      alert("Wallet connected successfully!");
    } else {
      alert("Please install an injected Web3 wallet");
    }
  }

  async function ACCAllowance() {
    let inputdata = "0xdd62ed3e"
      + "000000000000000000000000" + currentAccount.substring(2, currentAccount.length)
      + "000000000000000000000000" + contractAddress.substring(2, contractAddress.length);
    let accAllowance = await window.ethereum.request({
      method: "eth_call",
      params: [{
        to: LPContract,
        data: inputdata,
        //allowance:0xdd62ed3e
        //BalanceOF + staking contract address
      },
        "latest"
      ]
    });
    var accAllowNum = Number(accAllowance).toString(10);

    if (accAllowNum > 0) {
      document.getElementById("Approve-btn").innerText = "Approved";
      document.getElementById("Approve-btn").value = "haveApproved";
    }
  }

  async function LockLPToken() {
    let inputValue = document.getElementById("LockAmount").value;
    let realValue;
    let inputValueHex;
    let Zeros;
    let stringZeros;
    let strInput;

    if (inputValue < 1000) {

      realValue = inputValue * Math.pow(10, 18);
      inputValueHex = Number(realValue).toString(16);
      Zeros = Math.pow(10, 20 - inputValueHex.length);
      stringZeros = Zeros.toString();

    } else {
      realValue = inputValue * Math.pow(10, 18);
      let strRealValue = realValue.toString();            //10的多少次方
      let RealLenth = strRealValue.substring(strRealValue.length - 2, strRealValue.length);
      let RealLenthNum = parseInt(RealLenth);

      strInput = inputValue.toString();
      let strPart1 = strInput.substring(0, RealLenthNum - 18 + 1);
      let strPart2 = "000000000000000000";

      if (inputValue.includes(".")) {
        strPart2 = strInput.substring(RealLenthNum - 16, inputValue.length);
        let Part2Len = strPart2.length;
        let Part2Num = parseInt(strPart2) * Math.pow(10, 18 - Part2Len);
        strPart2 = Number(Part2Num).toString(10);
      }
      console.log(strPart1);
      console.log(RealLenth);
      inputValueHex = Number(strPart1 + strPart2).toString(16);
      Zeros = Math.pow(10, 30 - inputValueHex.length);
      stringZeros = Zeros.toString();
      console.log(inputValueHex);
    }


    let Duration = document.getElementById("LockDuration").value * 86400;
    let DurationHex = Number(Duration).toString(16);
    let DurationZeros = Math.pow(10, 18 - DurationHex.length);
    let stringDurationZeros = DurationZeros.toString();
    console.log(inputValue + " " + Duration);

    if (inputValue !== 0 && Duration !== 0) {
      let inputData;
      if (inputValue < 1000) {
        inputData = "0xa25983e5"
          + "000000000000000000000000" + LPContract.substring(2, LPContract.length)
          + "00000000000000000000000000000000000000000000" + stringZeros.substring(1, Zeros.length) + inputValueHex
          + "0000000000000000000000000000000000000000000000" + stringDurationZeros.substring(1, DurationZeros.length) + DurationHex;
      } else {
        inputData = "0xa25983e5"
          + "000000000000000000000000" + LPContract.substring(2, LPContract.length)
          + "0000000000000000000000000000000000" + stringZeros.substring(1, Zeros.length) + inputValueHex
          + "0000000000000000000000000000000000000000000000" + stringDurationZeros.substring(1, DurationZeros.length) + DurationHex;
      }

      let inputGasPrice = await window.ethereum.request({
        method: "eth_gasPrice"
      });

      let params = [
        {
          from: currentAccount,
          to: contractAddress,
          gas: Number(500000).toString(16), // 30400
          gasPrice: inputGasPrice, // 
          value: 0,
          data: inputData,
        },
      ]

      //Result is the transaction hash
      let result = await window.ethereum.request({ method: "eth_sendTransaction", params }).catch((err) => {
        console.log(err);
      })

      setTimeout(function () {
        console.log("The first log delay 20 second");
        LPBalance();
        getBalance();
      }, 20000);

      setTimeout(function () {
        console.log("The first log delay 40 second");
        LPBalance();
        getBalance();
      }, 40000);

      setTimeout(function () {
        console.log("The first log delay 60 second");
        LPBalance();
        getBalance();
      }, 60000);
    } else {
      alert("You need to decide lock amount and lock duration!!")
    }
  }

  async function ApproveLPToken() {
    LPContract = document.getElementById("LPAddr").value;
    await ACCAllowance();
    LPBalance();
    let haveApproved = document.getElementById("Approve-btn").value;
    console.log(haveApproved);
    if (haveApproved !== "haveApproved") {
      let inputGasPrice = await window.ethereum.request({
        method: "eth_gasPrice"
      });
      let inputData = "0x095ea7b3000000000000000000000000" +
        contractAddress.substring(2, contractAddress.length) +
        "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      // "0000000000000000000000000000000000000000204fce5e3e25026110000000";

      let params = [
        {
          from: currentAccount,
          to: LPContract,
          gas: Number(100000).toString(16), // 30400
          gasPrice: inputGasPrice, // 10000000000
          value: '0', // 2441406250
          data: inputData,

        },
      ];

      var ApproveBTN = document.getElementById("Approve-btn");

      let result = window.ethereum
        .request({
          method: "eth_sendTransaction",
          params,
        }).then(
          ApproveBTN.innerText = "Approving...",
        ).catch((err) => {
          ApproveBTN.innerText = "Approve"
          console.log(err);
        })

      setTimeout(function () {
        console.log("The first log delay 20 second");
        ACCAllowance();
      }, 20000);

      setTimeout(function () {
        console.log("The second log delay 40 second");
        ACCAllowance();
      }, 40000);
    }
  }

  async function LPBalance() {
    let inputData = "0x70a08231000000000000000000000000" + currentAccount.substring(2, currentAccount.length);
    let accBalance = await window.ethereum.request({
      method: "eth_call",
      params: [{
        to: LPContract,
        data: inputData,
      },
        "latest"
      ]
    });
    var balanceDEC = Number(accBalance).toString(10);
    var actual = balanceDEC / Math.pow(10, 18);

    var CAbalance = document.getElementById("ACCTokenBalance");

    document.getElementById("maxLock").value = actual;
    CAbalance.innerText = actual.toString().substring(0, 6);
  }



  function maxLockButton() {
    let staking = document.getElementById("LockAmount");
    let maxstaking = document.getElementById("maxLock").value;
    staking.value = maxstaking;
  }

  return (
    <div className="App" id="bg">
      <button id="balance-btn" hidden>
        balance
      </button>
      <button id="connect-btn" onClick={connectWallet}>
        Connect Wallet
      </button>
      <div className="App-header">

        <table className="LockLPTable">
          <thead>
            Lock LP With Ryo<br /><hr />
          </thead>
          <tbody>
            LP Address :
            <input id="LPAddr"></input><br />
            <button onClick={ApproveLPToken} id="Approve-btn">Check</button><br /><hr />
            <div className="SameRow">
              <div className="left">Your Balance : </div>
              <div className="right" id="ACCTokenBalance">0</div>
            </div>
            LockAmount :
            <input id="LockAmount"></input><br />
            <div id="maxLock" onClick={maxLockButton}>max</div>
            LockDuration (DAYS):
            <input id="LockDuration"></input><br />
            <button onClick={LockLPToken} id="Lock-btn">Lock</button>
          </tbody>
        </table>
      </div>
      {/* <h1>Designer <a href="https://t.me/RyoLin" className="Ryo">RyoLin</a></h1>
      <h1>Background Source : https://www.livescience.com/what-is-the-universe</h1> */}
    </div>
  );

}
export default App;

