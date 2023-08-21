import {
    Box,
    Heading,
    VStack,
    Button,
    Center,
    Text,
    List,
    ListItem,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Container,
        Modal,
        ModalOverlay,
        ModalContent,
        ModalHeader,
        ModalFooter,
        ModalBody,
        ModalCloseButton,
        useDisclosure
} from '@chakra-ui/react';
import {
    DeepClient,
    useDeep,
} from '@deep-foundation/deeplinks/imports/client';
import { generateApolloClient } from '@deep-foundation/hasura/client.js';
import { useLocalStore } from '@deep-foundation/store/local';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import React, { useEffect, useRef, useState } from 'react';
import { BackgroundProbableQuestions } from '../components/background-probable-questions';
import { ScreenChat } from '../components/chat/screen-chat';
import { NavBar } from '../components/navbar';
import { Page } from '../components/page';
import { RecordButton } from '../components/record-button';
import createContainer from '../imports/capacitor-voice-recorder/create-container';

const assert = require('assert');

export const SellerWorkspace = React.memo<any>(() => {
  const [conversationTypeLinkId, setConversationTypeLinkId] = useState(0);
const [waitForConfirmPurchaseTypeId, setWaitForConfirmPurchaseTypeId] = useState(0);
const [confirmPurchaseTypeLinkId, setConfirmPurchaseTypeLinkId] = useState(0);
const [selectedChatId, setSelectedChatId] = useState(0);


  const [shoppingCartData, setShoppingCartData] = useState<any[]>([]);
    useEffect(() => {
        defineCustomElements(window);
    }, []);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handlePurchaseConfirmation = async() => {
      if (!selectedChatId) return;
  console.log("shoppingCartData",shoppingCartData)
      const cartData = shoppingCartData.find(cart => cart.from_id === selectedChatId);
      if (!cartData) {
          console.error("Не удалось найти данные корзины для chatId:", selectedChatId);
          return;
      }
  console.log("cartData",cartData)
      const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
  
      console.log(`Покупка подтверждена для чата с ID: ${selectedChatId}`);
      await deep.insert({
          type_id: await deep.id("@flakeed/loyverse", "ConfirmPurchase"),
          from_id: selectedChatId,
          to_id: cartData.id,
          in: {
              data: {
                  type_id: containTypeLinkId,
                  from_id: deep.linkId,
              }
          },
      });
  
      console.log("Данные корзины:", cartData);
  
      setSelectedChatId(0); 
      onClose(); 
  };
  
  
    const handleConfirmPurchase = (chatId) => {
      setSelectedChatId(chatId); 
      onOpen(); 
      console.log(`Подтверждение покупки для чата с ID: ${chatId}`);
  };
  
    
    let deep = useDeep();

useEffect(() => {
    const fetchData = async () => {
        const containTypeLinkId = await deep.id("@deep-foundation/core", "Contain");
        const newWaitForConfirmPurchaseTypeId = await deep.id("@flakeed/loyverse", "WaitForConfirmPurchase");
        const shoppingCartTypeId = await deep.id("@flakeed/loyverse", "ShoppingCart");
        const newConversationTypeLinkId = await deep.id("@deep-foundation/chatgpt","Conversation");
        const confirmPurchaseTypeId = await deep.id("@flakeed/loyverse", "ConfirmPurchase");
        setConfirmPurchaseTypeLinkId(confirmPurchaseTypeId)
        setConversationTypeLinkId(newConversationTypeLinkId);
        setWaitForConfirmPurchaseTypeId(newWaitForConfirmPurchaseTypeId);

        const { data: checkDataLinkId } = await deep.select({
            type_id: conversationTypeLinkId,
            in: {
                type_id: containTypeLinkId,
                from_id: deep.linkId,
            },
            order_by: { id: 'asc' }
        }, {
            returning: `
                id
                value
                waitForConfirmPurchase: in(where: { type_id: { _eq: ${waitForConfirmPurchaseTypeId} } }) {
                    id
                    type_id
                    from_id
                    to_id
                    value
                }
                shoppingCart: in(where: { type_id: { _eq: ${shoppingCartTypeId} } }) {
                    id
                    type_id
                    from_id
                    to_id
                    value
                }
                confirmPurchase: in(where: { type_id: { _eq: ${confirmPurchaseTypeLinkId} } }) {
                    id
                    type_id
                    from_id
                    to_id
                    value
                }
            `
        });

        console.log("checkDataLinkId", checkDataLinkId);

        if (checkDataLinkId && checkDataLinkId.length > 0) {
            const validCarts = checkDataLinkId.filter(item => item.waitForConfirmPurchase && item.waitForConfirmPurchase.length > 0 && item.confirmPurchase && item.confirmPurchase.length===0);
            const updatedShoppingCartData = validCarts.map(item => item.shoppingCart).flat();
            setShoppingCartData(updatedShoppingCartData);
        }        
    };

    fetchData();
}, [conversationTypeLinkId, waitForConfirmPurchaseTypeId, confirmPurchaseTypeLinkId,selectedChatId]);

  console.log("shoppingCartData",shoppingCartData)
      
    const extractShoppingCartData = (cart) => {
      return cart.map(item => {
        const innerValue = item.value && item.value.value && item.value.value[0];
        const variants = innerValue && innerValue.variants && innerValue.variants[0];
    
        return {
          chatId: item.from_id,
          itemName: innerValue ? innerValue.item_name : undefined,
          quantity: innerValue ? innerValue.quantity || 0 : 0,
          price: variants ? variants.default_price || 0 : 0,
        };
      });
    };
    
    const fetchData = async () => {
      setConversationTypeLinkId(0)
    };

const itemsData = extractShoppingCartData(shoppingCartData);

console.log("itemsData",itemsData)
return (
  <>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
              <ModalHeader>Purchase confirmation</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  Are you sure you want to confirm this purchase?
              </ModalBody>
  
              <ModalFooter>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button colorScheme="green" mr={3} onClick={handlePurchaseConfirmation}>
    Confirm
</Button>

              </ModalFooter>
          </ModalContent>
      </Modal>
      <Container maxW="container.xl" p={5} bg="green.50" borderRadius="md">
        <VStack spacing={4} align="stretch">
          <Heading color="green.600" mb={4}>Shopping Carts</Heading>
          <Button onClick={fetchData} colorScheme="green" mb={4}>
            Refresh Table
          </Button>
          {itemsData.map(item => (
            <Box key={item.chatId} bg="green.100" p={4} borderRadius="md" mb={4}>
              <Heading size="md" color="green.700" mb={3}>Coversation ID: {item.chatId}</Heading>
              <Table variant="striped" colorScheme="green" size="sm">
                <Thead>
                  <Tr>
                    <Th>Products</Th>
                    <Th>Quantity</Th>
                    <Th>Unit price</Th>
                    <Th>Total price</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{item.itemName}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{item.price}</Td>
                    <Td>{item.price * item.quantity}</Td>
                  </Tr>
                </Tbody>
              </Table>
              <Text mt={3} fontWeight="bold" color="green.700">
                Total Amount: {item.price * item.quantity}
              </Text>
              <Button colorScheme="green" mt={4} onClick={() => handleConfirmPurchase(item.chatId)} float="right">
                Confirm Purchase
              </Button>
            </Box>
          ))}
        </VStack>
      </Container>
    </>
  );
});

export default function IndexPage() {
    return (
        <Page
            renderChildren={({ deep, deviceLinkId }) => (
                <SellerWorkspace />
            )}
        />
    );
}

const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

