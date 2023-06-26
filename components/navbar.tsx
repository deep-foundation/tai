import { HStack, Link, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

export function NavBar({ }) {
  return (<>
      <HStack>
        <Link as={NextLink} href='/' style={{color: 'antiquewhite', zIndex: 1}}>
          Home
        </Link>
      </HStack>
    </>
  )
}