import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  cssVarPrefix: 'MaryJane',
}

const themeChakra = extendTheme({ 
  config,
  semanticTokens: {
    fontSizes: {
      xxs: '0.55rem',
    },
    colors: {
      error: 'red.500',
      // text: {
      //   default: 'grayText',
      //   _dark: 'whiteText',
      // },
      borderColor: {
        default: '#d2cece',
        _dark: '#718096',
      },
      backgroundModal: {
        default: 'blue.50',
        _dark: 'blue.900',
      },
      bgColor: {
        default: '#edf2f7',
        _dark: 'gray.900',
      },
      borderInputMessage: {
        default: '#e6e6e6',
        _dark: '#29303b'
      },
      sendMessagePlane: {
        default: 'gray.700',
        _dark: 'whiteText',
      }
    },
  },
  colors: {
    blue: {
      900: '#19202B',
    },
    grayText: '#3a3a3a',
    whiteText: '#ebf8ff',
    gray: {
      10: '#eeeeee',
      900: '#111720',
    },
  },
  space: {
    4.5: '1.125rem',
  },
  components: {
    Tabs: {
      variants: {
        'enclosed': {
          borderBottomColor: 'none', 
          borderColor: 'none',
        },
        
        sm: {
          fontSize: '0.4rem',
          px: 1, // <-- px is short for paddingLeft and paddingRight
          py: 1, // <-- py is short for paddingTop and paddingBottom
        },
      },
    },
    
    Button: {
      variants: {
        unstyled: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 0',
        },
        ghost: {  
          backgroundColor: 'transparent',
          _focus: {
            backgroundColor: 'transparent',
          },
          _active: {
            backgroundColor: 'transparent',
          },
          _hover: {
            backgroundColor: '#426e4530',
          },
        },
      },       
    }
  }
})

export default themeChakra