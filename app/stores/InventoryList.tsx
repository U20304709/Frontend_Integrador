import React from 'react'
import IInventory from '../types/inventory.type'
import Inventory from './Inventory'

// TODO include type

const InventoryList = ({ inventories, updateInventories, showEdit }: any) => {
  return (
    <>
      <p className='text-center font-semibold'>INVENTARIO DE LA TIENDA</p>
      <div className="my-8 overflow-x-auto">
        <div className="flex shadow border-b">
          <table className="min-w-full table">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  PRODUCTO
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  PRECIO
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  CANTIDAD
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  CATEGORÍA
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  UMBRAL
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2">
                  ÚLTIMA ACTUALIZACIÓN
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wide py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {inventories?.map((inventory: IInventory) => (
                <Inventory
                  inventory={inventory}
                  key={inventory.id}
                  updateInventories={updateInventories}
                  showEdit={showEdit}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default InventoryList