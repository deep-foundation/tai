import { Box, IconButton, Text } from "@chakra-ui/react";
import { motion, useAnimation, useSpring, useTransform } from "framer-motion";
import React, { useEffect, useState } from "react";
// @ts-ignore
import { PiMicrophoneSlashThin, PiMicrophoneThin } from "react-icons/pi";


const variants = {
  noRecord: { scale: 1 },
  recording: { 
    scale: [1, 0.85, 1.15, 0.85, 1],
    transition: {
      repeat: Infinity,
      type: "spring",
      bounce: 0.5,
      duration: 3,
      times: [0, 0.16, 0.33, 0.5, 0.66, 0.83, 0.95, 1, 0.95, 0.83, 0.66, 0.5, 0.33, 0.16, 0]
    }
   },
};
export const RecordButton = ({
  isProcessing,
  isRecording,
  handleClick,
}:{
  isProcessing?: boolean;
  isRecording?: boolean;
  handleClick?: () => any;
}) => {
  const control = useAnimation();

  useEffect(() => {
    if (isRecording && !isProcessing) {
      control.start("recording");
    } else {
      control.start("noRecord");
    }
  }, [isRecording, isProcessing]);

  return (<IconButton
      as={motion.button}
      aria-label='record button'
      // @ts-ignore
      icon={isProcessing ? <ProcessButton isProcessing={isProcessing} /> : (isRecording ? <PiMicrophoneThin size='3rem' color='#fff' /> : <PiMicrophoneSlashThin size='3rem' color='#fff' />)}
      isRound
      animate={control}
      variants={variants}
      sx={{
        position: 'absolute',
        zIndex: 1000,
        width: '150px',
        height: '150px',
        bottom: '35vh',
        boxShadow: isProcessing ? 'rgb(9, 32, 9) 0px 0px 25px 7px inset, rgb(9, 32, 9) 0px 0px 6px 1px' : (isRecording ? 'rgb(9, 32, 9) 0px 0px 25px 7px inset, rgb(9, 32, 9) 0px 0px 5px 0px' : 'inset 0px 0px 25px 7px #03001d, 0px 0px 2px 0px #03001d'),
        backgroundColor: isProcessing ? '#dae1d3' : (isRecording ? '#306604' : '#0080ff'),
        _hover: { 
          backgroundColor: isProcessing ? '#cce0b8' : (isRecording ? '#306604' : '#03001d') ,
          scale: (!isRecording && !isProcessing) ? 0.65 : 1,
        }
      }}
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      >
    </IconButton>)
}

const ProcessButton = () => {

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