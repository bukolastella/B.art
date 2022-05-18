import Image from "next/image";
import React from "react";
import Cards from "./Cards";

const MainPage = () => {
  return (
    <div className="p-20 bg-[rgba(211,219,206)]">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3  md:grid-cols-4 gap-10">
        <Cards />
        <Cards />
        <Cards />
        <Cards />
        <Cards />
        <Cards />
        <Cards />
      </div>
    </div>
  );
};

export default MainPage;
