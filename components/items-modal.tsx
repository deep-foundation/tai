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
<img 
src={item.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><text x="50" y="60" font-family="Arial" font-size="40" text-anchor="middle" fill="white">?</text></svg>'} 
alt={item.itemName} 
width="100" 
height="100" 
style={{ borderRadius: '10px' }} 
/>
  <div style={{ flex: 1, marginLeft: '15px' }}>
    <h2 style={{ fontSize: '1.4rem', color: '#388E3C', marginBottom: '5px' }}>{item.itemName}</h2>
    <p style={{ fontSize: '1.1rem', color: '#2E7D32', fontWeight: 'bold' }}>Price: {item.price || 'N/A'}</p>
  </div>
  
    </div>
  )}

</div>
    </Modal>
);
};

export default ItemsModal;