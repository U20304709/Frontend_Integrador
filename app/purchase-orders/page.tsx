'use client';
import React, { useState, useEffect, useCallback } from 'react';
import IPurchaseOrder from '../types/purchaseOrder.type';
import PurchaseOrderService from '../services/purchaseOrder.service';
import StoreService from '../services/store.service';
import AddStoreModal from './AddStoreModal';
import ShowModalBtn from '../components/ShowModalBtn';
import PurchaseOrderList from './PurchaseOrderList';
import IStore from '../types/store.type';
import IOrderStatus from '../types/orderStatus.type';
import Select from 'react-tailwindcss-select';
import { useRouter, usePathname } from 'next/navigation';

const Page = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<IPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [newPOModalOpen, setnewPOModalOpen] = useState(false);

  const [params, setParams] = useState({ store: '', status: '' });
  const [filteredOrders, setFilteredOrders] = useState<IPurchaseOrder[]>([]);
  const [storeOptions, setStoreOptions] = useState<IStore[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const fetchPurchaseOrders = async () => {
      try {
        const response = await PurchaseOrderService.getAllPurchaseOrders();
        setPurchaseOrders(response.data);
        setFilteredOrders(response.data);
        setError('');
      } catch (error: any) {
        const errMsg = error.response?.data?.message
          ? error.response.data.message
          : 'Unable to fetch PurchaseOrders';
        setError(errMsg);
      }
      setLoading(false);
    };
    fetchPurchaseOrders();

    const fetchStores = async () => {
      try {
        const response = await StoreService.getAllStores();
        setStoreOptions(response.data);
        setError('');
      } catch (error: any) {
        const errMsg = error.response?.data?.message
          ? error.response.data.message
          : 'Unable to fetch store options';
        setError(errMsg);
      }
    };
    fetchStores();

    // Extract initial query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const store = searchParams.get('store') || '';
    const status = searchParams.get('status') || '';
    setParams({ store, status });
  }, []);

  useEffect(() => {
    setFilteredOrders(() => {
      return purchaseOrders.filter((po) => {
        let show = true;
        if (params.status && po.status !== params.status) {
          show = false;
        }
        if (params.store && po.store?.name !== params.store) {
          show = false;
        }
        return show;
      });
    });
  }, [purchaseOrders, params]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set(name, value);
      return currentParams.toString();
    },
    []
  );

  const resetFilter = () => {
    router.push(pathname);
    setParams({ store: '', status: '' });
    setFilteredOrders(purchaseOrders);
  };

  const updateRoute = ({ name, value }: any) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}?${queryString}`);
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const displayNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification('');
    }, 5000);
  };

  const toggleNewPOModal = () => {
    setnewPOModalOpen((prev) => !prev);
  };

  const createNewPO = async (store: IStore) => {
    try {
      const createdPurchaseOrder = await PurchaseOrderService.createPurchaseOrder({ store });
      setPurchaseOrders((prev) => [...prev, createdPurchaseOrder.data]);
      displayNotification('Purchase Order added successfully');
    } catch (error: any) {
      const errMsg = error.response?.data?.message
        ? error.response.data.message
        : 'Unable to create purchase order';
      setError(errMsg);
    }
  };

  const updatePurchaseOrders = async (purchaseOrder: IPurchaseOrder, action: { type: string }) => {
    if (!purchaseOrder.id) return;
    switch (action.type) {
      case 'DELETE':
        try {
          await PurchaseOrderService.deletePurchaseOrder(purchaseOrder.id);
          setPurchaseOrders((prev) => prev.filter((po) => po.id !== purchaseOrder.id));
          displayNotification('Purchase Order deleted successfully');
        } catch (error: any) {
          const errMsg = error.response?.data?.message
            ? error.response.data.message
            : 'Unable to delete';
          setError(errMsg);
        }
        break;
      case 'UPDATE':
        try {
          const res = await PurchaseOrderService.updatePurchaseOrder(purchaseOrder.id, purchaseOrder);
          setPurchaseOrders((prev) =>
            prev.map((po) => (po.id === purchaseOrder.id ? res.data : po))
          );
          displayNotification('Purchase Order updated successfully');
        } catch (error: any) {
          const errMsg = error.response?.data?.message
            ? error.response.data.message
            : 'Unable to update purchase order';
          setError(errMsg);
        }
        break;
      default:
        break;
    }
  };

  return (
    <>
      {loading && <div className="block loading loading-bars loading-lg mb-2"></div>}
      {error && <div className="alert alert-danger mb-2">{error}</div>}
      {notification && (
        <div onClick={() => setNotification('')} className="toast toast-end toast-bottom z-50">
          <div className="alert alert-info text-white p-2">{notification}</div>
        </div>
      )}
      <div className="flex justify-between">
        <ShowModalBtn text="Crear Órden de Tienda" toggleModal={toggleNewPOModal} style="btn-accent" />
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-500">Filtrar por Tienda</label>
            <Select
              placeholder="Seleccionar Tienda..."
              value={params.store ? { value: params.store, label: params.store } : null}
              primaryColor="indigo"
              onChange={(data: any) => updateRoute({ name: 'store', value: data?.value })}
              options={storeOptions.map((option) => ({ value: option.name, label: option.name }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Filtrar por Estado</label>
            <Select
              placeholder="Select Status..."
              value={params.status ? { value: params.status, label: params.status } : null}
              primaryColor="indigo"
              onChange={(data: any) => updateRoute({ name: 'status', value: data?.value })}
              options={Object.values(IOrderStatus).map((option) => ({ value: option, label: option }))}
            />
          </div>
          <button onClick={resetFilter} className="btn btn-md">
            Reset
          </button>
        </div>
      </div>
      <AddStoreModal
        store={null}
        open={newPOModalOpen}
        toggleModal={toggleNewPOModal}
        addStore={createNewPO}
      />
      <PurchaseOrderList
        purchaseOrders={filteredOrders}
        updatePurchaseOrders={updatePurchaseOrders}
      />
    </>
  );
};

export default Page;
