/* 
SwagTag.tsx: Component for the swag tag
---------------------------------------
EXAMPLE USAGE:
<SwagTag text="255" />
*/

import { LightningBoltIcon } from "@/lib/icons"

export default function SwagTag ({text}: {text: string}) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-2 bg-[#654DC4] rounded-full">
      <span className="text-white font-medium">{text}</span>
      <LightningBoltIcon className="h-5 w-5 text-yellow-300" />
    </div>
  )
}