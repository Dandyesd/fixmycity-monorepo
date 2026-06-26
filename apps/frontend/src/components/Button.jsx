import React from "react";
import { Link } from "react-router-dom";

export default function Button({ condition, title, to, className="" }) {
  if (condition ? true : false) {
    return (
      <Link 
      to={to}
      className={`${className} bg-(--btn-primary) text-white font-bold py-4 px-5 rounded-full 
      hover:bg-(--btn-primary-hover) transition duration-300 ease-in-out`}
      >
        {title}
      </Link>
    );
  } else
    return (
      <Link
      to={to}
      className={`${className} bg-(--btn-secondary) text-white font-bold py-4 px-5 rounded-full 
      hover:bg-(--btn-secondary-hover) transition duration-300 ease-in-out `}
      >
        {title}
      </Link>
    );
}
