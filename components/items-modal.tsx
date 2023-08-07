// components/ItemsModal.js
// import qr code
import React, { useState } from 'react';
import Modal from 'react-modal';

const ItemsModal = ({ isOpen, onRequestClose, items }) => {
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
    </div>
  )}

</div>
    </Modal>
);
};

export default ItemsModal;