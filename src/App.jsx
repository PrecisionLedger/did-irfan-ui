import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

// 🟢 Your Base Mainnet contract address:
const CONTRACT_ADDRESS = "0x610296cf0C2837F926e67d0f1dA43bae58308B82";

const ABI = [
  "function getDecision() public view returns (uint256, address, uint256)",
  "function updateDecision(uint256) public"
];

function App() {
  const [wallet, setWallet] = useState(null);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask to continue.");
    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(account);
  };

  const fetchDecision = async () => {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const [value, reporter, timestamp] = await contract.getDecision();
    setDecision({
      value: value.toString(),
      reporter,
      updated: new Date(Number(timestamp) * 1000).toLocaleString(),
    });
  };

  const submitDecision = async (val) => {
    if (!window.ethereum) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.updateDecision(val);
      await tx.wait();
      fetchDecision();
    } catch (err) {
      alert("Transaction failed.");
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDecision();
  }, []);

  return (
    <div className="App">
      <h1>Did Irfan Agree with Falak?</h1>

      <button onClick={connectWallet}>
        {wallet ? `Connected: ${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
      </button>

      {decision ? (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Answer:</strong> {decision.value === "1" ? "Yes ✅" : "No ❌"}</p>
          <p><strong>Last updated:</strong> {decision.updated}</p>
          <p><strong>Reported by:</strong> {decision.reporter}</p>
        </div>
      ) : (
        <p>Loading latest decision...</p>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button disabled={loading} onClick={() => submitDecision(1)}>Yes</button>
        <button disabled={loading} onClick={() => submitDecision(0)}>No</button>
      </div>
    </div>
  );
}

export default App;

