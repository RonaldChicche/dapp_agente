import { NextRequest, NextResponse } from 'next/server';

const RPC_URL = "https://rpc.tanenbaum.io";

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Dirección de wallet inválida' },
        { status: 400 }
      );
    }

    // Validar formato de dirección Ethereum
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Formato de dirección inválido' },
        { status: 400 }
      );
    }

    // Obtener balance
    const balanceResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      }),
    });

    const balanceData = await balanceResponse.json();
    
    if (balanceData.error) {
      return NextResponse.json(
        { error: 'Error al consultar balance' },
        { status: 500 }
      );
    }

    // Convertir de Wei a Ether
    const balanceWei = BigInt(balanceData.result);
    const balanceEther = Number(balanceWei) / 1e18;

    // Obtener número de transacciones
    const txCountResponse = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
        id: 2,
      }),
    });

    const txCountData = await txCountResponse.json();
    const transactionCount = parseInt(txCountData.result, 16);

    return NextResponse.json({
      address,
      balance: balanceEther.toFixed(6),
      transactionCount,
      network: 'Rollux Tanenbaum Testnet',
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
