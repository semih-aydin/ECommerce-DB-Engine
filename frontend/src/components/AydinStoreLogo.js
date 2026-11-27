export default function AydinStoreLogo({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg
        width="34"
        height="34"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="36" height="36" rx="10" fill={dark ? "#FFFFFF" : "#1D1D1F"} />
        <path
          d="M18 7.5L9.5 27H13.6L15.3 22.8H20.7L22.4 27H26.5L18 7.5ZM16.4 19.6L18 15.2L19.6 19.6H16.4Z"
          fill={dark ? "#1D1D1F" : "#FFFFFF"}
        />
        <circle cx="27.5" cy="8.5" r="2.5" fill="#0071E3" />
      </svg>

      <div className="text-xl font-semibold tracking-[-0.025em] leading-none">
        <span className={dark ? "text-white" : "text-[#1D1D1F]"}>Aydın</span>
        <span className="text-[#0071E3]">Store</span>
      </div>
    </div>
  );
}
