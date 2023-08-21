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
    Container
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
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    let deep = useDeep();
  
    const shoppingCart = [
        {
          "id": "07d9b602-dfb4-4034-8524-43d7b22f7bba",
          "form": "SQUARE",
          "color": "BLUE",
          "handle": "gdfgfd",
          "tax_ids": [],
          "quantity": 2,
          "variants": [
            {
              "sku": "10000",
              "cost": 5423,
              "stores": [
                {
                  "price": 534,
                  "store_id": "db8366ce-165c-498a-b82a-4bc7f47a2202",
                  "low_stock": null,
                  "pricing_type": "FIXED",
                  "optimal_stock": null,
                  "available_for_sale": true
                }
              ],
              "barcode": null,
              "item_id": "07d9b602-dfb4-4034-8524-43d7b22f7bba",
              "created_at": "2023-08-20T01:43:25.000Z",
              "deleted_at": null,
              "updated_at": "2023-08-20T01:43:25.000Z",
              "variant_id": "b0f43205-99ef-45ac-94d3-bdb92b0d56bd",
              "default_price": 534,
              "option1_value": null,
              "option2_value": null,
              "option3_value": null,
              "purchase_cost": null,
              "default_pricing_type": "FIXED",
              "reference_variant_id": null
            }
          ],
          "image_url": null,
          "item_name": "gdfgfd",
          "components": [],
          "created_at": "2023-08-20T01:43:25.000Z",
          "deleted_at": null,
          "updated_at": "2023-08-20T01:43:25.000Z",
          "category_id": "751354dd-cd64-4f41-a047-436f11a25576",
          "description": "<p>gfdgdfgfd</p>",
          "track_stock": false,
          "is_composite": false,
          "modifier_ids": [],
          "option1_name": null,
          "option2_name": null,
          "option3_name": null,
          "reference_id": null,
          "sold_by_weight": false,
          "use_production": false,
          "primary_supplier_id": null
        }
      ];
      
      const itemsData = extractShoppingCartData(shoppingCart);
      const totalPrice = calculateTotalPrice(itemsData);
      
      console.log(itemsData); 
      console.log(totalPrice); 
      
    const handleAddToCheck = () => {
      
    };

    const defaultChatId = "123456"; 

    return (
        <Container maxW="container.xl" p={5} bg="green.50" borderRadius="md">
            <VStack spacing={4} align="stretch">
                <Heading color="green.600" mb={4}>Shopping Cart</Heading>
                <Table variant="striped" colorScheme="green">
                    <Thead>
                        <Tr>
                            <Th>Coversation ID</Th>
                            <Th>Products</Th>
                            <Th>Quantity</Th>
                            <Th>Price</Th>
                            <Th>Total price</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {itemsData.map((item, index) => (
                            <Tr key={index}>
                                <Td>{defaultChatId}</Td>
                                <Td>{item.itemName}</Td>
                                <Td>{item.quantity}</Td>
                                <Td>{item.price}</Td>
                                <Td>{item.price * item.quantity}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                <Box mt={4} bg="green.100" p={3} borderRadius="md">
                    <Text fontWeight="bold" color="green.700">Итого: {totalPrice}</Text>
                </Box>
            </VStack>
        </Container>
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

const extractShoppingCartData = (cart) => {
    return cart.map(item => ({
        itemName: item.item_name,
        quantity: item.quantity,
        price: item.variants?.[0]?.default_price || 0,
    }));
};

const calculateTotalPrice = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};