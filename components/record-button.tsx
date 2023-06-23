import { Box, IconButton, Text } from "@chakra-ui/react";
import { motion, useSpring, useTransform } from "framer-motion";
import React, { useState } from "react";
// @ts-ignore
import { PiMicrophoneSlashThin, PiMicrophoneThin } from "react-icons/pi";

export const RecordButton = ({
  isProcessing,
  isRecording,
  handleClick,
}:{
  isProcessing?: boolean;
  isRecording?: boolean;
  handleClick?: () => any;
}) => {
  const top = window.innerHeight / 2;
  return (<IconButton
      as={motion.button}
      aria-label='record button'
      // @ts-ignore
      icon={isProcessing ? <ProcessButton isProcessing={isProcessing} /> : (isRecording ? <PiMicrophoneThin size='3rem' color='#fff' /> : <PiMicrophoneSlashThin size='3rem' color='#fff' />)}
      isRound
      animate={{scale: isRecording ? [1, 0.5, 1.5, 0.5, 1] : 1}}
      // @ts-ignore
      transition={{ type: "spring", duration: 5, bounce: 0.6, repeat: Infinity }}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        width: '150px',
        height: '150px',
        top: top,
        backgroundColor: isProcessing ? '#dae1d3' : (isRecording ? '#306604' : '#0080ff'),
        _hover: { backgroundColor: isProcessing ? '#cce0b8' : (isRecording ? '#306604' : '#193f64') }
      }}
      onClick={handleClick}
      >
    </IconButton>)
}

const ProcessButtonRound = ({isProcessing}:{isProcessing: boolean}) => {
  // const yRange = useTransform(isProcessing, [0, 0.9], [0, 1]);
  // const pathLength = useSpring(yRange, { stiffness: 400, damping: 90 });
  return (<svg className="progress-icon" viewBox="0 0 60 60">
      <motion.path
        fill="none"
        strokeWidth="5"
        stroke="white"
        strokeDasharray="0 1"
        d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
        style={{
          // pathLength,
          rotate: 90,
          translateX: 5,
          translateY: 5,
          scaleX: -1 // Reverse direction of line animation
        }}
      />
      <motion.path
        fill="none"
        strokeWidth="5"
        stroke="white"
        d="M14,26 L 22,33 L 35,16"
        initial={false}
        strokeDasharray="0 1"
        animate={{ pathLength: isProcessing ? 1 : 0 }}
      />
    </svg>
  )
}

const ProcessButton = ({isProcessing}:{isProcessing: boolean}) => {

  return (<Box
      sx={{
        display: 'flex',
        placeItems: 'center',
        placeContent: 'center',
        width: '7rem',
        height: '7rem',
      }}
    >
      <motion.svg
        viewBox="0 0 150 120"
        width='100%'
        height='100%'
        strokeMiterlimit="10"
      >
        <motion.path
          width='100%'
          height='100%'
          overflow='visible'
          fill="none" 
          opacity="1" 
          stroke="#10003f" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1rem"
          animate={{
            d: [
              'M10.8541 57.2243C10.8541 57.2243 35.7263 6.03219 43.5733 5.5782C54.2213 4.96216 60.143 17.6319 72.3523 52.8514C87.9794 97.9299 97.215 117.687 107.58 114.012C114.195 111.666 128.027 78.1259 139.146 41.4687',
              'M12.3541 62.7757C12.3541 62.7757 37.2263 113.968 45.0733 114.422C55.7213 115.038 61.643 102.368 73.8523 67.1486C89.4794 22.0701 98.715 2.31275 109.08 5.98839C115.695 8.33407 129.527 41.8741 140.646 78.5313',
              'M10.8541 57.2243C10.8541 57.2243 35.7263 6.03219 43.5733 5.5782C54.2213 4.96216 60.143 17.6319 72.3523 52.8514C87.9794 97.9299 97.215 117.687 107.58 114.012C114.195 111.666 128.027 78.1259 139.146 41.4687',
            ]
          }}
          transition={{
            repeat: Infinity,
            ease: "easeInOut",
            duration: 3,
            times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 0.95, 1, 0.95, 0.83, 0.66, 0.5, 0.33, 0.16, 0],
          }}
        />
      </motion.svg>
    </Box>
  )
}