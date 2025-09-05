// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";

// type Props = {
//   open?: boolean;
//   onClose?: () => void;
// };

// const recommended = [
//   { name: "Adi", game: "IRL", viewers: "79", avatar: "/avatars/adi.jpg" },
//   { name: "justketh", game: "IRL", viewers: "47", avatar: "/avatars/justketh.jpg" },
//   // …completează cum vrei
// ];

// export default function Sidebar({ onClose }: Props) {
//   const [open, setOpen] = useState(false);
//   useEffect(() => {
//     const handler = () => setOpen((v) => !v);
//     window.addEventListener("toggle-sidebar", handler);
//     return () => window.removeEventListener("toggle-sidebar", handler);
//   }, []);

//   const close = () => {
//     setOpen(false);
//     onClose?.();
//   };

//   // container general (desktop fixed + mobile drawer)
//   return (
//     <>
//       {/* Desktop sidebar */}
//       <aside
//         className="
//           hidden lg:flex lg:fixed lg:top-12 lg:bottom-0 lg:left-0
//           lg:w-64 xl:w-72 flex-col border-r border-neutral-800
//           bg-neutral-900/60 backdrop-blur px-3 pt-3
//         "
//       >
//         <NavContent />
//       </aside>

//       {/* Mobile overlay + drawer */}
//       <div
//         className={`lg:hidden fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
//         aria-hidden={!open}
//       >
//         {/* overlay */}
//         <div
//           className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
//           onClick={close}
//         />
//         {/* drawer */}
//         <div
//           className={`absolute top-0 bottom-0 left-0 w-72 max-w-[85vw]
//                       border-r border-neutral-800 bg-neutral-900
//                       transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
//         >
//           <div className="px-3 pt-3">
//             <NavContent onItemClick={close} />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// function NavContent({ onItemClick }: { onItemClick?: () => void }) {
//   return (
//     <div className="flex flex-col gap-2">
//       {/* Primary */}
//       <Link
//         href="/"
//         onClick={onItemClick}
//         className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-neutral-800/70 aria-[current=page]:bg-neutral-800 font-medium"
//         aria-current="page"
//       >
//         <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-800">🏠</span>
//         Home
//       </Link>
//       <Link
//         href="/browse"
//         onClick={onItemClick}
//         className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-neutral-800/70"
//       >
//         <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-800">🧭</span>
//         Browse
//       </Link>
//       <Link
//         href="/following"
//         onClick={onItemClick}
//         className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-neutral-800/70"
//       >
//         <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-neutral-800">🤝</span>
//         Following
//       </Link>

//       <div className="my-3 h-px bg-neutral-800" />

//       {/* Recommended */}
//       <div className="px-3 pb-2 text-xs font-semibold text-neutral-400">Recommended</div>
//       <ul className="space-y-1 pb-3">
//         {recommended.map((r) => (
//           <li key={r.name}>
//             <Link
//               href={`/channel/${encodeURIComponent(r.name)}`}
//               onClick={onItemClick}
//               className="group flex items-center justify-between gap-2 rounded-md px-3 py-2 hover:bg-neutral-800/70"
//             >
//               <div className="flex items-center gap-3 min-w-0">
//                 {/* pentru simplitate, folosim <img> pt. avatars ca să evităm config extra */}
//                 <img src={r.avatar} alt={r.name} className="h-7 w-7 rounded-full object-cover" />
//                 <div className="min-w-0">
//                   <div className="truncate text-sm font-medium group-hover:text-white">{r.name}</div>
//                   <div className="truncate text-[11px] text-neutral-400">{r.game}</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 text-xs text-neutral-300">
//                 <span className="h-2 w-2 rounded-full bg-lime-400" />
//                 {r.viewers}
//               </div>
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
