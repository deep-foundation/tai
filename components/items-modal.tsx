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
          
</div>
    </Modal>
);
};

export default ItemsModal;