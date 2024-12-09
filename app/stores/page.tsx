'use client';
import React, { useState, useEffect } from 'react';
import EditStore from './EditStore';
import StoreList from './StoreList';
import IStore from '../types/store.type';
import StoreService from '../services/store.service';
import IStoreType from '../types/storeType.type';
import ShowModalBtn from '../components/ShowModalBtn';
import ViewStorePage from './ViewStorePage';
import SearchField from './SearchField';
import { useUserContext } from '../context/user';

const initialState: IStore = {
  name: "",
  email: "",
  phone: "",
  address: "",
  type: IStoreType.RETAIL,
  openingDate: new Date().toLocaleDateString()
};

const Page = () => {
  const [stores, setStores] = useState<IStore[]>([]);
  const { user } = useUserContext() || { user: undefined };
  const [storesToShow, setStoresToShow] = useState<IStore[]>([]);
  const [showMyStores, setShowMyStores] = useState(true);
  const [storeToUpdate, setStoreToUpdate] = useState<IStore>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [filterParams, setFilterParams] = useState({});
  const [typeList, setTypeList] = useState<IStoreType[]>([]);

  // Extract 'store' parameter from the URL
  const inViewStore = (() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('store');
    }
    return null;
  })();

  useEffect(() => {
    setLoading(true);
    const fetchStores = async () => {
      try {
        const response = await StoreService.getFilteredStores(filterParams);
        setStores(response.data);
        const newTypeList = response.data.map((store: IStore) => store.type);
        if (typeList.length < newTypeList.length) setTypeList(newTypeList);
        setError('');
      } catch (error: any) {
        const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to fetch stores';
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filterParams, typeList.length]);

  useEffect(() => {
    if (showMyStores && !user?.admin) {
      setStoresToShow(user?.stores || []);
    } else {
      setStoresToShow(stores);
    }
  }, [showMyStores, user, stores]);

  const deleteStore = async (id: number) => {
    try {
      await StoreService.deleteStore(id);
      setStores((stores) => stores.filter((store: IStore) => store.id !== id));
      displayNotification('Store deleted successfully');
      setError('');
    } catch (error: any) {
      const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to delete store';
      setError(errMsg);
    }
  };

  const displayNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 5000);
  };

  const handleUpdateStore = async (store: IStore) => {
    try {
      if (store.id) {
        const updatedStore = await StoreService.updateStore(store.id, store);
        setStores((stores) =>
          stores.map((s: IStore) => (s.id === updatedStore.data.id ? updatedStore.data : s))
        );
        displayNotification('Store updated successfully');
      } else {
        const createdStore = await StoreService.createStore(store);
        setStores((stores) => [...stores, createdStore.data]);
        displayNotification('Store added successfully');
      }
      setError('');
    } catch (error: any) {
      const errMsg = error.response?.data?.message ? error.response.data.message : 'Unable to update store';
      setError(errMsg);
    }

    toggleModal();
    setStoreToUpdate(initialState);
  };

  const editStore = (store: IStore) => {
    setStoreToUpdate(store);
    toggleModal();
  };

  const toggleModal = () => {
    setEditMode((prev) => !prev);
    if (!editMode) setStoreToUpdate(initialState);
  };

  const toggleShowMyStores = () => {
    if (showMyStores) {
      setShowMyStores(false);
      setStoresToShow(stores);
    } else {
      setStoresToShow(user?.stores || []);
      setShowMyStores(true);
    }
  };

  // Display personalized store page if store name param is present
  if (inViewStore) {
    const store = stores.find((store) => store.name === inViewStore);
    const storeWithId = user?.stores?.find((s) => s.id === store?.id);
    return <ViewStorePage store={store} isMyStore={!!storeWithId} />;
  }

  // Display all stores page if no store name param is present
  return (
    <div>
      {notification && (
        <div onClick={() => setNotification('')} className="toast toast-end toast-bottom z-50">
          <div className="alert alert-info text-white p-2">{notification}</div>
        </div>
      )}
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {loading && <div className="loading loading-bars loading-lg mb-2"></div>}
      <div>
        {user?.admin && (
          <ShowModalBtn text="Add Store" toggleModal={toggleModal} style="btn-accent" />
        )}
        <SearchField typeList={typeList} filterParams={filterParams} setFilterParams={setFilterParams} />
        {!user?.admin && (
          <button onClick={toggleShowMyStores} className="btn btn-xs btn-primary">
            {showMyStores ? 'Show All Stores' : 'Show My Stores'}
          </button>
        )}
      </div>

      <StoreList stores={storesToShow} editStore={editStore} deleteStore={deleteStore} />
      <EditStore
        store={storeToUpdate}
        handleUpdateStore={handleUpdateStore}
        open={editMode}
        toggleModal={toggleModal}
      />
    </div>
  );
};

export default Page;
