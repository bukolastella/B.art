import { Contract, utils, providers } from "ethers";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NFTsabi, NFTs_Contract_Address } from "../../constants/nft";
import Web3Modal from "web3modal";
import Loader from "../../styles/helpers/Loader";

const Cards = ({ imgName, tokenId }) => {
  const isWhitelisted = useSelector((state) => state.whitelistState.value);
  const presaleStarted = useSelector(
    (state) => state.whitelistState.presaleStarted
  );
  const presaleEnded = useSelector(
    (state) => state.whitelistState.presaleEnded
  );
  const onGoing =
    presaleStarted &&
    !presaleEnded &&
    presaleStarted != null &&
    presaleEnded != null;
  const web3ModalRef = useRef();
  const [loading, setLoading] = useState(false);

  const getProviderOrSigner = useCallback(async (needigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      // errorModal("yo change to rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      await getProviderOrSigner();
    } catch (error) {
      errorModal(error);
    }
  }, [getProviderOrSigner]);

  //
  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      network: "rinkeby",
      providerOptions: {},
      disableInjectedProvider: false,
    });
    connectWallet();
  }, [connectWallet]);

  const presaleMintHandler = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        NFTs_Contract_Address,
        NFTsabi,
        signer
      );
      const tx = await whitelistContract.presaleMint(tokenId, {
        value: utils.parseEther("0.005"),
      });
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.log(err);
      window.alert(err);
    }
  };

  const publicMintHandler = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        NFTs_Contract_Address,
        NFTsabi,
        signer
      );
      const tx = await whitelistContract.publicMint(tokenId, {
        value: utils.parseEther("0.01"),
      });
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.log(err);
      window.alert(err);
    }
  };

  const mintHandler = () => {
    if (isWhitelisted && onGoing) presaleMintHandler();
    else publicMintHandler();
  };

  return (
    <div className="bg-[rgba(212,133,47)] rounded-lg shadow-2xl p-3">
      <Image
        src={imgName}
        alt="digital img"
        className="rounded-t-lg  bg-orange-200"
        width={500}
        height={500}
      />
      <div className="p-2">
        <div className="flex justify-between p-2  items-center">
          <div>Hero</div>
          <div>{onGoing ? 0.005 : 0.01} ether</div>
        </div>
        <button
          className=" bg-white rounded mt-4 px-4 py-2 w-full"
          onClick={mintHandler}
        >
          {loading ? <Loader /> : "Mint"}
        </button>
      </div>
    </div>
  );
};

export default Cards;
