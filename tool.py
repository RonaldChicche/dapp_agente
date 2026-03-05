import os
import json
from web3 import Web3
from openai import OpenAI
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# --- CONFIGURACIÓN DE INFRAESTRUCTURA ---
# Conexión a Rollux Testnet (Tanenbaum)
web3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- MÚSCULOS: FUNCIONES DE BLOCKCHAIN ---

def get_wallet_balance(address):
    """Consulta el saldo real en la blockchain"""
    try:
        balance_wei = web3.eth.get_balance(address)
        balance_sys = web3.from_wei(balance_wei, 'ether')
        return f"El saldo actual de {address} es {balance_sys} TSYS."
    except Exception as e:
        return f"Error al consultar saldo: {str(e)}"

def get_transaction_history(address):
    """Genera el link al explorador oficial de Tanenbaum"""
    url = f"https://rollux.tanenbaum.io/address/{address}"
    return f"He encontrado el historial. Puedes verlo aquí: {url}"

def get_network_stats():
    """Obtiene métricas técnicas de la red Rollux"""
    block = web3.eth.block_number
    gas_price = web3.from_wei(web3.eth.gas_price, 'gwei')
    return f"Red: Rollux Testnet. Bloque actual: {block}. Precio del gas: {gas_price} Gwei."

# --- CEREBRO: CONFIGURACIÓN DEL AGENTE DE IA ---

def ejecutar_agente(prompt_usuario):
    # Definición de herramientas (Tools) para OpenAI
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_wallet_balance",
                "description": "Obtener el saldo de una wallet de Syscoin/Rollux",
                "parameters": {
                    "type": "object",
                    "properties": {"address": {"type": "string", "description": "La dirección 0x"}},
                    "required": ["address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_transaction_history",
                "description": "Obtener el link al historial de transacciones",
                "parameters": {
                    "type": "object",
                    "properties": {"address": {"type": "string"}},
                    "required": ["address"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_network_stats",
                "description": "Obtener estado técnico de la red (bloque y gas)",
                "parameters": {"type": "object", "properties": {}}
            }
        }
    ]

    messages = [
        {"role": "system", "content": "Eres un asistente experto de la hackathon Proof-of-Builders de Syscoin. Ayudas a Ronald con su wallet en Rollux."},
        {"role": "user", "content": prompt_usuario}
    ]

    # Primera llamada: La IA decide qué herramienta usar
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    # Si la IA decidió usar una herramienta:
    if tool_calls:
        # Diccionario para mapear nombres a funciones reales
        available_functions = {
            "get_wallet_balance": get_wallet_balance,
            "get_transaction_history": get_transaction_history,
            "get_network_stats": get_network_stats,
        }

        messages.append(response_message)

        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_to_call = available_functions[function_name]
            function_args = json.loads(tool_call.function.arguments)
            
            # Ejecución real de la función de blockchain
            function_response = function_to_call(**function_args)

            messages.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": function_name,
                "content": function_response,
            })

        # Segunda llamada: La IA recibe el dato de la blockchain y te responde
        final_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        return final_response.choices[0].message.content

    return response_message.content

# --- EJECUCIÓN ---
if __name__ == "__main__":
    mi_wallet = "0xf57D77FB1AE2D0e41Ff073f40357372d18649CD3"
    print("🤖 Agente listo. Hazle una pregunta sobre tu wallet de la hackathon...")
    
    # Ejemplo de uso:
    pregunta = f"¿Cómo está la red de Rollux y cuál es el historial de mi wallet {mi_wallet}?"
    resultado = ejecutar_agente(pregunta)
    print(f"\nRespuesta del Agente:\n{resultado}")