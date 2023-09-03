import React, { useEffect, useState } from 'react';
import { IconButton, InputGroup, Input, InputRightElement } from '@chakra-ui/react';
import { TbSend } from 'react-icons/tb';
import { motion, useAnimation, animate } from 'framer-motion';


const transition = {
	type: "spring", bounce: 0.5, duration: 3
};
const variants = {
	hidden: { opacity: 0.3, y: '150%', transition },
	visible: { opacity: 1, y: '0%', transition },
};

export function InputChat ({
	sendMessage,
	openInput = false,
	value,
	onChange,
}:{
	sendMessage?: any;
	openInput?: boolean;
	value?: string;
	onChange?: any;
}) {
	const control = useAnimation();
	
	useEffect(() => {
		if (openInput) {	
			control.start("visible");
		} else {
			control.start("hidden");
		}
	}, [openInput, control]);

	return (<InputGroup 
			as={motion.div} 
			animate={control} 
			size='md'
			variants={variants}
			sx={{
				// position: 'absolute',
				// bottom: '1rem',
				width: '100%',
				color: 'white',
			}}
			initial={false}
		>
			<Input
				pr='4.5rem'
				type='text'
				placeholder='Enter your request'
				value={value}
				onChange={onChange}
				sx={{
					_focus: {
						borderColor: 'white',
						backgroundColor: '#2a4a3c',
						color: 'whiteText',
					},
				}}
			/>
      <InputRightElement width='4.5rem'>
				<IconButton 
					aria-label='send message button' 
					isRound variant='ghost' size="md" 
					sx={{
						
					}}
					color="white" 
					background='transparent'
					onClick={sendMessage} icon={<TbSend />} 
				/>
      </InputRightElement>
    </InputGroup>
	)
}

export const MemoizedInputChat = React.memo(InputChat);
