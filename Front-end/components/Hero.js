import Image from "next/image";
import React, { useEffect, useRef, useState, useCallback } from "react";
import img from "../public/img.jpg";
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import Loader from "../styles/helpers/Loader";
import { abi, Whitelist_Contract_Address } from "../constants";
import Swal from "sweetalert2";
import {
  changeWhitelistState,
  setPresaleEnded,
  setPresaleStarted,
} from "../store/slice";
import { useDispatch, useSelector } from "react-redux";
import { NFTsabi, NFTs_Contract_Address } from "../constants/nft";

const Hero = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState(false);
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [time, setTime] = useState(null);

  const web3ModalRef = useRef();
  const dispatch = useDispatch();
  const isWhitelisted = useSelector((state) => state.whitelistState.value);
  const presaleStarted = useSelector(
    (state) => state.whitelistState.presaleStarted
  );
  const presaleEnded = useSelector(
    (state) => state.whitelistState.presaleEnded
  );

  const onGoing = presaleStarted && !presaleEnded && presaleStarted != null;

  // helpers function
  const getProviderOrSigner = useCallback(async (needigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      errorModal("yo change to rinkeby");
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
      // setLoading(true);
      await getProviderOrSigner();
      setIsWalletConnected(true); //
      // checkIfAddressIsWhitelisted();
      // getNoOfWhitelisted();
      // getTokenIdsMinted;
      // setLoading(false);
    } catch (error) {
      errorModal(error);
    }
  }, [getProviderOrSigner]);

  const errorModal = (err) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err,
    });
    setLoading(false);
    console.log(err);
  };

  // whitelist functions
  const checkIfAddressIsWhitelisted = useCallback(async () => {
    try {
      // setLoading(true);
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        Whitelist_Contract_Address,
        abi,
        signer
      );
      const address = signer.getAddress();
      const isPartOfWhitelist = await whitelistContract.WhiteListedAddresses(
        address
      );
      dispatch(changeWhitelistState(isPartOfWhitelist));
      // setLoading(false);
    } catch (error) {
      errorModal(error);
    }
  }, [dispatch, getProviderOrSigner]);

  const getNoOfWhitelisted = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        Whitelist_Contract_Address,
        abi,
        provider
      );
      const numOfWhitelisted = await whitelistContract.NoOfAddresses();
      setNumOfWhitelisted(numOfWhitelisted);
    } catch (error) {
      errorModal(error);
    }
  }, [getProviderOrSigner]);

  const addToWhitelistHandler = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        Whitelist_Contract_Address,
        abi,
        signer
      );
      const tx = await whitelistContract.addToWhitelist(); //modal pops up
      await tx.wait();
      await getNoOfWhitelisted();
      dispatch(changeWhitelistState(true));
      setLoading(false);
    } catch (error) {
      errorModal(error);
    }
  };

  // NFTs functions
  const getOwner = useCallback(async () => {
    try {
      setLoading(true);
      const provider = await getProviderOrSigner();
      const contract = new Contract(NFTs_Contract_Address, NFTsabi, provider);
      const whielist = await contract.owner();
      const signer = await getProviderOrSigner(true);
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() === whielist.toLowerCase())
        setOwner(true);

      setLoading(false);
    } catch (error) {
      errorModal(error);
    }
  }, [getProviderOrSigner]);

  const checkIfPresaleStarted = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(NFTs_Contract_Address, NFTsabi, provider);
      const presaleSatus = await contract.hasPresaleStarted();
      if (!presaleSatus) await getOwner();
      dispatch(setPresaleStarted(presaleSatus));
      return presaleSatus;
    } catch (error) {
      errorModal(error);
      return false;
    }
  }, [getProviderOrSigner, getOwner, dispatch]);

  const getEndPresaleTime = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner();
      const contract = new Contract(NFTs_Contract_Address, NFTsabi, provider);
      const time = await contract.endPresaleTime();
      const endTime = new Date(Number(time.toString() + "000"));
      const now = new Date();
      const cal = Math.ceil((endTime - now) / 60000);
      if (cal < 1) setPresaleEnded(true);
      setTime(cal);
    } catch (error) {
      errorModal(error);
    }
  }, [getProviderOrSigner]);

  const checkIfPresaleEnded = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFTs_Contract_Address,
        NFTsabi,
        provider
      );
      const _presaleEnded = await nftContract.endPresaleTime();
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        dispatch(setPresaleEnded(true));
      } else {
        dispatch(setPresaleEnded(false));
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, [getProviderOrSigner, dispatch]);

  const getTokenIdsMinted = useCallback(async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFTs_Contract_Address,
        NFTsabi,
        provider
      );
      const tokenIds = await nftContract.numTokenIds();
      setTokenIdsMinted(tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  }, [getProviderOrSigner]);

  const startPresale = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const contract = new Contract(NFTs_Contract_Address, NFTsabi, signer);
      const whielist = await contract.startPresale();
      await whielist.wait();
      dispatch(setPresaleStarted(true));
      setLoading(false);
    } catch (error) {
      errorModal(error);
      console.log(error);
    }
  };

  const checkPresaleStatus = useCallback(async () => {
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
      await getEndPresaleTime();
    }
  }, [checkIfPresaleStarted, checkIfPresaleEnded, getEndPresaleTime]);

  //
  useEffect(() => {
    if (!isWalletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
    connectWallet();
    checkIfAddressIsWhitelisted();
    getNoOfWhitelisted();
    checkPresaleStatus();
    getTokenIdsMinted();

    if (onGoing) {
      const interval = setInterval(async () => {
        getEndPresaleTime();
        await getTokenIdsMinted();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [
    isWalletConnected,
    connectWallet,
    checkIfAddressIsWhitelisted,
    getNoOfWhitelisted,
    checkPresaleStatus,
    getTokenIdsMinted,
    dispatch,
    onGoing,
    getEndPresaleTime,
  ]);

  const renderButton = () => {
    if (loading) {
      return (
        <div className="flex justify-start items-center">
          <Loader />
        </div>
      );
    } else {
      if (owner && !presaleStarted) {
        return (
          <button
            className="p-3 bg-[rgba(212,133,47)] text-white"
            onClick={startPresale}
          >
            Start Presale
          </button>
        );
      } else {
        if (!isWhitelisted && onGoing) {
          return (
            <button
              className="p-3 bg-[rgba(212,133,47)] text-white"
              onClick={addToWhitelistHandler}
            >
              Join Whitelist
            </button>
          );
        } else {
          return (
            <div className="p-3 bg-[rgba(212,133,47)] text-white w-max">
              You are all set!! Happy Minting.
            </div>
          );
        }
      }
    }
  };

  const renderBanner = () => {
    if (!presaleStarted && presaleStarted != null) {
      return (
        <span>
          Presale has not started yet!! <br /> Join the whitelist to enjoy lower
          offer when it starts.
        </span>
      );
    } else if (onGoing) {
      return (
        <>
          <div>
            <span className="font-bold">Presale has started</span> | Token
            Minted: {tokenIdsMinted}/10
          </div>
          <div className="font-bold">{time} minutes left!</div>
        </>
      );
    } else if (presaleEnded && presaleEnded != null) {
      return (
        <>
          <span className="font-bold">Presale has ended!!</span> | Token Minted:{" "}
          {tokenIdsMinted}/20
        </>
      );
    }
  };

  return (
    <div className="px-20 bg-[rgba(211,219,206)]">
      <div className="p-3 bg-[#eceb98] text-[#3d3c0a] text-center">
        {renderBanner()}
      </div>
      <div className="flex justify-between items-center py-7">
        <span className="text-3xl">B.art</span>
        <span className="bg-black p-3 text-white rounded-md">
          {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
        </span>
      </div>

      <div className="flex justify-between items-center mt-12">
        <div>
          <h1 className="text-7xl">
            Discover <br /> Rare Collection of <br /> Art and NFTs
          </h1>
          <span className="block my-4 uppercase">
            Explore digital art ntf<span className="lowercase ">s</span> with{" "}
            {numOfWhitelisted}/20 people
          </span>
          {renderButton()}
        </div>
        <div className="w-1/2">
          <Image src={img} alt="hero picture" />
        </div>
      </div>

      {/* <div className="bottom-0 right-0 p-3 bg-white text-black fixed">
        <span>Time life till end of presale</span>
        <span>{endPresaleTime}</span>
      </div> */}
    </div>
  );
};

export default Hero;
