import React, { useCallback, useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { abi, Whitelist_Contract_Address } from "../constants";
import Swal from "sweetalert2";
import { NFTsabi, NFTs_Contract_Address } from "../constants/nft";

const useHook = () => {
  const web3ModalRef = useRef();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // helpers function
  const Modal = (type, message) => {
    if (type === "sucess") {
      Swal.fire("Good job!", message, "success");
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
    }
  };

  const getProviderOrSigner = useCallback(async (needigner = false) => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is NOT installed!");
    } else {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 4) {
        throw new Error("Change network to Rinkeby");
      }

      if (needigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      await getProviderOrSigner();
      setIsWalletConnected(true);
    } catch (error) {
      console.log(error);
      Modal("error", error);
    }
  }, [getProviderOrSigner]);

  const whitelistContractSigner = async () => {
    const signer = await getProviderOrSigner(true);
    const whitelistContract = new Contract(
      Whitelist_Contract_Address,
      abi,
      signer
    );
    return whitelistContract;
  };

  const whitelistContractProvider = async () => {
    const provider = await getProviderOrSigner();
    const whitelistContract = new Contract(
      Whitelist_Contract_Address,
      abi,
      provider
    );
    return whitelistContract;
  };

  const NFTsContractSigner = async () => {
    const signer = await getProviderOrSigner(true);
    const NFTsContract = new Contract(NFTs_Contract_Address, NFTsabi, signer);
    return NFTsContract;
  };

  const NFTsContractProvider = async () => {
    const provider = await getProviderOrSigner();
    const NFTsContract = new Contract(NFTs_Contract_Address, NFTsabi, provider);
    return NFTsContract;
  };

  useEffect(() => {
    if (!isWalletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [isWalletConnected, connectWallet]);

  return {
    getProviderOrSigner,
    connectWallet,
    isWalletConnected,
    whitelistContractSigner,
    whitelistContractProvider,
    Modal,
    NFTsContractSigner,
    NFTsContractProvider,
  };
};

export default useHook;
