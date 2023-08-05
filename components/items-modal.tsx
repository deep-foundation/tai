// components/ItemsModal.js

import React from 'react';
import Modal from 'react-modal';

const ItemsModal = ({ isOpen, onRequestClose, items }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Items"
        >
            {items.map((item, index) => (
                <div key={index}>
                    <img src={item.image} alt={item.name} />
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p>{item.price}</p>
                    <button>Add to Cart</button>
                </div>
            ))}
            <button onClick={onRequestClose}>Close</button>
            <button style={{ position: 'absolute', right: 0, bottom: 0 }}>Buy</button>
        </Modal>
    );
};

export default ItemsModal;
