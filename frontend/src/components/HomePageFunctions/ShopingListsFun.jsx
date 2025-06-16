import React, { useState, useEffect } from 'react';

function ShoppingLists() {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/shoppinglist/get", {
      method: 'GET',
      credentials: 'include', // wysyłaj ciasteczka (np. z tokenem)
    })
      .then(res => {
        if (!res.ok) throw new Error('Nie udało się pobrać list');
        return res.json();
      })
      .then(data => {
        console.log('Dane z backendu:', data);
        // jeśli backend zwraca błąd w formie { error: 'msg' }
        if (Array.isArray(data)) {
          setLists(data);
          setError(null);
        } else if (data.error) {
          setError(data.error);
          setLists([]);
        } else {
          setError('Nieznany format danych z serwera');
          setLists([]);
        }
      })
      .catch(err => {
        setError(err.message);
        setLists([]);
      });
  }, []);

  return (
    <div style={{ color: 'black' }}>
      <h3>Shopping Lists:</h3>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!error && lists.length === 0 && <p>Brak list zakupów do wyświetlenia.</p>}
      <ul>
        {lists.map(list => (
          <li key={list.id}>{list.name}</li>
        ))}
      </ul>
      <button onClick={handleAddList} style={{ marginTop: '1rem' }}>
        Add Shopping List
      </button>
    </div>
  );
}

const handleAddList = () => {
    alert('Tu dodaj funkcję tworzenia nowej listy zakupów');
  };

export default ShoppingLists;
