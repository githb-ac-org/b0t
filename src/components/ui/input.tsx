import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-black placeholder:text-gray-400 selection:bg-blue-500 selection:text-white bg-white border-gray-300 h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm text-black shadow-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-gray-400 focus-visible:ring-2 focus-visible:ring-gray-400/50",
        "hover:border-gray-400",
        className
      )}
      {...props}
    />
  )
}

export { Input }
