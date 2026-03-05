from web3 import Web3

# 1. Conexión al "Nodo" (El puente a la blockchain de Syscoin/Rollux)
# Usamos la red de pruebas Tanenbaum de Rollux
# rpc_url = "https://rpc-tanenbaum.rollux.com"
rpc_url = "https://rpc.tanenbaum.io"

web3 = Web3(Web3.HTTPProvider(rpc_url))

if web3.is_connected():
    print("-" * 30)
    print("✅ Conectado exitosamente a Rollux Testnet")
    print("-" * 30)
else:
    print("❌ Error de conexión")
    exit()

# 3. Consultar un balance
wallet_address = "0xf57D77FB1AE2D0e41Ff073f40357372d18649CD3" 

balance_wei = web3.eth.get_balance(wallet_address)

# Blockchain usa números enteros gigantes (Wei). Pasémoslo a algo legible (Ether/SYS)
balance_sys = web3.from_wei(balance_wei, 'ether')

print(f"La wallet: {wallet_address}")
print(f"Tiene un saldo de: {balance_sys} TSYS")
print("-" * 30)
