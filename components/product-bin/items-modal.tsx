import { Box, Button, Text, IconButton, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useState, useRef } from 'react';
import { TfiClose } from 'react-icons/tfi';
import { MdOutlineLocalGroceryStore } from 'react-icons/md';

function ItemsModal({ 
  deep, 
  isOpen, 
  addToCart, 
  // onRequestClose, 
  items, 
  style, 
  onClose, 
  chatNumber, 
}:{
  deep: any;
  isOpen: boolean;
  addToCart: any;
  // onRequestClose: any;
  items: Array<any>;
  style: any;
  onClose: any;
  chatNumber: number;
}) {
  const [showChatNumber, setShowChatNumber] = useState(false);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [isBuyButtonLoading, setBuyButtonLoading] = useState(false);

  const initialRef = useRef(null);
  const finalRef = useRef(null);

  const addToCartWithDelay = async (itemLinkId) => {
    setDisabledButtons(prevState => ({ ...prevState, [itemLinkId]: true }));
    await addToCart(itemLinkId);
    setTimeout(() => {
      setDisabledButtons(prevState => ({ ...prevState, [itemLinkId]: false }));
    }, 1000);
  };


  const handleBuy = async () => {
    setBuyButtonLoading(true);
    const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
    const shoppingCartTypeLinkId = await deep.id("@flakeed/loyverse", "ShoppingCart");
    const waitForConfirmPurchaseTypeLinkId = await deep.id("@flakeed/loyverse", "WaitForConfirmPurchase");
    const { data: checkDataLinkId } = await deep.select({
      id: chatNumber,
      in: {
        type_id: containTypeLinkId,
        from_id: deep.linkId,
      },
      order_by: { id: 'asc' }
    }, {
      returning: `
          id
          value
          shoppingCart: in(where: { type_id: { _eq: ${shoppingCartTypeLinkId} } }) {
              id
              type_id
              from_id
              to_id
              value
          }
          WaitForConfirmPurchase: in(where: { type_id: { _eq: ${waitForConfirmPurchaseTypeLinkId} } }) {
            id
            type_id
            from_id
            to_id
            value
        }
      `
    });

    const cartItems = checkDataLinkId[0]?.shoppingCart[0]?.value?.value;
    if (!cartItems || cartItems.length === 0) {
      alert("Your shopping cart is empty. Please add items before purchase.");
      setBuyButtonLoading(false);
      return;
    }

    const purchaseRecords = checkDataLinkId[0]?.WaitForConfirmPurchase;
    if (purchaseRecords && purchaseRecords.length > 0) {
      alert("You've already made a purchase. Go to the seller or remember your current number and continue in the new chat by clicking on the cross to make a purchase in a new session, then go to the seller with these 2 numbers");
      setBuyButtonLoading(false);
      return;
    }

    setShowChatNumber(true);
    await deep.insert({
      type_id: waitForConfirmPurchaseTypeLinkId,
      from_id: chatNumber,
      to_id: chatNumber,
      in: {
        data: {
          type_id: containTypeLinkId,
          from_id: deep.linkId,
        },
      },
    });
    setTimeout(() => {
      setBuyButtonLoading(false);
    }, 1000);
  };

  return (<Modal
      size='xl'
      initialFocusRef={initialRef}
      finalFocusRef={finalRef}
      isOpen={isOpen}
      onClose={onClose}
      motionPreset='slideInBottom'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose</ModalHeader>
        <ModalCloseButton />
        <ModalBody p='1.5rem' backgroundColor='#2a5d34'>
          <Box sx={{ width: '100%', height: '100%', overflowY: 'auto' }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              margin: 'auto',
              zIndex: 1001,
              overflowY: 'auto',
              '& > *:not(:last-of-type)': {
                marginBottom: '1rem',
              },
            }}>
              {items.map((item, index) => (
                <Box key={item.id} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  backgroundColor: index % 2 === 0 ? '#E8F5E9' : '#F1F8E9',
                  borderRadius: '1rem',
                  width: '100%',
                  padding: '1rem',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}>
                  <Text as='h2' sx={{ fontSize: '1.4rem', color: '#388E3C', marginBottom: '0.5rem' }}>{item.itemName}</Text>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={item.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><text x="50" y="60" font-family="Arial" font-size="40" text-anchor="middle" fill="white">?</text></svg>'}
                      alt={item.itemName}
                      width="100"
                      height="100"
                      style={{ borderRadius: '8rem' }}
                    />
                    <Box sx={{ flex: 1, marginLeft: '1rem', display: 'flex', flexDir: 'column', alignItems: 'flex-end' }}>
                      <Box sx={{ fontSize: '1.1rem', color: '#2E7D32', fontWeight: 'bold' }}>Price: {item.price || 'N/A'}</Box>
                      <Button
                        onClick={() => addToCartWithDelay(item.linkId)}
                        disabled={disabledButtons[item.linkId]}
                        sx={{
                          background: 'linear-gradient(90deg, #388E3C, #4CAF50)',
                          color: 'white',
                          padding: '0.8rem 1rem',
                          borderRadius: '0.5rem',
                          border: '2px solid #2E7D32',
                          cursor: disabledButtons[item.linkId] ? 'not-allowed' : 'pointer',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '7.5rem',
                          opacity: disabledButtons[item.linkId] ? 0.7 : 1,
                          _hover: {
                            transform: disabledButtons[item.linkId] ? 'scale(1)' : 'scale(1.05)',
                            boxShadow: disabledButtons[item.linkId] ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 6px 8px rgba(0, 0, 0, 0.2)',
                          }
                        }}
                        leftIcon={<MdOutlineLocalGroceryStore />}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter>
          {!showChatNumber ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#A8D5BA',
                padding: '0.3rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                width: '100%',
                marginRight: '1rem',
                '& > *:nth-child(1)': {
                  marginRight: '1rem',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  '& > *:nth-child(1)': {
                    marginTop: '0.2rem',
                  },
                }}
              >
                <Text as='h1' textStyle='h1'>Your Number:</Text>
                <Box sx={{ fontSize: '1rem', fontWeight: 'bold' }}>{chatNumber}</Box>
              </Box>
              <Button
                onClick={() => setShowChatNumber(false)}
                sx={{
                  background: '#388E3C',
                  color: 'white',
                  padding: '0.8rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Confirm
              </Button>
            </Box>
          ) : null}
          <Button onClick={handleBuy} 
            ref={initialRef}
            sx={{
              background: 'linear-gradient(45deg, #006400, #228B22)',
              color: 'white',
              padding: '1rem 2rem',
              cursor: isBuyButtonLoading ? 'not-allowed' : 'pointer',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)',
              opacity: isBuyButtonLoading ? 0.7 : 1,
              _hover: {
                transform: isBuyButtonLoading ? 'scale(1)' : 'scale(1.05)',
                boxShadow: isBuyButtonLoading ? '0 0 15px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.4)',
                backgroundColor: isBuyButtonLoading ? '#006400' : '#4CAF50',
              }
            }}
          >
            Buy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const MemoizedItemsModal = React.memo(ItemsModal);