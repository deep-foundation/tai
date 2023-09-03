import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { RecordButton } from '../record-button';
import { motion, useAnimation, useCycle } from 'framer-motion';
import { PiKeyboardThin } from 'react-icons/pi';
import { IconContext } from 'react-icons';

function IconKeyboard() {
	return(<IconContext.Provider value={{ color: "white", style: {width: '6rem', height: '4rem'} }}>
		<div>
			<PiKeyboardThin />
		</div>
	</IconContext.Provider>)
}

const MotionBox = motion(Box);

const variantsKeyboard = {
  noKB: { background: '#03001d' },
  keyboard: { 
		background: '#ff0000',
    transition: {
      type: "spring", bounce: 0.5, duration: 3,
    }
   },
	 initially: { 
		background: '#ff0000',
	},
};

function _Tab ({
	isProcessing,
  isRecording,
  handleClick,
	onClickKeyboard,
	state,
	stateVoice,
}:{
	isProcessing?: boolean;
  isRecording?: boolean;
  handleClick?: () => any;
	onClickKeyboard?: () => any;
	state?: string;
	stateVoice?: string;
}) {
	const control = useAnimation();

	useEffect(() => {
    if (state === 'keyboard') {
      control.start("noKB");
    } else {
      control.start("keyboard");
    }
  }, [state, control]);

    return(<Box
				display='flex'
				flexDir='row'
				width='14.8rem'
				height='max-content'
				zIndex={1}
				position='absolute'
				bottom='33vh'
				overflowX='hidden'
    		borderRadius='4rem'
			>
			<RecordButton isProcessing={isProcessing} isRecording={isRecording} handleClick={handleClick} stateVoice={stateVoice} />
			<MotionBox 
				as={motion.button}
				aria-label='keyboard button'
				animate={control}
				initial='initially'
				variants={variantsKeyboard}
				onClick={onClickKeyboard}
				sx={{
					width: '7.4rem',
					height: '7.4rem',
					_hover: {
						backgroundColor: '#03001d',
						scale: 0.65,
					},
					// backgroundColor: state === 'keyboard' ? '#ff0000' : '#03001d',
					borderTopLeftRadius: 0,
					borderTopRightRadius: '4rem',
					borderBottomLeftRadius: 0,
					borderBottomRightRadius: '4rem',
					boxShadow: 'rgb(9, 32, 9) 0px 0px 25px 7px inset, rgb(9, 32, 9) 0px 0px 6px 1px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>{<IconKeyboard />}</MotionBox>
		</Box>
	)
}

export const Tab = React.memo(_Tab);