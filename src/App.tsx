import {
  conditions,
  decrypt,
  domains,
  encrypt,
  getPorterUri,
  initialize,
  ThresholdMessageKit,
} from "@nucypher/taco";
import { Mumbai, Sepolia, useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";

import { ConditionBuilder } from "./ConditionBuilder";
import { Decrypt } from "./Decrypt";
import { Encrypt } from "./Encrypt";
import { Spinner } from "./Spinner";
import { DEFAULT_DOMAIN, DEFAULT_RITUAL_ID } from "./config";

export default function App() {
  const { activateBrowserWallet, deactivate, account, switchNetwork } =
    useEthers();

  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState<conditions.Condition>();
  const [encryptedMessage, setEncryptedMessage] =
    useState<ThresholdMessageKit>();
  const [decryptedMessage, setDecryptedMessage] = useState<string>();
  const [decryptionErrors, setDecryptionErrors] = useState<string[]>([]);
  const [ritualId, setRitualId] = useState<number>(DEFAULT_RITUAL_ID);
  const [domain, setDomain] = useState<string>(DEFAULT_DOMAIN);

  useEffect(() => {
    initialize();
    switchNetwork(Mumbai.chainId);
  }, []);

  const encryptMessage = async (message: string) => {
    if (!condition) {
      return;
    }
    setLoading(true);

    await switchNetwork(Mumbai.chainId);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const encryptedMessage = await encrypt(
      provider,
      domain,
      message,
      condition,
      ritualId,
      provider.getSigner()
    );

    setEncryptedMessage(encryptedMessage);
    setLoading(false);
  };

  const decryptMessage = async (encryptedMessage: ThresholdMessageKit) => {
    if (!condition) {
      return;
    }
    setLoading(true);
    setDecryptedMessage("");
    setDecryptionErrors([]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const decryptedMessage = await decrypt(
      provider,
      domain,
      encryptedMessage,
      getPorterUri(domain),
      provider.getSigner()
    );

    await switchNetwork(Sepolia.chainId);
    const signer = provider.getSigner();
    const pushUser = await PushAPI.initialize(signer, {
      env: CONSTANTS.ENV.STAGING,
    });
    const response = await pushUser.channel.send(["*"], {
      notification: {
        title: "New decryption on TACo!",
        body: "A new TACo decryption was made.",
      },
    });

    setDecryptedMessage(new TextDecoder().decode(decryptedMessage));
    setLoading(false);
  };

  if (!account) {
    return (
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={() => activateBrowserWallet()}>Connect Wallet</button>
      </div>
    );
  }

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <div>
      <div>
        <h2>Web3 Provider</h2>
        <button onClick={deactivate}> Disconnect Wallet</button>
        {account && <p>Account: {account}</p>}
      </div>

      <h2>Ritual ID</h2>
      <p>Replace with your own ritual ID</p>
      <input
        type={"number"}
        value={ritualId}
        onChange={(e) => setRitualId(parseInt(e.currentTarget.value))}
      />

      <h2>TACo Domain</h2>
      <p>Must match the domain of your ritual</p>
      <select
        defaultValue={domain}
        onChange={(e) => setDomain(e.currentTarget.value)}
      >
        {Object.values(domains).map((domain) => (
          <option value={domain} key={domain}>
            {domain}
          </option>
        ))}
      </select>

      <ConditionBuilder
        enabled={true}
        condition={condition}
        setConditions={setCondition}
      />

      <Encrypt
        enabled={!!condition}
        encrypt={encryptMessage}
        encryptedMessage={encryptedMessage!}
      />

      <Decrypt
        enabled={!!encryptedMessage}
        decrypt={decryptMessage}
        decryptedMessage={decryptedMessage}
        decryptionErrors={decryptionErrors}
      />
    </div>
  );
}
