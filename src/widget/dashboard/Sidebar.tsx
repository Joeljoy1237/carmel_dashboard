'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { BiLogOut } from "react-icons/bi";
import { FaHome } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";
import easyToast from "@components/CustomToast";
import { FaUser } from "react-icons/fa";

export default function Sidebar() {
  const location = usePathname();
  const router = useRouter();
  const menuItems = [
    {
      title: "Home",
      link: "/dashboard/home",
      icon: <FaHome className="text-[22px]" />,
    },
    {
      title: "Faculty",
      link: "/dashboard/faculty",
      icon: <FaUser className="text-[22px]" />,
    },
    // {
    //   title: "Drafts",
    //   link: "/dashboard/drafts",
    //   icon: <MdScheduleSend className="text-[22px]" />,
    // },
  ];

  return (
    <div className="w-[15vw] h-screen fixed border border-r-gray-200 bg-white md:flex lg:flex lg:flex-col md:flex-col hidden px-6 py-8 justify-between">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center mb-4">
          <Image
            src={"/logomain.png"}
            alt="Profile"
            width={1000}
            height={1000}
            className="object-cover max-h-16 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="text-center px-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-800 line-clamp-2 text-center px-2">Welcome, Carmel College!</h2>
        </div>
        <nav className="flex flex-col gap-2 mt-2">
          {menuItems?.map((menuItem, index) => (
            <Link
              className={`flex flex-row items-center gap-3 text-lg py-3 px-4 rounded-lg relative w-full transition-colors duration-150
                ${location?.includes(menuItem?.link)
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"}
              `}
              key={index}
              href={menuItem?.link}
            >
              {location === menuItem?.link && (
                <div className="h-full w-2 rounded-r-[20px] absolute left-[-1px] top-0 bg-blue-500"></div>
              )}
              <div className="flex mt-[-2px]">{menuItem?.icon}</div>
              <span className="text-[1.1rem]">{menuItem?.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-center w-full mt-8">
        <button
          onClick={() => {
            const auth = getAuth();
            signOut(auth)
              .then(() => {
                router.push("/");
                console.log("User signed out");
                easyToast({
                      message: "Logout Successful",
                      type: "success",
                    });
              })
              .catch((error) => {
                console.error("Error signing out:", error);
              });
          }}
          className="flex items-center justify-center w-full py-3 text-red-600 font-medium gap-2 rounded-[10px] bg-red-100 hover:bg-red-200 transition-colors duration-150"
        >
          <BiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
