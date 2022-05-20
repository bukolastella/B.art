import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import img from "../public/img.jpg";
import Loader from "../styles/helpers/Loader";
import {
  changeWhitelistState,
  setPresaleEnded,
  setPresaleStarted,
} from "../store/slice";
import { useDispatch, useSelector } from "react-redux";
import useHook from "../hooks";

const Hero = () => {
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState(false);
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const [time, setTime] = useState(null);

  const dispatch = useDispatch();
  const isWhitelisted = useSelector((state) => state.whitelistState.value);
  const presaleStarted = useSelector(
    (state) => state.whitelistState.presaleStarted
  );
  const presaleEnded = useSelector(
    (state) => state.whitelistState.presaleEnded
  );
  const {
    getProviderOrSigner,
    connectWallet,
    isWalletConnected,
    whitelistContractProvider,
    whitelistContractSigner,
    Modal,
    NFTsContractSigner,
    NFTsContractProvider,
  } = useHook();
  const onGoing =
    presaleStarted &&
    !presaleEnded &&
    presaleStarted != null &&
    presaleEnded != null;

  // whitelist functions
  const checkIfAddressIsWhitelisted = useCallback(async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = await whitelistContractSigner();
      const address = signer.getAddress();
      const isPartOfWhitelist = await whitelistContract.WhiteListedAddresses(
        address
      );
      dispatch(changeWhitelistState(isPartOfWhitelist));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, getProviderOrSigner, whitelistContractSigner]);

  const getNoOfWhitelisted = useCallback(async () => {
    try {
      const whitelistContract = await whitelistContractProvider();
      const numOfWhitelisted = await whitelistContract.NoOfAddresses();
      setNumOfWhitelisted(numOfWhitelisted);
    } catch (error) {
      console.log(error);
    }
  }, [whitelistContractProvider]);

  const addToWhitelistHandler = async () => {
    try {
      setLoading(true);
      const whitelistContract = await whitelistContractSigner();
      const tx = await whitelistContract.addToWhitelist(); //modal pops up
      await tx.wait();
      await getNoOfWhitelisted();
      dispatch(changeWhitelistState(true));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // NFTs functions
  const getOwner = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const whielist = await NFTsContract.owner();
      const signer = await getProviderOrSigner(true);
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() === whielist.toLowerCase())
        setOwner(true);
    } catch (error) {
      console.log(error);
    }
  }, [getProviderOrSigner, NFTsContractProvider]);

  const checkIfPresaleStarted = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const presaleSatus = await NFTsContract.hasPresaleStarted();
      if (!presaleSatus) await getOwner();
      dispatch(setPresaleStarted(presaleSatus));
      return presaleSatus;
    } catch (error) {
      console.log(error);
      return false;
    }
  }, [getOwner, dispatch, NFTsContractProvider]);

  const getEndPresaleTime = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const time = await NFTsContract.endPresaleTime();
      const endTime = new Date(Number(time.toString() + "000"));
      const now = new Date();
      const cal = Math.ceil((endTime - now) / 60000);
      if (cal < 1) setPresaleEnded(true);
      setTime(cal);
    } catch (error) {
      console.log(error);
    }
  }, [NFTsContractProvider]);

  const checkIfPresaleEnded = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const _presaleEnded = await NFTsContract.endPresaleTime();
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
  }, [NFTsContractProvider, dispatch]);

  const getTokenIdsMinted = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const tokenIds = await NFTsContract.numTokenIds();
      setTokenIdsMinted(tokenIds.toString());
    } catch (err) {
      console.log(err);
    }
  }, [NFTsContractProvider]);

  const startPresale = async () => {
    try {
      setLoading(true);
      const NFTsContract = await NFTsContractSigner();
      const presale = await NFTsContract.startPresale();
      await presale.wait();
      dispatch(setPresaleStarted(true));
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const checkPresaleStatus = useCallback(async () => {
    const presaleStarted = await checkIfPresaleStarted();
    if (presaleStarted) {
      await checkIfPresaleEnded();
      await getEndPresaleTime();
      await getTokenIdsMinted();
    }

    if (!presaleEnded) {
      await checkIfAddressIsWhitelisted();
      await getNoOfWhitelisted();
    }
  }, [
    checkIfPresaleStarted,
    checkIfPresaleEnded,
    getEndPresaleTime,
    getTokenIdsMinted,
    presaleEnded,
    checkIfAddressIsWhitelisted,
    getNoOfWhitelisted,
  ]);

  //
  useEffect(() => {
    checkPresaleStatus();

    if (onGoing) {
      const interval = setInterval(async () => {
        getEndPresaleTime();
        await getTokenIdsMinted();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [
    // checkIfAddressIsWhitelisted,
    // getNoOfWhitelisted,
    checkPresaleStatus,
    getTokenIdsMinted,
    dispatch,
    onGoing,
    getEndPresaleTime,
  ]);

  const renderButton = () => {
    if (presaleStarted != null) {
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

  const renderConnectButton = () => (
    <span
      className="bg-black p-3 text-white rounded-md cursor-pointer"
      onClick={connectWallet}
    >
      {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
    </span>
  );

  return (
    <div className="px-20 bg-[rgba(211,219,206)]">
      {presaleStarted != null && (
        <div className="p-3 bg-[#eceb98] text-[#3d3c0a] text-center">
          {renderBanner()}
        </div>
      )}
      <div className="flex justify-between items-center py-7">
        <span className="text-3xl">B.art</span>
        {renderConnectButton()}
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
          {!isWalletConnected && renderConnectButton()}
          {renderButton()}
        </div>
        <div className="w-1/2">
          <Image src={img} alt="hero picture" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
