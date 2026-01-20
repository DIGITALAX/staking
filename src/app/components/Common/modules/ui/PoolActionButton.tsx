"use client";

import Image from "next/image";
import { INFURA_GATEWAY } from "@/app/lib/constants";

type PoolActionButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  showIcon?: boolean;
};

const sizeClasses: Record<NonNullable<PoolActionButtonProps["size"]>, string> = {
  sm: "text-[0.6rem] md:text-xs pb-1 pt-1 pl-2.5 pr-1",
  md: "text-xs md:text-sm pb-1 pt-1 pl-3 pr-1",
};

const PoolActionButton = ({
  label,
  onClick,
  disabled,
  size = "md",
  className,
  type = "button",
  showIcon = true,
}: PoolActionButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-fit h-fit grid grid-flow-col auto-cols-auto cursor-pointer active:scale-95 rounded-md disabled:opacity-50 ${className ?? ""}`}
    >
      <Image
        src={`${INFURA_GATEWAY}/ipfs/QmTLN24oXMbEj3QgHX7dD3GWnYwL2GqsP16yvLzm29bk5X`}
        alt="button background"
        fill
        className="absolute object-cover object-center"
        draggable={false}
      />
      <div
        className={`relative w-full h-full col-start-1 grid grid-flow-col auto-cols-auto gap-3 rounded-tr-md border-white border-t-2 border-r-2 ${sizeClasses[size]}`}
      >
        {showIcon && (
          <span className="relative col-start-1 place-self-center w-fit h-fit text-white">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height={size === "sm" ? 12 : 15}
              width={size === "sm" ? 12 : 15}
              aria-hidden="true"
            >
              <path d="M8 16a4 4 0 0 0 4-4 4 4 0 0 0 0-8 4 4 0 0 0-8 0 4 4 0 1 0 0 8 4 4 0 0 0 4 4zm3-12c0 .073-.01.155-.03.247-.544.241-1.091.638-1.598 1.084A2.987 2.987 0 0 0 8 5c-.494 0-.96.12-1.372.331-.507-.446-1.054-.843-1.597-1.084A1.117 1.117 0 0 1 5 4a3 3 0 0 1 6 0zm-.812 6.052A2.99 2.99 0 0 0 11 8a2.99 2.99 0 0 0-.812-2.052c.215-.18.432-.346.647-.487C11.34 5.131 11.732 5 12 5a3 3 0 1 1 0 6c-.268 0-.66-.13-1.165-.461a6.833 6.833 0 0 1-.647-.487zm-3.56.617a3.001 3.001 0 0 0 2.744 0c.507.446 1.054.842 1.598 1.084.02.091.03.174.03.247a3 3 0 1 1-6 0c0-.073.01-.155.03-.247.544-.242 1.091-.638 1.598-1.084zm-.816-4.721A2.99 2.99 0 0 0 5 8c0 .794.308 1.516.812 2.052a6.83 6.83 0 0 1-.647.487C4.66 10.869 4.268 11 4 11a3 3 0 0 1 0-6c.268 0 .66.13 1.165.461.215.141.432.306.647.487zM8 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          </span>
        )}
        <span className="relative col-start-2 place-self-center w-fit h-fit text-white font-digiB uppercase tracking-[0.12em]">
          {label}
        </span>
      </div>
    </button>
  );
};

export default PoolActionButton;
