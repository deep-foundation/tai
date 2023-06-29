import React from "react";

export const BubbleArrowRight = React.memo<any>(({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  return ( <svg
      width={width}
      height={height}
      {...props}
      style={{
        flex: 1
      }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
        d="M6.991.597Q7 5.126 7.817 6.928q.817 1.802 3.519 3.887c.223.171.177.342-.101.38q-3.837.525-6.033-.275-2.196-.801-4.679-2.822L6.991.597z" 
      />
    </svg>
  )
})

export const BubbleArrowLeft = React.memo<any>(({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  return (<svg
      width={width}
      height={height}
      {...props}
      style={{
        flex: 1
      }}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
        d="M5.009.597Q5 5.126 4.183 6.928 3.366 8.73.664 10.815c-.223.171-.177.342.101.38q3.837.525 6.033-.275 2.196-.801 4.679-2.822L5.009.597z" 
      />
    </svg>
  )
})