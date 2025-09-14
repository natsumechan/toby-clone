import * as React from 'react'

export type LucideProps = React.SVGProps<SVGSVGElement> & { size?: number | string }

function createIcon(path: React.ReactNode) {
  return function Icon({ size = 16, strokeWidth = 2, ...props }: LucideProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth as number}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {path}
      </svg>
    )
  }
}

export const Plus = createIcon(<path d="M12 5v14M5 12h14" />)
export const Star = createIcon(<path d="M12 17.75 5.5 21l1.25-7.25L2 8.75l7.25-1.05L12 1.5l2.75 6.2 7.25 1.05-4.75 5 1.25 7.25z" />)
export const StarOff = createIcon(
  <g>
    <path d="M19.5 9.5 12 10.6 9.5 5.5 12 1.5l2.75 6.2 6.75.98-3.27 3.44" />
    <path d="M2 2l20 20" />
  </g>
)
export const Trash2 = createIcon(
  <g>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </g>
)
export const ExternalLink = createIcon(
  <g>
    <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </g>
)
export const Edit = createIcon(
  <g>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </g>
)
export const Copy = createIcon(
  <g>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </g>
)
export const GripVertical = createIcon(
  <g>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </g>
)
export const MoreHorizontal = createIcon(
  <g>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </g>
)
export const Globe = createIcon(
  <g>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
  </g>
)
export const Check = createIcon(<path d="M20 6L9 17l-5-5" />)
export const Circle = createIcon(<circle cx="12" cy="12" r="3" />)
export const X = createIcon(
  <g>
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </g>
)
export const ChevronRight = createIcon(<polyline points="9 18 15 12 9 6" />)

export default {}
