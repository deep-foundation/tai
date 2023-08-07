// components/ItemsModal.js
// import qr code
import React, { useState } from 'react';
import Modal from 'react-modal';

const ItemsModal = ({ isOpen, addToCart, onRequestClose, items, style, chatNumber }) => {
    const handleBuy = () => {
    setShowChatNumber(true);
  };
  return (
      
    <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Items"
        style={style}
    >
        {/* {showQRCode && <QRCode value={qrCodeValue} />} */}
        <div style={{width: '100%', height: '100%', overflowY: 'auto' }}>
          
        <div style={{
display: 'flex',
flexDirection: 'column',
alignItems: 'center',
justifyContent: 'center',
backgroundColor: '#2a5d34',
width: '70%',
margin: 'auto',
padding: '20px',
zIndex:1001,
overflowY: 'auto',
}}>
{items.map((item, index) => (
<div key={item.id} style={{
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: index % 2 === 0 ? '#E8F5E9' : '#F1F8E9',
  borderRadius: '15px',
  width: '80%',
  margin: '15px',
  padding: '15px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: '0.3s'
}}>

    </div>
  )}

</div>
    </Modal>
);
};

export default ItemsModal;