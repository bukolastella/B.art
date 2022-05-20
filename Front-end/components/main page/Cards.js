import { utils } from "ethers";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loader from "../../styles/helpers/Loader";
import useHook from "../../hooks";

const Cards = ({ imgName, tokenId }) => {
  const isWhitelisted = useSelector((state) => state.whitelistState.value);
  const presaleStarted = useSelector(
    (state) => state.whitelistState.presaleStarted
  );
  const presaleEnded = useSelector(
    (state) => state.whitelistState.presaleEnded
  );
  const { NFTsContractSigner, NFTsContractProvider, Modal } = useHook();
  const onGoing = presaleStarted && !presaleEnded && presaleStarted != null;
  const [loading, setLoading] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);

  const mintHandler = async () => {
    try {
      setLoading(true);
      const NFTsContract = await NFTsContractSigner();
      let tx;
      if (isWhitelisted && onGoing) {
        tx = await NFTsContract.presaleMint(tokenId, {
          value: utils.parseEther("0.005"),
        });
      } else {
        tx = await NFTsContract.publicMint(tokenId, {
          value: utils.parseEther("0.01"),
        });
      }
      await tx.wait();
      setLoading(false);
      Modal("sucess", "You successfully minted a Crypto Dev!");
      setTokenExists(true);
    } catch (err) {
      console.log(err);
      Modal("error", "An Error Occured. Please try again later");
      setLoading(false);
    }
  };

  const checkTokenExists = useCallback(async () => {
    try {
      const NFTsContract = await NFTsContractProvider();
      const result = await NFTsContract.exists(Number(tokenId));
      setTokenExists(result);
      return result;
    } catch (err) {
      console.log(err);
      setTokenExists(false);
      return false;
    }
  }, [NFTsContractProvider, tokenId]);

  console.log(isWhitelisted);

  //
  useEffect(() => {
    if (presaleStarted) {
      checkTokenExists();
      const interval = setInterval(async () => {
        checkTokenExists();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [checkTokenExists, presaleStarted]);
  return (
    <div className="bg-[rgba(212,133,47)] rounded-lg shadow-2xl p-3 relative min-h-[300px]">
      {tokenExists && (
        <div className=" absolute w-full h-full bg-white opacity-50 left-0 top-0 rounded-lg z-10 flex">
          <span className=" text-red-600 text-5xl m-auto -rotate-45 font-bold ">
            sold out
          </span>
        </div>
      )}
      <Image
        src={imgName}
        alt="digital img"
        className="rounded-t-lg  bg-orange-200"
        width={!tokenExists && 500}
        height={!tokenExists && 500}
        layout={tokenExists && "fill"}
      />
      <div className={`p-2 ${tokenExists && "hidden"}`}>
        <div className="flex justify-between p-2  items-center">
          <div>Hero</div>
          <div>{onGoing ? 0.005 : 0.01} ether</div>
        </div>
        <button
          className={`bg-white rounded mt-4 px-4 py-2 w-full ${
            (!presaleStarted || isWhitelisted) &&
            "opacity-50 cursor-not-allowed"
          }`}
          onClick={mintHandler}
          disabled={!presaleStarted}
        >
          {loading ? <Loader /> : "Mint"}
        </button>
      </div>
    </div>
  );
};

export default Cards;
