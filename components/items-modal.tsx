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
  <button onClick={addToCart} style={{
    background: 'linear-gradient(90deg, #388E3C, #4CAF50)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '25px', 
    border: '2px solid #2E7D32', 
    cursor: 'pointer',
    fontSize: '1.2rem',
    transition: '0.3s',
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '120px' 
  }}
    onMouseOver={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)'; 
      e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.2)'; 
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.transform = 'scale(1)'; 
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; 
    }}
  >
    <span style={{ fontSize: '1.5rem' }}>🛒</span> Add to Cart
  </button>
</div>
))}

</div>


<button onClick={onRequestClose} style={{
position: 'absolute',
right: '7px',
top: '7px',
border: '2px solid #4caf50', 
borderRadius: '50%', 
background: 'transparent',
fontSize: '1rem', 
cursor: 'pointer',
color: '#4caf50', 
padding: '5px', 
transition: '0.3s', 
width: '20px',
height: '20px',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
}}
onMouseOver={(e) => {
e.currentTarget.style.color = '#80e27e'; 
e.currentTarget.style.borderColor = '#80e27e'; 
}}
onMouseOut={(e) => {
e.currentTarget.style.color = '#4caf50'; 
e.currentTarget.style.borderColor = '#4caf50'; 
}}
>
x
</button>

<button onClick={handleBuy} style={{
background: 'linear-gradient(45deg, #006400, #228B22)', 
color: 'white', 
padding: '15px 30px', 
borderRadius: '40px', 
border: 'none', 
cursor: 'pointer',
fontSize: '1.4rem', 
fontWeight: 'bold', 
boxShadow: '0 0 15px rgba(0, 0, 0, 0.3)', 
position: 'absolute',
right: '40px',
bottom: '20px',
zIndex: 1001,
transition: '0.3s'
}}
onMouseOver={(e) => {
e.currentTarget.style.backgroundColor = '#4CAF50';
e.currentTarget.style.transform = 'scale(1.08)'; 
e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.4)'; 
}}
onMouseOut={(e) => {
e.currentTarget.style.backgroundColor = '#006400'; 
e.currentTarget.style.transform = 'scale(1)'; 
e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.3)'; 
}}
>
Buy
</button>

    </div>
  )}

</div>
    </Modal>
);
};

export default ItemsModal;