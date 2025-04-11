export default function NetworkIndicator({ currentNetwork, HARDHAT_CHAIN_ID }) {
    if (!currentNetwork) return null;
    
    const networkName = currentNetwork === HARDHAT_CHAIN_ID 
      ? 'Hardhat Local' 
      : 'Wrong Network';
  
    return (
      <div className={`mt-2 text-center text-sm font-medium ${
        currentNetwork === HARDHAT_CHAIN_ID ? 'text-green-600' : 'text-red-600'
      }`}>
        Network: {networkName}
      </div>
    );
  }