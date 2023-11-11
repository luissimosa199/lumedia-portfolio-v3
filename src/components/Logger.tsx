"use client";
import React from "react";

const Logger = ({ message }: { message: string }) => {
  return (
    <button
      onClick={() => {
        console.log(message);
      }}
      className="border rounded-full w-24 h-24 bg-black text-white"
    >
      Log
    </button>
  );
};

export default Logger;
