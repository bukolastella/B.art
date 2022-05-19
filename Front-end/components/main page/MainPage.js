import Image from "next/image";
import React from "react";
import Cards from "./Cards";
import img1 from "../../public/1.svg";
import img2 from "../../public/2.svg";
import img3 from "../../public/3.svg";
import img4 from "../../public/4.svg";
import img5 from "../../public/5.svg";
import img6 from "../../public/6.svg";
import img7 from "../../public/7.svg";
import img8 from "../../public/8.svg";
import img9 from "../../public/9.svg";

const MainPage = () => {
  const renderCards = () => {
    let arr = [];
    for (let index = 1; index < 9; index++) {
      arr.push(<Cards imgName={index} />);
    }
    return arr;
  };

  return (
    <div className="p-20 bg-[rgba(211,219,206)]">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3  md:grid-cols-4 gap-10">
        {[img1, img2, img3, img4, img5, img6, img7, img8, img9].map((ev, i) => (
          <Cards imgName={ev} key={i} />
        ))}
      </div>
    </div>
  );
};

export default MainPage;
