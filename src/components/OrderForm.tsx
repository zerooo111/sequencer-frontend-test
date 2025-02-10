import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import axios, { AxiosError } from "axios";

enum Side {
  Buy = "Buy",
  Sell = "Sell",
}

type OrderIntentFields = {
  order_id: number;
  owner: number[];
  side: Side;
  price: number;
  quantity: number;
  expiry: number;
};

const OrderForm = () => {
  const { publicKey, signMessage } = useWallet();
  const [orderIntent, setOrderIntent] = useState<OrderIntentFields | null>(
    null
  );
  const [signature, setSignature] = useState<string | null>(null);
  const [messageSigned, setMessageSigned] = useState<string | null>(null);
  const [bodySent, setBodySent] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    if (publicKey) {
      setOrderIntent(null);
    }
  }, [publicKey]);

  /**
   * @description Reset all states to their initial values
   */
  const handleClearData = () => {
    setOrderIntent(null);
    setSignature(null);
    setMessageSigned(null);
    setBodySent(null);
    setError("");
    setResponse(null);
  };

  const convertPublicKeyToBuffer = (publicKey: PublicKey) => {
    return publicKey.toBuffer().toJSON().data;
  };

  const handleSign = async () => {
    try {
      if (!publicKey || !signMessage) {
        throw new Error("Wallet not connected or order intent not initialized");
      }

      // Create message to sign using the same format as <backend>

      const orderIntent = {
        order_id: 1,
        owner: convertPublicKeyToBuffer(publicKey),
        side: Side.Buy,
        price: 100,
        quantity: 500,
        expiry: 1770595200,
      };
      setOrderIntent(orderIntent as OrderIntentFields);

      const message = new TextEncoder().encode(JSON.stringify(orderIntent));
      const prefix = new TextEncoder().encode("FRM_DEX_ORDER:");
      const fullMessage = new Uint8Array(prefix.length + message.length);

      fullMessage.set(prefix);
      fullMessage.set(message, prefix.length);

      setMessageSigned(new TextDecoder().decode(fullMessage));

      const signatureBytes = await signMessage(fullMessage);

      // Convert signature to hex string as expected by backend
      const hexSignature = Buffer.from(signatureBytes).toString("hex");
      setSignature(hexSignature);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign message");
    }
  };

  const handleSubmitOrder = async () => {
    try {
      if (!orderIntent || !signature) {
        throw new Error("Order intent or signature missing");
      }

      const bodySent = {
        intent: orderIntent,
        signature: signature,
      };

      setBodySent(JSON.stringify(bodySent, null, 2));

      const response = await axios.post(
        "http://localhost:8080/place_order",
        bodySent
      );

      const data = response.data;
      console.log(data);
      setResponse(JSON.stringify(data, null, 2));
      setError("");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data.error);
        setResponse(JSON.stringify(err.response?.data, null, 2));
      } else {
        setError(err instanceof Error ? err.message : "Failed to submit order");
      }
      console.error("Error submitting order:", err);
    }
  };

  if (!publicKey) {
    return <div className="error">Please connect your wallet to continue</div>;
  }

  return (
    <div className="order-form">
      {error && <div className="error">{error}</div>}
      <br />
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleSign} disabled={!publicKey}>
          Sign Order
        </button>
        <button onClick={handleSubmitOrder} disabled={!signature}>
          Submit Order
        </button>
        <button
          onClick={handleClearData}
          style={{ backgroundColor: "#dc2626" }}
        >
          Clear Data
        </button>
      </div>
      <br />
      <h6>Order Intent</h6>
      <pre>{JSON.stringify(orderIntent, null, 2)}</pre>
      <h6>Signature</h6>
      <pre>{JSON.stringify(signature, null, 2)}</pre>
      <h6>Public Key</h6>
      {messageSigned && (
        <>
          <h6>Message to be Signed</h6>
          <pre>{messageSigned}</pre>
        </>
      )}
      {bodySent && (
        <>
          <h6>Body Sent</h6>
          <pre>{bodySent}</pre>
        </>
      )}
      {response && (
        <>
          <h6>Response</h6>
          <pre>{response}</pre>
        </>
      )}
    </div>
  );
};

export default OrderForm;
