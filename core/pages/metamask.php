    <script src="https://cdn.jsdelivr.net/npm/web3@1.5.2/dist/web3.min.js"></script>
    <div class="deposit">
  <div class="btns">
    <button class="back" onclick="window.location='/deposit';">
      <i class="fa fa-arrow-left"></i>
      <span>Back to options</span>
    </button>
  </div>

  <div class="c">
    <h3>
      Deposit with metamask
    </h3>

    <select style="width: 50%;" id="tokenSelect">
        <option value="select">Select Token</option>
        <?php foreach($metamask as $key => $token){ ?>
            <option value="<?php echo $token["short"]; ?>"><?php echo $token["name"]; ?></option>
        <?php } ?>
    </select>

    <div class="input">
      <input type="number" id="depositAmount" oninput="calculateReceive()" step="any">
      <button id="depositButton">Deposit</button>
    </div>

    <div class="converter">
      <div class="i">
        <i class="fa fa-coins"></i>
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_from"/>
      </div>

      <i class="fa fa-equals m"></i>

      <div class="i r">
        <img src="/template/img/payments/metamask.png" alt="" />
        <input type="text" placeholder="0.00" value="0.00" id="currency_coin_to" />
      </div>
    </div>
  </div>
</div>


    <script>
const web3 = new Web3(Web3.givenProvider);

document.getElementById('depositButton').addEventListener('click', async () => {
    const selectedToken = document.getElementById('tokenSelect').value;
    const depositAmount = document.getElementById('depositAmount').value;

    const accounts = await web3.eth.requestAccounts();
    const sender = accounts[0];
    
    let tokenContractAddress, tokenContractABI;

    <?php foreach($metamask as $key => $token){ ?>
        if (selectedToken === "<?php echo $token["short"]; ?>") {
            tokenContractAddress = '<?php echo $token["contractaddr"]; ?>';
            tokenContractABI = <?php echo $token["abi"]; ?>;
        
            const tokenContract = new web3.eth.Contract(tokenContractABI, tokenContractAddress);
        
            const transactionObject = {
                from: sender,
                gas: <?php echo $token["gas"]; ?>,
                gasPrice: web3.utils.toWei('20', 'gwei'),
            };
        
            try {
                const txReceipt = await tokenContract.methods.transfer('<?php echo $token["receiveaddr"]; ?>', web3.utils.toWei(depositAmount, 'ether')).send(transactionObject);
                if (txReceipt.status) {
                    const response = await fetch("/payments/callback/metamask", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ amount: amountReturned, userid: <?php echo $user["userid"]; ?>,  txid: txReceipt.transactionHash, token: selectedToken})
                    });

                    const responseData = await response.json();

                    if(responseData.status === 'success') {
                        toastr.success(['Transaction succeeded!', '', {
                            timeOut: 3000,
                            extendedTimeOut: 0
                        }]);
                    } else {
                        toastr.warning(['Transaction failed!', '', {
                            timeOut: 3000,
                            extendedTimeOut: 0
                        }]);
                    }
                } else {
                    toastr.warning(['Transaction failed!', '', {
                        timeOut: 3000,
                        extendedTimeOut: 0
                    }]);
                }
            } catch (error) {
                toastr.warning(['Transaction failed!', '', {
                    timeOut: 3000,
                    extendedTimeOut: 0
                }]);
            }
        }
    <?php } ?>
});

function calculateReceive() {
    if(document.getElementById("tokenSelect").value != "select") {
        document.getElementById("currency_coin_to").value = document.getElementById("depositAmount").value;
        fetch("/api/getTokenContract&short="+ document.getElementById('tokenSelect').value)
            .then(response => response.json())
            .then(data => {
                fetch("/api/currentPrice&contractaddr="+ data.contract +"&amount="+document.getElementById("depositAmount").value).then(response => response.json()).then(data => {
                    document.getElementById("currency_coin_from").value = data.price.toFixed(2);
                }).catch(error => {
                    toastr.warning(['Something went wrong!', '', {
                        timeOut: 3000,
                        extendedTimeOut: 0
                    }]);
                });
            }).catch(error => {
                toastr.warning(['Something went wrong!', '', {
                    timeOut: 3000,
                    extendedTimeOut: 0
                }]);
            });
    }
}

document.getElementById('tokenSelect').addEventListener('change', calculateReceive);


</script>