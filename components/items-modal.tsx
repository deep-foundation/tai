// components/ItemsModal.js
// import qr code
import React, { useState } from 'react';
import Modal from 'react-modal';

const ItemsModal = ({ isOpen, onRequestClose, items }) => {
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeValue, setQRCodeValue] = useState('');

    const handleBuy = () => {
        setQRCodeValue('newconversationlink');
        setShowQRCode(true);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Items"
        >
            {/* {showQRCode && <QRCode value={qrCodeValue} />} */}

{items.map((item) => (
  <div key={item.id}>
    <img src={item.imageUrl} alt={item.itemName} width="100" height="100" />
    <h2>{item.itemName}</h2>
    <p dangerouslySetInnerHTML={{ __html: item.description }} />
    <p>Price: {item.price || 'N/A'}</p>
    <button onClick={handleBuy}>Add to Cart</button>
  </div>
))}
            <button onClick={onRequestClose} style={{ position: 'absolute', right: 0, bottom: 0 }}>Buy</button>
        </Modal>
    );
};

export default ItemsModal;