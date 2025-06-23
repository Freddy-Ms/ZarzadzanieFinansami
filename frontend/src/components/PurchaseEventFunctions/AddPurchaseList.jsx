import React, { useState } from 'react';

const AddPurchaseList = ({ onClose, onCreated }) => {
    const [showEditModal, setShowEditModal] = useState(false);

    const handleCreate = () => {
        onCreated(); // odśwież dane w rodzicu
        onClose();   // zamknij wszystko
    };

    const handleEdit = () => {
        setShowEditModal(true); // pokaż drugi modal
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        onClose();
    };

    return (
        <>
            {/* Pierwszy modal */}
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Dodaj listę zakupów</h2>
                    <CreateModal onCreate={handleCreate} onEdit={handleEdit} />
                    <button onClick={onClose}>Anuluj</button>
                </div>
            </div>

            {/* Drugi modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edytuj szczegóły</h2>
                        <EditModal onClose={handleEditClose} />
                    </div>
                </div>
            )}
        </>
    );
};

export default AddPurchaseList;
